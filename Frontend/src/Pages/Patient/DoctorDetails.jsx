import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import PageLoader from "../../components/PageLoader";

const fallbackDoctorImage = (doctorName) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    doctorName || "Doctor"
  )}&background=1d4ed8&color=ffffff&size=256&bold=true`;

const DoctorDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const { backendUrl, token } = useContext(AppContext);
  const [doctor, setDoctor] = useState(state?.doctor || null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [workingDateOptions, setWorkingDateOptions] = useState([]);
  const [isLoadingDateOptions, setIsLoadingDateOptions] = useState(false);
  const [nextAvailableDate, setNextAvailableDate] = useState("");
  const [slotNotice, setSlotNotice] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [reviewModal, setReviewModal] = useState({
    open: false,
    doctorName: "",
  });

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const doctorImage = useMemo(() => {
    const image = doctor?.image?.trim();
    if (!image) return fallbackDoctorImage(doctor?.name);
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:image")
    ) {
      return image;
    }
    const normalizedPath = image.startsWith("/") ? image : `/${image}`;
    try {
      return new URL(normalizedPath, backendUrl).toString();
    } catch {
      return `${backendUrl}${normalizedPath}`;
    }
  }, [doctor, backendUrl]);

  const getApiErrorMessage = (error, fallbackMessage) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return fallbackMessage;
  };

  const loadSlots = async (dateOverride) => {
    const targetDate = dateOverride || selectedDate;
    if (!doctor?._id || !targetDate) return;
    try {
      setIsLoadingSlots(true);
      setSlotNotice("");
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/doctor/${doctor._id}/slots?date=${targetDate}`,
        authHeader
      );
      if (data.success) {
        setSlots(data.slots || []);
        setSelectedSlot("");
        setNextAvailableDate(data.nextAvailableDate || "");
        if (data.worksOnDate === false) {
          setSlotNotice("Doctor is not working on this date.");
        } else if (!(data.slots || []).some((slot) => slot.available)) {
          setSlotNotice("All slots are booked on this date.");
        }
      } else {
        message.error(data.message || "Unable to load slots");
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, "Unable to load slots"));
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const loadDoctorDetails = async () => {
    if (!doctorId || !token) return;
    try {
      setIsLoadingDoctor(true);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/doctor/${doctorId}/details`,
        authHeader
      );
      if (data.success) {
        setDoctor(data.doctor || null);
      } else {
        message.error(data.message || "Unable to load doctor details");
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, "Unable to load doctor details"));
    } finally {
      setIsLoadingDoctor(false);
    }
  };

  const loadAvailableDates = async (doctorIdToLoad) => {
    if (!doctorIdToLoad || !token) return;
    try {
      setIsLoadingDateOptions(true);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/doctor/${doctorIdToLoad}/available-dates?days=45`,
        authHeader
      );
      if (data.success) {
        const dates = Array.isArray(data.availableDates) ? data.availableDates : [];
        setWorkingDateOptions(dates);
        setSelectedDate((prev) => (prev && dates.includes(prev) ? prev : dates[0] || ""));
      } else {
        message.error(data.message || "Unable to load available dates");
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, "Unable to load available dates"));
    } finally {
      setIsLoadingDateOptions(false);
    }
  };

  const loadReviews = async (doctorIdToLoad) => {
    if (!doctorIdToLoad) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/doctor/${doctorIdToLoad}/reviews`,
        authHeader
      );
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        message.error(data.message || "Unable to load reviews");
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, "Unable to load reviews"));
    }
  };

  const openReviewsModal = async () => {
    if (!doctor?._id) return;
    await loadReviews(doctor._id);
    setReviewModal({ open: true, doctorName: doctor.name || "Doctor" });
  };

  useEffect(() => {
    loadDoctorDetails();
  }, [doctorId, token]);

  useEffect(() => {
    if (!doctor?._id) {
      setWorkingDateOptions([]);
      setSelectedDate("");
      return;
    }
    loadAvailableDates(doctor._id);
  }, [doctor?._id, token]);

  useEffect(() => {
    if (!selectedDate || !doctor?._id) return;
    loadSlots(selectedDate);
  }, [selectedDate, doctor?._id]);

  const overallRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const handleBookSlot = async () => {
    // if (1!doctor?._id || !selectedSlot || isBooking) return;
    if (!selectedSlot || isBooking) return;
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      setReasonError("Reason is required");
      message.error("Please enter reason for appointment");
      return;
    }
    try {
      setIsBooking(true);
      const { data } = await axios.post(
        `${backendUrl}/api/appointments/book`,
        {
          doctorId: doctor._id,
          appointmentDate: selectedSlot,
          reason: normalizedReason,
        },
        authHeader
      );
      if (data.success) {
        message.success("Appointment booked successfully");
        setReason("");
        setReasonError("");
        navigate("/profile/Appointments", {
          state: {
            showReceiptForAppointmentId: data.appointment?._id || "",
          },
        });
      } else {
        if ((data.message || "").toLowerCase().includes("complete your profile")) {
          message.error("Please complete your profile first, then book appointment");
          navigate("/profile");
          return;
        }
        message.error(data.message || "Unable to book slot");
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, "Unable to book slot"));
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoadingDoctor && !doctor) {
    return <PageLoader minHeight={260} label="Loading doctor details..." />;
  }

  if (!doctor) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <p className="text-gray-700 mb-4">
            Doctor details were not found. Please select a doctor again.
          </p>
          <button
            onClick={() => navigate("/book-appointments")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate("/book-appointments")}
        className="mb-4 text-blue-600 font-medium"
      >
        Back to Doctors
      </button>
      {isLoadingDoctor && <PageLoader minHeight={120} label="Loading doctor details..." />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <img
              src={doctorImage}
              alt={doctor.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackDoctorImage(doctor?.name);
              }}
              className="w-40 h-40 rounded-2xl object-cover border border-gray-200"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Doctor ID: {doctor.doctorId || "N/A"}
              </p>
              <p className="text-blue-700 font-semibold mt-1">
                {doctor.specialization || doctor.expertise || "N/A"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Qualification: {doctor.qualification || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Experience:{" "}
                {doctor.experience !== null && doctor.experience !== undefined
                  ? `${doctor.experience} years`
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Rating & Reviews:{" "}
                {doctor.rating ?? doctor.avgRating ?? 0} ({doctor.ratingCount || 0} reviews)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-semibold">Hospital/Clinic</p>
              <p className="text-sm text-gray-700">
                {doctor.hospitalClinicName || "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-semibold">Location / Address</p>
              <p className="text-sm text-gray-700">{doctor.location || doctor.address || "N/A"}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-semibold">Consultation Fees</p>
              <p className="text-sm text-gray-700">
                {doctor.consultationFees !== null &&
                doctor.consultationFees !== undefined
                  ? `Rs. ${doctor.consultationFees}`
                  : doctor.consultationCharge !== null &&
                    doctor.consultationCharge !== undefined
                  ? `Rs. ${doctor.consultationCharge}`
                  : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-semibold">Languages Spoken</p>
              <p className="text-sm text-gray-700">
                {Array.isArray(doctor.languagesSpoken) &&
                doctor.languagesSpoken.length
                  ? doctor.languagesSpoken.join(", ")
                  : typeof doctor.languages === "string" && doctor.languages
                  ? doctor.languages
                  : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-semibold">Consultation Mode</p>
              <p className="text-sm text-gray-700">
                {doctor.consultationMode || "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-semibold">Patients Treated</p>
              <p className="text-sm text-gray-700">
                {doctor.patientsTreated ?? "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-semibold">Working Days</p>
              <p className="text-sm text-gray-700">
                {Array.isArray(doctor.workingDays) && doctor.workingDays.length
                  ? doctor.workingDays.join(", ")
                  : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-semibold">Emergency Availability</p>
              <p className="text-sm text-gray-700">
                {doctor.emergencyAvailability || "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 md:col-span-2">
              <p className="font-semibold">Available Time Slots</p>
              <p className="text-sm text-gray-700">
                {doctor.consultationTimings || "Choose date to view slots"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl border border-gray-100">
              <h3 className="font-semibold mb-1">About Doctor</h3>
              <p className="text-sm text-gray-700">
                {doctor.aboutDoctor || doctor.about || "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100">
              <h3 className="font-semibold mb-1">Education & Certifications</h3>
              <p className="text-sm text-gray-700">
                {doctor.educationCertifications || doctor.education || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 h-fit">
          <h2 className="text-xl font-semibold mb-3">Book Appointment</h2>
          <label className="block text-sm mb-1">Choose Working Date</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          >
            {!workingDateOptions.length && <option value="">No working day available</option>}
            {workingDateOptions.map((dateValue) => (
              <option key={dateValue} value={dateValue}>
                {formatDateDDMMYYYY(dateValue)}
              </option>
            ))}
          </select>

          <button
            onClick={loadSlots}
            disabled={
              !selectedDate ||
              isLoadingSlots ||
              isLoadingDateOptions ||
              !workingDateOptions.length
            }
            className="w-full bg-blue-600 disabled:bg-gray-300 text-white py-2 rounded-lg mb-3"
          >
            {isLoadingDateOptions
              ? "Loading Available Dates..."
              : isLoadingSlots
              ? "Loading Slots..."
              : "Show Available Time Slots"}
          </button>
          {!!slotNotice && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              {slotNotice}
            </p>
          )}
          {!!nextAvailableDate && (
            <button
              onClick={() => {
                setSelectedDate(nextAvailableDate);
                loadSlots(nextAvailableDate);
              }}
              className="w-full bg-emerald-100 text-emerald-800 py-2 rounded-lg mb-3"
            >
              Next Available Day: {formatDateDDMMYYYY(nextAvailableDate)}
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 mb-3">
            {slots.map((slot) => (
              <button
                key={slot.dateTime}
                disabled={!slot.available || isBooking}
                onClick={() => setSelectedSlot(slot.dateTime)}
                className={`px-2 py-2 rounded text-sm ${
                  !slot.available
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : selectedSlot === slot.dateTime
                    ? "bg-blue-600 text-white"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {new Date(slot.dateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </button>
            ))}
          </div>
          {!isLoadingSlots && selectedDate && !slots.length && (
            <p className="text-sm text-gray-500 mb-3">
              No slots found for this date.
            </p>
          )}

          <label className="block text-sm mb-1">
            Reason for appointment <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter reason for appointment"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError && e.target.value.trim()) setReasonError("");
            }}
            className={`w-full border rounded-lg px-3 py-2 ${
              reasonError ? "border-red-500" : ""
            }`}
          />
          {reasonError ? (
            <p className="text-xs text-red-600 mt-1 mb-3">{reasonError}</p>
          ) : (
            <div className="mb-3" />
          )}

          <button
            onClick={handleBookSlot}
            disabled={!selectedSlot || isBooking}
            className="w-full bg-blue-600 disabled:bg-gray-300 text-white py-2 rounded-lg"
          >
            {isBooking ? "Booking..." : "Book"}
          </button>

          <a
            href={`tel:${doctor.phone || ""}`}
            className="block text-center mt-3 w-full bg-gray-100 text-gray-800 py-2 rounded-lg"
          >
            Contact
          </a>
          <button
            onClick={openReviewsModal}
            className="mt-3 w-full bg-gray-100 text-gray-800 py-2 rounded-lg"
          >
            View Ratings & Reviews
          </button>
        </div>
      </div>

      {reviewModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5">
            <h3 className="text-lg font-semibold mb-3">
              Ratings & Reviews - {reviewModal.doctorName}
            </h3>
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-semibold">
                Overall Rating: {overallRating}/5
              </p>
              <p className="text-sm text-gray-600">
                Total Patient Reviews: {reviews.length}
              </p>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {reviews.map((item) => (
                <div key={item._id} className="border rounded-lg p-2">
                  <p className="text-sm font-medium">
                    Review by: {item.patientName || "Patient"}
                  </p>
                  <p className="text-sm">Rating: {item.rating}/5</p>
                  <p className="text-sm text-gray-700">
                    Review: {item.review || "-"}
                  </p>
                </div>
              ))}
              {!reviews.length && (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setReviewModal({ open: false, doctorName: "" })}
                className="px-3 py-1 rounded border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;
