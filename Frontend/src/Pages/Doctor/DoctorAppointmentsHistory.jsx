import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../Context/AppContext";
import { formatDateTimeDDMMYYYY } from "../../utils/dateFormat";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import PageLoader from "../../components/PageLoader";

const getStatusTextClass = (status) => {
  if (status === "done") return "text-green-600";
  if (status === "cancelled" || status === "rejected") return "text-red-600";
  return "text-gray-700";
};

const DoctorAppointmentsHistory = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [status, setStatus] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [openMenuId, setOpenMenuId] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    mode: "single",
    appointmentId: "",
  });
  const [deletingId, setDeletingId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadHistory = async (currentStatus) => {
    try {
      setIsLoadingHistory(true);
      const query = currentStatus === "all" ? "" : `?status=${currentStatus}`;
      const { data } = await axios.get(`${backendUrl}/api/appointments/doctor/history${query}`, authHeader);
      if (data.success) setAppointments(data.appointments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (token) loadHistory(status);
  }, [token, status]);

  const deleteAppointment = async (appointmentId) => {
    if (!appointmentId || deletingId) return;
    try {
      setDeletingId(appointmentId);
      const { data } = await axios.delete(
        `${backendUrl}/api/appointments/${appointmentId}/doctor`,
        authHeader
      );
      if (data.success) {
        setAppointments((prev) => prev.filter((item) => item._id !== appointmentId));
        message.success("Appointment deleted");
      } else {
        message.error(data.message || "Unable to delete appointment");
      }
    } catch {
      message.error("Unable to delete appointment");
    } finally {
      setDeletingId("");
    }
  };

  const isSelected = (appointmentId) => selectedIds.includes(appointmentId);

  const toggleSelect = (appointmentId) => {
    setSelectedIds((prev) =>
      prev.includes(appointmentId)
        ? prev.filter((id) => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const filteredAppointments = [...appointments]
    .filter((appointment) => {
      const query = searchTerm.trim().toLowerCase();
      const searchable = `${appointment.patientName} ${appointment.patientStatusReason || ""} ${appointment.doctorStatusReason || ""}`.toLowerCase();
      return !query || searchable.includes(query);
    })
    .sort((a, b) => {
      if (sortBy === "date-asc") return new Date(a.appointmentDate) - new Date(b.appointmentDate);
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    });

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
            `${backendUrl}/api/appointments/${appointmentId}/doctor`,
            authHeader
          );
          if (data.success) deletedCount += 1;
          else skippedCount += 1;
        } catch {
          skippedCount += 1;
        }
      }

      if (deletedCount) {
        setAppointments((prev) =>
          prev.filter((item) => !selectedIds.includes(item._id))
        );
        message.success(`Deleted ${deletedCount} appointment(s)`);
      }
      if (skippedCount) {
        message.warning(`${skippedCount} appointment(s) could not be deleted.`);
      }
      setSelectedIds([]);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (isLoadingHistory) {
    return <PageLoader minHeight={260} label="Loading appointments history..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Appointments History</h1>
      <div className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by patient or reason"
          className="border rounded-lg px-3 py-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All</option>
          <option value="done">Done</option>
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
      <div className="space-y-4">
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
        {filteredAppointments.map((a) => (
          <div key={a._id} className="bg-white shadow rounded-xl p-4 relative">
            <div className="absolute top-3 left-3">
              <input
                type="checkbox"
                checked={isSelected(a._id)}
                onChange={() => toggleSelect(a._id)}
              />
            </div>
            <div className="absolute top-3 right-3">
              <button
                onClick={() =>
                  setOpenMenuId((prev) => (prev === a._id ? "" : a._id))
                }
                className="h-8 w-8 rounded-full hover:bg-gray-100 text-lg leading-none"
                aria-label="More options"
              >
                ⋮
              </button>
              {openMenuId === a._id && (
                <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      setOpenMenuId("");
                      navigate(`/doctor/appointments/${a._id}`);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setOpenMenuId("");
                      setDeleteModal({
                        open: true,
                        mode: "single",
                        appointmentId: a._id,
                      });
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p className="font-semibold pl-6">{a.patientName}</p>
            <p className="text-sm text-gray-600">
              Contact Number: {a.patientPhone || "N/A"}
            </p>
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
        ))}
        {!filteredAppointments.length && (
          <p className="text-gray-500">No history records for current filter.</p>
        )}
      </div>
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
            <p className="text-sm text-gray-700">
              {deleteModal.mode === "bulk"
                ? `Are you sure you want to delete ${selectedIds.length} selected appointment(s) from history?`
                : "Are you sure you want to delete this appointment from history?"}
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
                  } else {
                    await deleteAppointment(deleteModal.appointmentId);
                  }
                  setDeleteModal({
                    open: false,
                    mode: "single",
                    appointmentId: "",
                  });
                }}
                disabled={
                  deleteModal.mode === "bulk"
                    ? isBulkDeleting
                    : deletingId === deleteModal.appointmentId
                }
                className="px-3 py-1 rounded bg-red-600 disabled:bg-red-300 text-white"
              >
                {deleteModal.mode === "bulk"
                  ? isBulkDeleting
                    ? "Deleting..."
                    : "Delete"
                  : deletingId === deleteModal.appointmentId
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentsHistory;
