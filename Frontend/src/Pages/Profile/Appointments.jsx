import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../Context/AppContext";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateTimeDDMMYYYY } from "../../utils/dateFormat";
import {
  downloadAppointmentReceiptPdf,
  openAppointmentReceiptPdf,
} from "../../utils/appointmentReceiptPdf";
import PageLoader from "../../components/PageLoader";

const getStatusTextClass = (status) => {
  if (status === "done") return "text-green-600";
  if (status === "cancelled" || status === "rejected") return "text-red-600";
  return "text-gray-700";
};

const Appointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [deletingId, setDeletingId] = useState("");
  const [openMenuId, setOpenMenuId] = useState("");
  const [cancelModal, setCancelModal] = useState({
    open: false,
    appointmentId: "",
    reason: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    mode: "single",
    appointmentId: "",
  });
  const [receiptModal, setReceiptModal] = useState({
    open: false,
    loading: false,
    appointment: null,
    doctorProfile: null,
    patientProfile: null,
  });
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/patient`,
        authHeader
      );
      if (data.success) setAppointments(data.appointments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadAppointments();
  }, [token]);

  useEffect(() => {
    const appointmentId = location.state?.showReceiptForAppointmentId;
    if (!appointmentId || !token) return;

    const openReceiptModal = async () => {
      try {
        setReceiptModal((prev) => ({ ...prev, open: true, loading: true }));
        const { data } = await axios.get(
          `${backendUrl}/api/appointments/${appointmentId}/patient-details`,
          authHeader
        );
        if (data.success) {
          setReceiptModal({
            open: true,
            loading: false,
            appointment: data.appointment || null,
            doctorProfile: data.doctorProfile || null,
            patientProfile: data.patientProfile || null,
          });
        } else {
          setReceiptModal({
            open: false,
            loading: false,
            appointment: null,
            doctorProfile: null,
            patientProfile: null,
          });
          message.error(data.message || "Unable to load booking receipt");
        }
      } catch (error) {
        setReceiptModal({
          open: false,
          loading: false,
          appointment: null,
          doctorProfile: null,
          patientProfile: null,
        });
        message.error("Unable to load booking receipt");
      } finally {
        navigate("/profile/Appointments", { replace: true, state: {} });
      }
    };

    openReceiptModal();
  }, [location.state, token]);

  const deleteAppointment = async (appointmentId) => {
    if (deletingId) return;
    try {
      setDeletingId(appointmentId);
      const { data } = await axios.delete(
        `${backendUrl}/api/appointments/${appointmentId}`,
        authHeader
      );
      if (data.success) {
        setAppointments((prev) => prev.filter((item) => item._id !== appointmentId));
      } else {
        message.error(data.message || "Unable to delete appointment");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId("");
    }
  };

  const cancelAppointment = async (appointmentId, cancelReason) => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/appointments/${appointmentId}/patient-cancel`,
        { reason: cancelReason },
        authHeader
      );
      if (data.success) {
        loadAppointments();
      } else {
        message.error(data.message || "Unable to cancel appointment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAppointments = [...appointments]
    .filter((appointment) => appointment.status !== "done")
    .filter((appointment) => {
      const query = searchTerm.trim().toLowerCase();
      const searchable = `${appointment.doctorId?.name || ""} ${appointment.reason || ""}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date-asc") {
        return new Date(a.appointmentDate) - new Date(b.appointmentDate);
      }
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    });

  if (isLoadingAppointments) {
    return <PageLoader minHeight={260} label="Loading appointments..." />;
  }

  const isSelected = (appointmentId) => selectedIds.includes(appointmentId);

  const toggleSelect = (appointmentId) => {
    setSelectedIds((prev) =>
      prev.includes(appointmentId)
        ? prev.filter((id) => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredAppointments.map((item) => item._id);
    const allSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const bulkDeleteSelected = async () => {
    if (!selectedIds.length || isBulkDeleting) return;
    try {
      setIsBulkDeleting(true);
      let deletedCount = 0;
      let skippedCount = 0;

      for (const appointmentId of selectedIds) {
        try {
          const { data } = await axios.delete(
            `${backendUrl}/api/appointments/${appointmentId}`,
            authHeader
          );
          if (data.success) {
            deletedCount += 1;
          } else {
            skippedCount += 1;
          }
        } catch {
          skippedCount += 1;
        }
      }

      if (deletedCount) {
        setAppointments((prev) =>
          prev.filter((item) => !selectedIds.includes(item._id))
        );
      }
      setSelectedIds([]);

      if (deletedCount) {
        message.success(`Deleted ${deletedCount} appointment(s)`);
      }
      if (skippedCount) {
        message.warning(
          `${skippedCount} appointment(s) could not be deleted (only done/cancelled/rejected can be deleted).`
        );
      }
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
      <div className="bg-white shadow rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by doctor name or reason"
          className="border rounded-lg px-3 py-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
        </select>
      </div>
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={
              filteredAppointments.length > 0 &&
              filteredAppointments.every((item) => selectedIds.includes(item._id))
            }
            onChange={toggleSelectAllFiltered}
          />
          Select all filtered
        </label>
        <button
          onClick={() =>
            setDeleteModal({ open: true, mode: "bulk", appointmentId: "" })
          }
          disabled={!selectedIds.length || isBulkDeleting}
          className="px-3 py-1.5 rounded bg-red-600 disabled:bg-red-300 text-white"
        >
          {isBulkDeleting
            ? "Deleting..."
            : `Delete Selected (${selectedIds.length})`}
        </button>
      </div>
      {filteredAppointments.map((appointment) => (
        <div key={appointment._id} className="bg-white shadow rounded-xl p-4 relative">
          <div className="absolute top-3 left-3">
            <input
              type="checkbox"
              checked={isSelected(appointment._id)}
              onChange={() => toggleSelect(appointment._id)}
            />
          </div>
          <div className="absolute top-3 right-3">
            <button
              onClick={() =>
                setOpenMenuId((prev) => (prev === appointment._id ? "" : appointment._id))
              }
              className="h-8 w-8 rounded-full hover:bg-gray-100 text-lg leading-none"
              aria-label="More options"
            >
              ⋮
            </button>
            {openMenuId === appointment._id && (
              <div className="absolute right-0 mt-1 w-44 bg-white border rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    setOpenMenuId("");
                    navigate(`/profile/Appointments/${appointment._id}`);
                  }}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50"
                >
                  View Appointment
                </button>
                <button
                  onClick={() => {
                    setOpenMenuId("");
                    setCancelModal({
                      open: true,
                      appointmentId: appointment._id,
                      reason: "",
                    });
                  }}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel Appointment
                </button>
                <button
                  onClick={() => {
                    setOpenMenuId("");
                    setDeleteModal({
                      open: true,
                      mode: "single",
                      appointmentId: appointment._id,
                    });
                  }}
                  disabled={deletingId === appointment._id}
                  className="w-full text-left px-3 py-2 font-semibold hover:bg-red-50 disabled:text-red-300"
                  style={{ color: "#dc2626" }}
                >
                  {deletingId === appointment._id ? "Deleting..." : "Delete Appointment"}
                </button>
              </div>
            )}
          </div>
          <p className="font-semibold pl-6">{appointment.doctorId?.name}</p>
          <p className="text-sm text-gray-600">
            {formatDateTimeDDMMYYYY(appointment.appointmentDate)}
          </p>
          <p className="text-sm">Status: <span className={getStatusTextClass(appointment.status)}>{appointment.status}</span></p>
          <p className="text-sm text-gray-700">Reason: {appointment.reason || "-"}</p>
          {!!appointment.doctorStatusReason && (
            <p className="text-sm text-red-700">
              Doctor reason: {appointment.doctorStatusReason}
            </p>
          )}
          {!!appointment.patientStatusReason && (
            <p className="text-sm text-orange-700">
              Your cancellation reason: {appointment.patientStatusReason}
            </p>
          )}
        </div>
      ))}
      {!filteredAppointments.length && (
        <p className="text-gray-500">No appointments found for current filter.</p>
      )}

      {cancelModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold mb-3">Cancellation Reason</h3>
            <textarea
              value={cancelModal.reason}
              onChange={(e) =>
                setCancelModal((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={4}
              placeholder="Enter reason for cancellation"
              className="w-full border rounded-lg px-3 py-2"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setCancelModal({ open: false, appointmentId: "", reason: "" })}
                className="px-3 py-1 rounded border"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  const selectedAppointment = appointments.find(
                    (item) => item._id === cancelModal.appointmentId
                  );
                  if (selectedAppointment?.status !== "pending") {
                    message.error("Only pending appointments can be cancelled");
                  } else {
                    await cancelAppointment(
                      cancelModal.appointmentId,
                      cancelModal.reason.trim()
                    );
                  }
                  setCancelModal({ open: false, appointmentId: "", reason: "" });
                }}
                disabled={!cancelModal.reason.trim()}
                className="px-3 py-1 rounded bg-blue-600 disabled:bg-blue-300 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
            <p className="text-sm text-gray-700">
              {deleteModal.mode === "bulk"
                ? `Are you sure you want to delete ${selectedIds.length} selected appointment(s)?`
                : "Are you sure you want to delete this appointment?"}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() =>
                  setDeleteModal({
                    open: false,
                    mode: "single",
                    appointmentId: "",
                  })
                }
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteModal.mode === "bulk") {
                    await bulkDeleteSelected();
                  } else if (deleteModal.appointmentId) {
                    await deleteAppointment(deleteModal.appointmentId);
                  }
                  setDeleteModal({
                    open: false,
                    mode: "single",
                    appointmentId: "",
                  });
                }}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {receiptModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5">
            <h3 className="text-lg font-semibold mb-3">Booking Acknowledgement</h3>
            {receiptModal.loading ? (
              <p className="text-sm text-gray-600">Preparing receipt...</p>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-3">
                  Your appointment is booked successfully. You can view or
                  download your receipt as proof of booking.
                </p>
                <div className="bg-gray-50 border rounded-lg p-3 text-sm mb-4">
                  <p>
                    <span className="font-semibold">Doctor:</span>{" "}
                    {receiptModal.doctorProfile?.fullName ||
                      receiptModal.appointment?.doctorId?.name ||
                      "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Date & Time:</span>{" "}
                    {formatDateTimeDDMMYYYY(
                      receiptModal.appointment?.appointmentDate
                    )}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className={getStatusTextClass(receiptModal.appointment?.status)}>
                      {receiptModal.appointment?.status || "N/A"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() =>
                      openAppointmentReceiptPdf({
                        appointment: receiptModal.appointment,
                        doctorProfile: receiptModal.doctorProfile,
                        patientProfile: receiptModal.patientProfile,
                      })
                    }
                    className="px-3 py-1 rounded bg-gray-100 text-gray-800"
                  >
                    View PDF
                  </button>
                  <button
                    onClick={() =>
                      downloadAppointmentReceiptPdf({
                        appointment: receiptModal.appointment,
                        doctorProfile: receiptModal.doctorProfile,
                        patientProfile: receiptModal.patientProfile,
                      })
                    }
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                  >
                    Download PDF
                  </button>
                </div>
              </>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() =>
                  setReceiptModal({
                    open: false,
                    loading: false,
                    appointment: null,
                    doctorProfile: null,
                    patientProfile: null,
                  })
                }
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

export default Appointments;
