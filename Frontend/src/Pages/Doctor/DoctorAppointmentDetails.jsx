import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { message } from "antd";
import { formatDateTimeDDMMYYYY } from "../../utils/dateFormat";
import PageLoader from "../../components/PageLoader";

const getAgeFromDob = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age >= 0 ? age : "N/A";
};
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

const DoctorAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);

  const loadDetails = async () => {
    if (!appointmentId || !token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/${appointmentId}/doctor-patient-details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setAppointment(data.appointment || null);
        setPatientProfile(data.patientProfile || null);
      } else {
        message.error(data.message || "Unable to load appointment details");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Unable to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [appointmentId, token]);

  if (loading) return <PageLoader minHeight={240} label="Loading appointment details..." />;

  if (!appointment) {
    return (
      <div className="bg-white rounded-xl p-5 border">
        <p className="text-gray-700 mb-3">Appointment details not found.</p>
        <button
          onClick={() => navigate("/doctor/appointments-history")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Appointments History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
      <button
        onClick={() => navigate("/doctor/appointments-history")}
        className="text-blue-600 font-medium"
      >
        Back to Appointments History
      </button>

      <div className="bg-white shadow-sm rounded-2xl p-5 md:p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
            <p className="text-sm text-slate-500 mt-1">
              Patient overview and consultation context for this visit.
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-5">
          <Info label="Patient Name" value={patientProfile?.fullName || appointment.patientName || "N/A"} />
          <Info label="Patient ID" value={appointment.patientBookingId || "N/A"} />
          <Info label="Appointment ID" value={appointment.appointmentPublicId || "N/A"} />
          <Info label="Age" value={getAgeFromDob(patientProfile?.dateOfBirth)} />
          <Info label="Gender" value={patientProfile?.gender || "N/A"} />
          <Info label="Phone Number" value={patientProfile?.phone || "N/A"} />
          <Info label="Blood Group" value={patientProfile?.bloodGroup || "N/A"} />
          <Info label="Consultation Type" value={appointment.consultationType || "N/A"} />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Status</p>
            <p className={`font-medium mt-1 capitalize ${getStatusTextClass(appointment.status)}`}>
              {appointment.status || "N/A"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500">Appointment Date & Time</p>
            <p className="font-medium text-slate-800 mt-1">
              {formatDateTimeDDMMYYYY(appointment.appointmentDate)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500">Symptoms / Problem Description</p>
            <p className="font-medium text-slate-800 mt-1">{appointment.reason || "N/A"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500">Medical History</p>
            <p className="font-medium text-slate-800 mt-1">{patientProfile?.medicalHistory || "N/A"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500">Allergies</p>
            <p className="font-medium text-slate-800 mt-1">
              {(patientProfile?.allergies || []).join(", ") || "N/A"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500">Current Medications</p>
            <p className="font-medium text-slate-800 mt-1">{patientProfile?.currentMedications || "N/A"}</p>
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

export default DoctorAppointmentDetails;
