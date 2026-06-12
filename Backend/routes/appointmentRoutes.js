import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireDoctor, requirePatient } from "../middlewares/roleMiddleware.js";
import Appointment from "../models/Appointment.js";
import User from "../models/userModel.js";
import Profile from "../models/Profile.js";

const router = express.Router();

const DAY_NAME_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const parseTimeToMinutes = (timeValue) => {
  if (!timeValue || typeof timeValue !== "string") return null;
  const normalized = timeValue.trim().toLowerCase().replace(/\s+/g, " ");
  const match12h = normalized.match(/^(\d{1,2}):(\d{2})\s?(am|pm)$/i);
  const match24h = normalized.match(/^(\d{1,2}):(\d{2})$/);

  let hour;
  let minute;

  if (match12h) {
    hour = Number(match12h[1]);
    minute = Number(match12h[2]);
    const meridiem = match12h[3].toLowerCase();
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "am") {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }
  } else if (match24h) {
    hour = Number(match24h[1]);
    minute = Number(match24h[2]);
  } else {
    return null;
  }

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
};

const splitConsultationTimings = (timings) => {
  const normalized = String(timings || "")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = normalized.split(" - ").map((value) => value.trim());
  if (parts.length !== 2) return [];
  return parts;
};

const buildSlotTimes = (startMinutes, endMinutes, stepMinutes = 30) => {
  const slots = [];
  for (let minute = startMinutes; minute + stepMinutes <= endMinutes; minute += stepMinutes) {
    const hourPart = String(Math.floor(minute / 60)).padStart(2, "0");
    const minPart = String(minute % 60).padStart(2, "0");
    slots.push(`${hourPart}:${minPart}`);
  }
  return slots;
};

const getLocalDateString = (dateObj) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getWeekDayIndexFromDate = (dateString) => {
  const dateObj = new Date(`${dateString}T00:00:00`);
  return dateObj.getDay();
};

const findNextWorkingDate = (startDateString, workingDayIndexes) => {
  const startDate = new Date(`${startDateString}T00:00:00`);
  for (let offset = 1; offset <= 30; offset += 1) {
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + offset);
    if (workingDayIndexes.has(nextDate.getDay())) {
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(nextDate.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return "";
};

const findNextAvailableDate = async ({
  fromDateString,
  doctorId,
  workingDayIndexes,
  slotTimes,
}) => {
  const startDate = new Date(`${fromDateString}T00:00:00`);
  for (let offset = 1; offset <= 45; offset += 1) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + offset);
    if (!workingDayIndexes.has(currentDate.getDay())) continue;

    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getDate()).padStart(2, "0");
    const dateString = `${yyyy}-${mm}-${dd}`;
    const start = new Date(`${dateString}T00:00:00`);
    const end = new Date(`${dateString}T23:59:59.999`);
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: start, $lte: end },
      status: { $in: ["pending", "done"] },
    }).select("appointmentDate");

    const bookedSet = new Set(
      bookedAppointments.map((item) => new Date(item.appointmentDate).toISOString())
    );
    const hasOpenSlot = slotTimes.some((timeStr) => {
      const slotIso = new Date(`${dateString}T${timeStr}:00`).toISOString();
      return !bookedSet.has(slotIso);
    });
    if (hasOpenSlot) return dateString;
  }
  return "";
};

const getAvailableSlotsForDate = async ({
  doctorId,
  dateString,
  workingDayIndexes,
  slotTimes,
}) => {
  if (!workingDayIndexes.has(getWeekDayIndexFromDate(dateString))) return [];

  const start = new Date(`${dateString}T00:00:00.000Z`);
  const end = new Date(`${dateString}T23:59:59.999`);
  const bookedAppointments = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: start, $lte: end },
    status: { $in: ["pending", "done"] },
  }).select("appointmentDate");

  const bookedSet = new Set(
    bookedAppointments.map((item) => new Date(item.appointmentDate).toISOString())
  );

  return slotTimes
    .map((timeStr) => {
      const slotDate = new Date(`${dateString}T${timeStr}:00`);
      const iso = slotDate.toISOString();
      return { dateTime: iso, available: !bookedSet.has(iso) };
    })
    .filter((slot) => slot.available);
};

