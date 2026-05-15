import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../Context/AppContext";
import { message } from "antd";
import { formatDateTimeDDMMYYYY } from "../../utils/dateFormat";
import PageLoader from "../../components/PageLoader";
import { useNavigate } from "react-router-dom";

const closedStatuses = new Set(["done", "rejected", "cancelled"]);
const getStatusTextClass = (status) => {
  if (status === "done") return "text-green-600";
  if (status === "cancelled" || status === "rejected") return "text-red-600";
  return "text-gray-700";
};
const getAgeFromDob = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : "N/A";
};

const DoctorAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [expandedAppointmentId, setExpandedAppointmentId] = useState("");
  const [patientDetailsById, setPatientDetailsById] = useState({});
  const [loadingDetailsId, setLoadingDetailsId] = useState("");
  const [reasonModal, setReasonModal] = useState({
    open: false,
    appointmentId: "",
    status: "",
    reason: "",
  });
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const loadAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const { data } = await axios.get(`${backendUrl}/api/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const activeAppointments = (data.appointments || []).filter(
          (appointment) => !closedStatuses.has(appointment.status)
        );
        setAppointments(activeAppointments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (token) loadAppointments();
  }, [token]);

  const updateStatus = async (id, status, statusReason = "") => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/appointments/${id}/status`,
        { status, reason: statusReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) loadAppointments();
      else message.error(data.message || "Unable to update status");
    } catch (error) {
      console.error(error);
    }
  };

  const openReasonModal = (appointmentId, status) => {
    setReasonModal({
      open: true,
      appointmentId,
      status,
      reason: "",
    });
  };

  const submitReasonModal = async () => {
    const enteredReason = reasonModal.reason.trim();
    if (!enteredReason) return;
    await updateStatus(reasonModal.appointmentId, reasonModal.status, enteredReason);
    setReasonModal({ open: false, appointmentId: "", status: "", reason: "" });
  };

  const fetchDoctorPatientDetails = async (appointmentId) => {
    try {
      setLoadingDetailsId(appointmentId);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/${appointmentId}/doctor-patient-details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setPatientDetailsById((prev) => ({
          ...prev,
          [appointmentId]: {
            appointment: data.appointment || null,
            patientProfile: data.patientProfile || null,
          },
        }));
      } else {
        message.error(data.message || "Unable to load patient details");
      }
    } catch (error) {
      message.error("Unable to load patient details");
    } finally {
      setLoadingDetailsId("");
    }
  };

  const handleCardClick = async (appointmentId) => {
    if (expandedAppointmentId === appointmentId) {
      setExpandedAppointmentId("");
      return;
    }

    setExpandedAppointmentId(appointmentId);
    if (!patientDetailsById[appointmentId]) {
      await fetchDoctorPatientDetails(appointmentId);
    }
  };

  if (isLoadingAppointments) {
    return <PageLoader minHeight={260} label="Loading appointments..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Active Appointments</h1>
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 mb-6">
        Patients book appointments. Doctors cannot add appointments manually.
      </div>

      <div className="space-y-4">
        {appointments.map((a) => (
          <div
            key={a._id}
            onClick={() => handleCardClick(a._id)}
            className="bg-white shadow rounded-xl p-4 flex flex-col gap-3 cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-semibold">{a.patientName}</p>
              <p className="text-sm text-gray-600">Contact Number: {a.patientPhone || "N/A"}</p>
              <p className="text-sm text-gray-600">{formatDateTimeDDMMYYYY(a.appointmentDate)}</p>
              <p className="text-sm">Status: <span className={`font-medium ${getStatusTextClass(a.status)}`}>{a.status}</span></p>
              {!!a.patientStatusReason && (
                <p className="text-sm text-orange-700">
                  Cancelled by patient: {a.patientStatusReason}
                </p>
              )}
              {!!a.doctorStatusReason && (
                <p className="text-sm text-red-700">
                  Doctor reason: {a.doctorStatusReason}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/doctor/appointments/${a._id}`);
                }}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                View Details
              </button>
              <button onClick={(e) => { e.stopPropagation(); updateStatus(a._id, "done"); }} className="px-3 py-1 rounded bg-green-600 text-white">Done</button>
              <button onClick={(e) => { e.stopPropagation(); openReasonModal(a._id, "rejected"); }} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
            </div>
            </div>

            {expandedAppointmentId === a._id && (
              <div className="border-t pt-3">
                {loadingDetailsId === a._id ? (
                  <p className="text-sm text-gray-500">Loading patient details...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Patient Name:</span> {patientDetailsById[a._id]?.patientProfile?.fullName || a.patientName || "N/A"}</p>
                    <p><span className="font-medium">Patient ID:</span> {patientDetailsById[a._id]?.appointment?.patientBookingId || a.patientBookingId || "N/A"}</p>
                    <p><span className="font-medium">Age:</span> {getAgeFromDob(patientDetailsById[a._id]?.patientProfile?.dateOfBirth)}</p>
                    <p><span className="font-medium">Gender:</span> {patientDetailsById[a._id]?.patientProfile?.gender || "N/A"}</p>
                    <p><span className="font-medium">Phone Number:</span> {patientDetailsById[a._id]?.patientProfile?.phone || "N/A"}</p>
                    <p><span className="font-medium">Blood Group:</span> {patientDetailsById[a._id]?.patientProfile?.bloodGroup || "N/A"}</p>
                    <p className="md:col-span-2"><span className="font-medium">Symptoms / Problem Description:</span> {patientDetailsById[a._id]?.appointment?.reason || a.reason || "N/A"}</p>
                    <p className="md:col-span-2"><span className="font-medium">Medical History:</span> {patientDetailsById[a._id]?.patientProfile?.medicalHistory || "N/A"}</p>
                    <p className="md:col-span-2"><span className="font-medium">Allergies:</span> {(patientDetailsById[a._id]?.patientProfile?.allergies || []).join(", ") || "N/A"}</p>
                    <p className="md:col-span-2"><span className="font-medium">Current Medications:</span> {patientDetailsById[a._id]?.patientProfile?.currentMedications || "N/A"}</p>
                    <p><span className="font-medium">Appointment ID:</span> {patientDetailsById[a._id]?.appointment?.appointmentPublicId || a.appointmentPublicId || "N/A"}</p>
                    <p><span className="font-medium">Appointment Date & Time:</span> {formatDateTimeDDMMYYYY(patientDetailsById[a._id]?.appointment?.appointmentDate || a.appointmentDate)}</p>
                    <p><span className="font-medium">Consultation Type (Online/Offline):</span> {patientDetailsById[a._id]?.appointment?.consultationType || "N/A"}</p>
                  </div>
                )}
              </div>
            )}
            </div>
        ))}
        {!appointments.length && (
          <p className="text-gray-500">
            No active appointments. Completed, rejected, and cancelled records are in Appointments History.
          </p>
        )}
      </div>

      {reasonModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold mb-3">
              Add reason for {reasonModal.status}
            </h3>
            <textarea
              value={reasonModal.reason}
              onChange={(e) =>
                setReasonModal((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={4}
              placeholder="Enter reason"
              className="w-full border rounded-lg px-3 py-2"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() =>
                  setReasonModal({ open: false, appointmentId: "", status: "", reason: "" })
                }
                className="px-3 py-1 rounded border"
              >
                Close
              </button>
              <button
                onClick={submitReasonModal}
                disabled={!reasonModal.reason.trim()}
                className="px-3 py-1 rounded bg-blue-600 disabled:bg-blue-300 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
