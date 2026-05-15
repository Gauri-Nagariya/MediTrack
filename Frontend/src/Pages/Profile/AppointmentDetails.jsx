import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { message } from "antd";
import { formatDateTimeDDMMYYYY } from "../../utils/dateFormat";
import PageLoader from "../../components/PageLoader";
import {
  downloadAppointmentReceiptPdf,
  openAppointmentReceiptPdf,
} from "../../utils/appointmentReceiptPdf";

const fallbackDoctorImage = (doctorName) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    doctorName || "Doctor"
  )}&background=1d4ed8&color=ffffff&size=256&bold=true`;
const getStatusTextClass = (status) => {
  if (status === "done") return "text-green-600";
  if (status === "cancelled" || status === "rejected") return "text-red-600";
  return "text-gray-700";
};
const getStatusBadgeClass = (status) => {
  if (status === "done") return "bg-green-100 text-green-700 border-green-200";
  if (status === "cancelled" || status === "rejected") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  return "bg-blue-100 text-blue-700 border-blue-200";
};

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [appointment, setAppointment] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const doctorImage = useMemo(() => {
    const image = doctorProfile?.profilePhoto?.trim();
    if (!image) {
      return fallbackDoctorImage(
        doctorProfile?.fullName || appointment?.doctorId?.name
      );
    }
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
  }, [doctorProfile, appointment, backendUrl]);

  const loadAppointmentDetails = async () => {
    if (!appointmentId || !token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/${appointmentId}/patient-details`,
        authHeader
      );
      if (data.success) {
        setAppointment(data.appointment || null);
        setDoctorProfile(data.doctorProfile || null);
        setPatientProfile(data.patientProfile || null);
      } else {
        message.error(data.message || "Unable to load appointment details");
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load appointment details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentDetails();
  }, [appointmentId, token]);

  if (loading) {
    return <PageLoader minHeight={220} label="Loading appointment details..." />;
  }

  if (!appointment) {
    return (
      <div className="bg-white rounded-xl p-5 border">
        <p className="text-gray-700 mb-3">Appointment details not found.</p>
        <button
          onClick={() => navigate("/profile/Appointments")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to My Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4 space-y-5">
      <button
        onClick={() => navigate("/profile/Appointments")}
        className="text-blue-600 font-medium"
      >
        Back to My Appointments
      </button>

      <div className="bg-white shadow-sm rounded-2xl p-5 md:p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
            <p className="text-sm text-slate-500 mt-1">
              Track your booking and doctor consultation information.
            </p>
          </div>
          <span
            className={`inline-flex w-fit px-3 py-1 rounded-full border text-xs font-semibold capitalize ${getStatusBadgeClass(
              appointment.status
            )}`}
          >
            {appointment.status || "N/A"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() =>
              openAppointmentReceiptPdf({
                appointment,
                doctorProfile,
                patientProfile,
              })
            }
            className="px-3 py-2 rounded bg-gray-100 text-gray-800"
          >
            View Receipt PDF
          </button>
          <button
            onClick={() =>
              downloadAppointmentReceiptPdf({
                appointment,
                doctorProfile,
                patientProfile,
              })
            }
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            Download Receipt PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Appointment Date & Time</p>
            <p className="font-semibold text-slate-800 mt-1">
              {formatDateTimeDDMMYYYY(appointment.appointmentDate)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Patient ID</p>
            <p className="font-semibold text-slate-800 mt-1">
              {appointment.patientBookingId || "N/A"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Appointment ID</p>
            <p className="font-semibold text-slate-800 mt-1">
              {appointment.appointmentPublicId || "N/A"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500">Reason / Symptoms</p>
            <p className="font-medium text-slate-800 mt-1">{appointment.reason || "-"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl p-5 md:p-6 border border-blue-100">
        <h3 className="text-xl font-semibold mb-4 text-slate-800">Doctor Information</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <img
            src={doctorImage}
            alt={doctorProfile?.fullName || appointment.doctorId?.name || "Doctor"}
            className="w-28 h-28 rounded-xl object-cover border"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackDoctorImage(
                doctorProfile?.fullName || appointment.doctorId?.name
              );
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm flex-1">
            <Info label="Doctor" value={doctorProfile?.fullName || appointment.doctorId?.name || "N/A"} />
            <Info label="Specialization" value={doctorProfile?.specialization || "N/A"} />
            <Info label="Qualification" value={doctorProfile?.degreesQualifications || "N/A"} />
            <Info label="Experience" value={doctorProfile?.yearsOfExperience ?? "N/A"} />
            <Info
              label="Consultation Fees"
              value={
                doctorProfile?.consultationFees !== null &&
                doctorProfile?.consultationFees !== undefined
                  ? `Rs. ${doctorProfile.consultationFees}`
                  : "N/A"
              }
            />
            <Info label="Consultation Mode" value={doctorProfile?.consultationMode || "N/A"} />
            <Info label="Hospital / Clinic" value={doctorProfile?.hospitalClinicName || "N/A"} />
            <Info label="Timings" value={doctorProfile?.consultationTimings || "N/A"} />
            <Info label="Phone" value={doctorProfile?.doctorPhone || "N/A"} />
            <Info label="Email" value={appointment.doctorId?.email || "N/A"} />
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Address</p>
              <p className="font-medium text-slate-800 mt-1">
                {[doctorProfile?.clinicAddress, doctorProfile?.cityState]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </p>
            </div>
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Languages</p>
              <p className="font-medium text-slate-800 mt-1">
                {Array.isArray(doctorProfile?.languagesSpoken) &&
                doctorProfile.languagesSpoken.length
                  ? doctorProfile.languagesSpoken.join(", ")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-medium text-slate-800 mt-1">{value}</p>
  </div>
);

export default AppointmentDetails;