const generateAppointmentPublicId = async () => {
  const year = new Date().getFullYear();
  const prefix = `APT-${year}-`;

  const latestForYear = await Appointment.findOne({
    appointmentPublicId: { $regex: `^${prefix}` },
  })
    .sort({ appointmentPublicId: -1 })
    .select("appointmentPublicId")
    .lean();

  let nextSequence = 1;
  if (latestForYear?.appointmentPublicId) {
    const sequencePart = latestForYear.appointmentPublicId.split("-")[2];
    const parsedSequence = Number(sequencePart);
    if (!Number.isNaN(parsedSequence) && parsedSequence > 0) {
      nextSequence = parsedSequence + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
};

router.post("/", authMiddleware, requireDoctor, async (req, res) => {
  try {
    return res.json({
      success: false,
      message: "Doctors cannot add appointments manually",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get("/doctor", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { doctorId: req.userId, doctorDeleted: { $ne: true } };

    if (status && status !== "all") {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter).sort({
      appointmentDate: 1,
    });

    const patientIds = Array.from(
      new Set(
        appointments
          .map((item) => String(item.patientId || ""))
          .filter(Boolean)
      )
    );
    const patientProfiles = await Profile.find({ userId: { $in: patientIds } })
      .select("userId phone")
      .lean();
    const phoneMap = new Map(
      patientProfiles.map((profile) => [String(profile.userId), profile.phone || ""])
    );
    const appointmentsWithContact = appointments.map((item) => ({
      ...item.toObject(),
      patientPhone: phoneMap.get(String(item.patientId || "")) || "",
    }));

    return res.json({ success: true, appointments: appointmentsWithContact });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get("/doctor/history", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const { status } = req.query;
    const baseFilter = {
      doctorId: req.userId,
      doctorDeleted: { $ne: true },
      status: { $in: ["done", "rejected", "cancelled"] },
    };

    if (status && ["done", "rejected", "cancelled"].includes(status)) {
      baseFilter.status = status;
    }

    const appointments = await Appointment.find(baseFilter).sort({
      updatedAt: -1,
    });

    const patientIds = Array.from(
      new Set(
        appointments
          .map((item) => String(item.patientId || ""))
          .filter(Boolean)
      )
    );
    const patientProfiles = await Profile.find({ userId: { $in: patientIds } })
      .select("userId phone")
      .lean();
    const phoneMap = new Map(
      patientProfiles.map((profile) => [String(profile.userId), profile.phone || ""])
    );
    const historyWithContact = appointments.map((item) => ({
      ...item.toObject(),
      patientPhone: phoneMap.get(String(item.patientId || "")) || "",
    }));

    return res.json({ success: true, appointments: historyWithContact });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get("/doctors", authMiddleware, requirePatient, async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "_id name email createdAt doctorId"
    );

    const doctorIds = doctors.map((doctor) => doctor._id);

    const [profiles, ratingStats] = await Promise.all([
      Profile.find({ userId: { $in: doctorIds } }).lean(),
      Appointment.aggregate([
        {
          $match: {
            doctorId: { $in: doctorIds },
            rating: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$doctorId",
            avgRating: { $avg: "$rating" },
            ratingCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const profileMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile])
    );
    const ratingsMap = new Map(
      ratingStats.map((item) => [String(item._id), item])
    );

    const doctorCards = doctors.map((doctor) => {
      const profile = profileMap.get(String(doctor._id));
      const ratings = ratingsMap.get(String(doctor._id));
      const specialty = profile?.specialization || "";

      return {
        _id: doctor._id,
        doctorId: doctor.doctorId || "",
        name: profile?.fullName || doctor.name,
        email: doctor.email,
        phone: profile?.phone || "",
        address:
          profile?.clinicAddress ||
          profile?.address ||
          profile?.cityState ||
          "",
        image: profile?.profilePhoto || "",
        expertise: specialty,
        consultationCharge: Number(profile?.consultationFees || 0),
        avgRating: ratings?.avgRating ? Number(ratings.avgRating.toFixed(1)) : 0,
        ratingCount: ratings?.ratingCount || 0,
      };
    });

    return res.json({ success: true, doctors: doctorCards });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get("/doctor/:doctorId/details", authMiddleware, requirePatient, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctorUser = await User.findOne({ _id: doctorId, role: "doctor" }).select(
      "_id name email doctorId"
    );

    if (!doctorUser) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const [profile, ratingStats, patientsTreated] = await Promise.all([
      Profile.findOne({ userId: doctorId }).lean(),
      Appointment.aggregate([
        {
          $match: {
            doctorId: doctorUser._id,
            rating: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$doctorId",
            avgRating: { $avg: "$rating" },
            ratingCount: { $sum: 1 },
          },
        },
      ]),
      Appointment.distinct("patientId", {
        doctorId: doctorUser._id,
        status: { $in: ["pending", "done"] },
      }),
    ]);

    const rating = ratingStats?.[0];
    return res.json({
      success: true,
      doctor: {
        _id: doctorUser._id,
        doctorId: doctorUser.doctorId || "",
        name: profile?.fullName || doctorUser.name || "",
        email: doctorUser.email || "",
        phone: profile?.doctorPhone || profile?.phone || "",
        image: profile?.profilePhoto || "",
        specialization: profile?.specialization || "",
        qualification: profile?.degreesQualifications || "",
        experience: profile?.yearsOfExperience ?? null,
        hospitalClinicName: profile?.hospitalClinicName || "",
        location: profile?.clinicAddress || profile?.cityState || profile?.address || "",
        consultationFees: profile?.consultationFees ?? null,
        workingDays: Array.isArray(profile?.workingDays) ? profile.workingDays : [],
        consultationTimings: profile?.consultationTimings || "",
        rating: rating?.avgRating ? Number(rating.avgRating.toFixed(1)) : 0,
        ratingCount: rating?.ratingCount || 0,
        languagesSpoken: Array.isArray(profile?.languagesSpoken)
          ? profile.languagesSpoken
          : [],
        consultationMode: profile?.consultationMode || "",
        aboutDoctor: profile?.shortBio || "",
        educationCertifications: profile?.achievementsCertifications || "",
        patientsTreated: patientsTreated.length,
        emergencyAvailability: profile?.emergencyAvailability || "",
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get(
  "/doctor/:doctorId/available-dates",
  authMiddleware,
  requirePatient,
  async (req, res) => {
    try {
      const { doctorId } = req.params;
      const days = Math.min(Number(req.query.days || 45), 90);

      const [doctor, profile] = await Promise.all([
        User.findOne({ _id: doctorId, role: "doctor" }),
        Profile.findOne({ userId: doctorId }).lean(),
      ]);

      if (!doctor) {
        return res.json({ success: false, message: "Doctor not found" });
      }
      if (!profile) {
        return res.json({ success: false, message: "Doctor profile not found" });
      }

      const workingDayIndexes = new Set(
        (Array.isArray(profile.workingDays) ? profile.workingDays : [])
          .map((day) => DAY_NAME_TO_INDEX[String(day || "").trim().toLowerCase()])
          .filter((value) => value !== undefined)
      );

      const timingParts = splitConsultationTimings(profile.consultationTimings);
      if (timingParts.length !== 2) {
        return res.json({
          success: false,
          message: "Doctor consultation timings are not configured",
        });
      }

      const fromMinutes = parseTimeToMinutes(timingParts[0]);
      const toMinutes = parseTimeToMinutes(timingParts[1]);
      if (fromMinutes === null || toMinutes === null || toMinutes <= fromMinutes) {
        return res.json({
          success: false,
          message: "Doctor consultation timings are invalid",
        });
      }

      const slotTimes = buildSlotTimes(fromMinutes, toMinutes, 30);
      const availableDates = [];
      const today = new Date();

      for (let offset = 0; offset <= days; offset += 1) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + offset);
        const yyyy = targetDate.getFullYear();
        const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
        const dd = String(targetDate.getDate()).padStart(2, "0");
        const dateString = `${yyyy}-${mm}-${dd}`;
        const slots = await getAvailableSlotsForDate({
          doctorId,
          dateString,
          workingDayIndexes,
          slotTimes,
        });
        if (slots.length) availableDates.push(dateString);
      }

      return res.json({ success: true, availableDates });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  }
);

router.get("/doctor/:doctorId/slots", authMiddleware, requirePatient, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.json({ success: false, message: "Date is required" });
    }

    const [doctor, profile] = await Promise.all([
      User.findOne({ _id: doctorId, role: "doctor" }),
      Profile.findOne({ userId: doctorId }).lean(),
    ]);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    if (!profile) {
      return res.json({ success: false, message: "Doctor profile not found" });
    }

    const workingDays = Array.isArray(profile.workingDays)
      ? profile.workingDays
      : [];
    const workingDayIndexes = new Set(
      workingDays
        .map((day) => DAY_NAME_TO_INDEX[String(day || "").trim().toLowerCase()])
        .filter((value) => value !== undefined)
    );

    const timingParts = splitConsultationTimings(profile.consultationTimings);
    if (timingParts.length !== 2) {
      return res.json({
        success: false,
        message: "Doctor consultation timings are not configured",
      });
    }
    const fromMinutes = parseTimeToMinutes(timingParts[0]);
    const toMinutes = parseTimeToMinutes(timingParts[1]);
    if (fromMinutes === null || toMinutes === null || toMinutes <= fromMinutes) {
      return res.json({
        success: false,
        message: "Doctor consultation timings are invalid",
      });
    }

    const slotTimes = buildSlotTimes(fromMinutes, toMinutes, 30);
    if (!slotTimes.length) {
      return res.json({
        success: false,
        message: "No slot window available for this doctor",
      });
    }

    const isWorkingDate = workingDayIndexes.has(getWeekDayIndexFromDate(date));
    if (!isWorkingDate) {
      const nextAvailableDate = await findNextAvailableDate({
        fromDateString: date,
        doctorId,
        workingDayIndexes,
        slotTimes,
      });
      return res.json({
        success: true,
        slots: [],
        worksOnDate: false,
        nextWorkingDate: findNextWorkingDate(date, workingDayIndexes),
        nextAvailableDate,
      });
    }

    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);

    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: start, $lte: end },
      status: { $in: ["pending", "done"] },
    }).select("appointmentDate");

    const bookedSet = new Set(
      bookedAppointments.map((item) =>
        new Date(item.appointmentDate).toISOString()
      )
    );

    const slots = slotTimes.map((timeStr) => {
      const slotDate = new Date(`${date}T${timeStr}:00`);
      const iso = slotDate.toISOString();
      return {
        dateTime: iso,
        available: !bookedSet.has(iso),
      };
    });

    const hasAvailable = slots.some((slot) => slot.available);
    const nextAvailableDate = hasAvailable
      ? ""
      : await findNextAvailableDate({
          fromDateString: date,
          doctorId,
          workingDayIndexes,
          slotTimes,
        });

    return res.json({
      success: true,
      slots,
      worksOnDate: true,
      nextAvailableDate,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.post("/book", authMiddleware, requirePatient, async (req, res) => {
  try {
    const { doctorId, appointmentDate, reason } = req.body;
    const normalizedReason = (reason || "").trim();

    if (!doctorId || !appointmentDate) {
      return res.json({
        success: false,
        message: "Doctor and appointment date are required",
      });
    }
    if (!normalizedReason) {
      return res.json({
        success: false,
        message: "Reason is required",
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    const profile = await Profile.findOne({ userId: doctorId }).lean();
    if (!profile) {
      return res.json({ success: false, message: "Doctor profile not found" });
    }

    const patient = await User.findById(req.userId).select("name email patientId role");
    if (!patient || patient.role !== "patient") {
      return res.json({ success: false, message: "Patient account not found" });
    }
    const patientProfile = await Profile.findOne({ userId: req.userId }).lean();
    const isProfileComplete = Boolean(
      patientProfile &&
        String(patientProfile.fullName || "").trim() &&
        patientProfile.dateOfBirth &&
        String(patientProfile.gender || "").trim() &&
        String(patientProfile.bloodGroup || "").trim() &&
        String(patientProfile.phone || "").trim() &&
        String(patientProfile.address || "").trim()
    );
    if (!isProfileComplete) {
      return res.json({
        success: false,
        message:
          "Please create and complete your profile before booking an appointment.",
      });
    }
    const bookingPatientId = patient.patientId?.trim() || String(req.userId);


    const appointmentDateObj = new Date(appointmentDate);
    if (Number.isNaN(appointmentDateObj.getTime())) {
      return res.json({ success: false, message: "Invalid appointment date" });
    }

    const appointmentDateOnly = getLocalDateString(appointmentDateObj);
    const appointmentDayIndex = getWeekDayIndexFromDate(appointmentDateOnly);
    const workingDayIndexes = new Set(
      (Array.isArray(profile.workingDays) ? profile.workingDays : [])
        .map((day) => DAY_NAME_TO_INDEX[String(day || "").trim().toLowerCase()])
        .filter((value) => value !== undefined)
    );
    if (!workingDayIndexes.has(appointmentDayIndex)) {
      return res.json({
        success: false,
        message: "Doctor is not available on the selected day",
      });
    }

    const timingParts = splitConsultationTimings(profile.consultationTimings);
    const fromMinutes =
      timingParts.length === 2 ? parseTimeToMinutes(timingParts[0]) : null;
    const toMinutes =
      timingParts.length === 2 ? parseTimeToMinutes(timingParts[1]) : null;
    if (fromMinutes === null || toMinutes === null || toMinutes <= fromMinutes) {
      return res.json({
        success: false,
        message: "Doctor consultation timings are not configured properly",
      });
    }

    const slotTimes = buildSlotTimes(fromMinutes, toMinutes, 30);
    const selectedHour = String(appointmentDateObj.getHours()).padStart(2, "0");
    const selectedMinute = String(appointmentDateObj.getMinutes()).padStart(2, "0");
    const selectedTime = `${selectedHour}:${selectedMinute}`;
    if (!slotTimes.includes(selectedTime)) {
      return res.json({
        success: false,
        message: "Selected slot is outside doctor working hours",
      });
    }

    const conflict = await Appointment.findOne({
      doctorId,
      appointmentDate: appointmentDateObj,
      status: { $in: ["pending", "done"] },
    });

    if (conflict) {
      return res.json({
        success: false,
        message: "Selected slot is already booked",
      });
    }

    let appointment;
    for (let retry = 0; retry < 3; retry += 1) {
      const appointmentPublicId = await generateAppointmentPublicId();
      try {
        // appointment = await Appointment.create({
        //   doctorId,
        //   patientId: req.userId,
        //   patientBookingId: patient.patientId,
        //   appointmentPublicId,
        //   patientName: patient?.name || "Patient",
        //   patientEmail: patient?.email || "",
        //   appointmentDate: appointmentDateObj,
        //   reason: normalizedReason,
        // });

        appointment = await Appointment.create({
          doctorId,
          patientId: req.userId,
          patientBookingId: bookingPatientId,
          appointmentPublicId,
          patientName: patient?.name || "Patient",
          patientEmail: patient?.email || "",
          appointmentDate: appointmentDateObj,
          reason: normalizedReason,
        });

        break;
      } catch (createError) {
        if (createError?.code !== 11000) throw createError;
      }
    }

    if (!appointment) {
      return res.json({
        success: false,
        message: "Unable to generate booking ID. Please try again.",
      });
    }

    return res.json({ success: true, appointment });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});




router.get("/patient", authMiddleware, requirePatient, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.userId,
      patientDeleted: { $ne: true },
    })
      .populate("doctorId", "name email")
      .sort({ appointmentDate: -1 });

    return res.json({ success: true, appointments });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get("/:id/patient-details", authMiddleware, requirePatient, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.userId,
    }).populate("doctorId", "name email");

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    const doctorProfile = appointment.doctorId?._id
      ? await Profile.findOne({ userId: appointment.doctorId._id }).lean()
      : null;

    const patientProfile = await Profile.findOne({ userId: req.userId }).lean();

    return res.json({
      success: true,
      appointment,
      patientProfile: patientProfile
        ? {
            fullName: patientProfile.fullName || "",
            dateOfBirth: patientProfile.dateOfBirth || null,
            gender: patientProfile.gender || "",
            phone: patientProfile.phone || "",
          }
        : null,
      doctorProfile: doctorProfile
        ? {
            fullName: doctorProfile.fullName || "",
            profilePhoto: doctorProfile.profilePhoto || "",
            specialization: doctorProfile.specialization || "",
            degreesQualifications: doctorProfile.degreesQualifications || "",
            yearsOfExperience: doctorProfile.yearsOfExperience ?? null,
            hospitalClinicName: doctorProfile.hospitalClinicName || "",
            clinicAddress: doctorProfile.clinicAddress || "",
            cityState: doctorProfile.cityState || "",
            consultationFees: doctorProfile.consultationFees ?? null,
            consultationMode: doctorProfile.consultationMode || "",
            consultationTimings: doctorProfile.consultationTimings || "",
            doctorPhone: doctorProfile.doctorPhone || doctorProfile.phone || "",
            languagesSpoken: Array.isArray(doctorProfile.languagesSpoken)
              ? doctorProfile.languagesSpoken
              : [],
          }
        : null,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get("/:id/doctor-patient-details", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.userId,
    }).lean();

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    const [patientProfile, doctorProfile] = await Promise.all([
      appointment.patientId
        ? Profile.findOne({ userId: appointment.patientId }).lean()
        : null,
      Profile.findOne({ userId: req.userId }).lean(),
    ]);

    return res.json({
      success: true,
      appointment: {
        _id: appointment._id,
        appointmentPublicId: appointment.appointmentPublicId || "",
        patientBookingId: appointment.patientBookingId || "",
        patientName: appointment.patientName || "",
        patientEmail: appointment.patientEmail || "",
        appointmentDate: appointment.appointmentDate || null,
        reason: appointment.reason || "",
        status: appointment.status || "",
        consultationType: doctorProfile?.consultationMode || "",
      },
      patientProfile: patientProfile
        ? {
            fullName: patientProfile.fullName || "",
            dateOfBirth: patientProfile.dateOfBirth || null,
            gender: patientProfile.gender || "",
            phone: patientProfile.phone || "",
            bloodGroup: patientProfile.bloodGroup || "",
            medicalHistory: patientProfile.medicalHistory || "",
            allergies: Array.isArray(patientProfile.allergies)
              ? patientProfile.allergies
              : patientProfile.allergies
              ? [String(patientProfile.allergies)]
              : [],
            currentMedications:
              patientProfile.currentMedications ||
              (Array.isArray(patientProfile.medications)
                ? patientProfile.medications.join(", ")
                : ""),
          }
        : null,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.patch("/:id/patient-cancel", authMiddleware, requirePatient, async (req, res) => {
  try {
    const { reason } = req.body;
    const normalizedReason = (reason || "").trim();

    if (!normalizedReason) {
      return res.json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.userId,
      status: "pending",
    });

    if (!appointment) {
      return res.json({
        success: false,
        message: "Only pending appointments can be cancelled",
      });
    }

    appointment.status = "cancelled";
    appointment.patientStatusReason = normalizedReason;
    await appointment.save();

    return res.json({ success: true, appointment });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.get("/doctor/:doctorId/reviews", authMiddleware, requirePatient, async (req, res) => {
  try {
    const reviews = await Appointment.find({
      doctorId: req.params.doctorId,
      rating: { $ne: null },
      review: { $ne: "" },
    })
      .select("patientName rating review createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({ success: true, reviews });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.patch("/:id/review", authMiddleware, requirePatient, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const numericRating = Number(rating);

    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.userId,
      status: "done",
    });

    if (!appointment) {
      return res.json({
        success: false,
        message: "Only completed appointments can be reviewed",
      });
    }

    appointment.rating = numericRating;
    appointment.review = review || "";
    await appointment.save();

    return res.json({ success: true, appointment });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.delete("/:id", authMiddleware, requirePatient, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.userId,
    });

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (!["done", "cancelled", "rejected"].includes(appointment.status)) {
      return res.json({
        success: false,
        message: "Only done, cancelled, or rejected appointments can be deleted",
      });
    }

    appointment.patientDeleted = true;
    await appointment.save();
    return res.json({ success: true, message: "Appointment removed from your list" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.delete("/:id/doctor", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.userId,
    });

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    appointment.doctorDeleted = true;
    await appointment.save();
    return res.json({ success: true, message: "Appointment removed from your history" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

router.patch(
  "/:id/status",
  authMiddleware,
  requireDoctor,
  async (req, res) => {
    try {
      const { status, reason } = req.body;
      if (!["pending", "done", "rejected"].includes(status)) {
        return res.json({ success: false, message: "Invalid status" });
      }

      const normalizedReason = (reason || "").trim();
      if (status === "rejected" && !normalizedReason) {
        return res.json({
          success: false,
          message: "Reason is required for rejected status",
        });
      }

      const appointment = await Appointment.findOneAndUpdate(
        { _id: req.params.id, doctorId: req.userId },
        {
          status,
          doctorStatusReason: status === "rejected" ? normalizedReason : "",
        },
        { new: true }
      );

      if (!appointment) {
        return res.json({ success: false, message: "Appointment not found" });
      }

      return res.json({ success: true, appointment });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  }
);

export default router;
