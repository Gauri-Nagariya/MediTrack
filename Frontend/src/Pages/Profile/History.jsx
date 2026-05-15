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

const History = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [deletingId, setDeletingId] = useState("");
  const [reviewModal, setReviewModal] = useState({
    open: false,
    appointmentId: "",
    rating: "",
    review: "",
    submitting: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    appointmentId: "",
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [activeSection, setActiveSection] = useState("appointments");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadDoneAppointments = async () => {
    try {
      setIsLoadingHistory(true);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/patient`,
        authHeader
      );
      if (data.success) {
        const doneAppointments = (data.appointments || []).filter(
          (item) => item.status === "done"
        );
        setAppointments(doneAppointments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadDoneAppointments();
    loadSharedFiles();
  }, [token]);

  useEffect(() => {
    if (activeSection !== "shared" || !token) return;
    const markFeedbackSeen = async () => {
      try {
        await axios.patch(
          `${backendUrl}/api/share/patient/mark-feedback-seen`,
          {},
          authHeader
        );
        setSharedFiles((prev) =>
          prev.map((item) =>
            String(item.feedback || "").trim()
              ? { ...item, patientSeenAt: new Date().toISOString() }
              : item
          )
        );
      } catch (error) {
        console.error(error);
      }
    };
    markFeedbackSeen();
  }, [activeSection, token]);

  const loadSharedFiles = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/share/patient/history`, authHeader);
      if (data.success) setSharedFiles(data.shares || []);
    } catch (error) {
      console.error(error);
    }
  };

  const submitReview = async () => {
    if (!reviewModal.rating || reviewModal.submitting) return;
    try {
      setReviewModal((prev) => ({ ...prev, submitting: true }));
      const { data } = await axios.patch(
        `${backendUrl}/api/appointments/${reviewModal.appointmentId}/review`,
        {
          rating: Number(reviewModal.rating),
          review: reviewModal.review,
        },
        authHeader
      );
      if (data.success) {
        setReviewModal({
          open: false,
          appointmentId: "",
          rating: "",
          review: "",
          submitting: false,
        });
        loadDoneAppointments();
      } else {
        message.error(data.message || "Unable to submit review");
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to submit review");
    } finally {
      setReviewModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const openReviewModal = (appointment) => {
    setReviewModal({
      open: true,
      appointmentId: appointment._id,
      rating: appointment.rating || "",
      review: appointment.review || "",
      submitting: false,
    });
  };

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
        message.success("Appointment deleted");
      } else {
        message.error(data.message || "Unable to delete appointment");
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to delete appointment");
    } finally {
      setDeletingId("");
    }
  };

  const filteredAppointments = [...appointments]
    .filter((appointment) => {
      const query = searchTerm.trim().toLowerCase();
      const searchable = `${appointment.doctorId?.name || ""} ${
        appointment.reason || ""
      }`.toLowerCase();
      return !query || searchable.includes(query);
    })
    .sort((a, b) => {
      if (sortBy === "date-asc") {
        return new Date(a.appointmentDate) - new Date(b.appointmentDate);
      }
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    });

  if (isLoadingHistory) {
    return <PageLoader minHeight={260} label="Loading activity history..." />;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold mb-4">Activity History</h2>
      <div className="bg-white shadow rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by doctor name or reason"
          className="border rounded-lg px-3 py-2"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
        </select>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveSection("appointments")}
          className={`px-3 py-1 rounded ${activeSection === "appointments" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveSection("shared")}
          className={`px-3 py-1 rounded ${activeSection === "shared" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          <span className="inline-flex items-center gap-2">
            Shared Files
            {sharedFiles.some(
              (item) =>
                String(item.feedback || "").trim() &&
                !item.patientSeenAt
            ) && (
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            )}
          </span>
        </button>
      </div>

      {activeSection === "appointments" &&
        filteredAppointments.map((appointment) => (
        <div key={appointment._id} className="bg-white shadow rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{appointment.doctorId?.name}</p>
              <p className="text-sm text-gray-600">
                {formatDateTimeDDMMYYYY(appointment.appointmentDate)}
              </p>
              <p className="text-sm">Status: <span className={getStatusTextClass(appointment.status)}>{appointment.status}</span></p>
              <p className="text-sm text-gray-700">
                Reason: {appointment.reason || "-"}
              </p>
              <p className="text-sm text-green-700">
                {appointment.rating
                  ? `Your rating: ${appointment.rating}/5`
                  : "Completed. Please add your rating and review."}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/profile/Appointments/${appointment._id}`)}
                className="px-3 py-1 rounded bg-gray-100 text-gray-700"
              >
                View
              </button>
              <button
                onClick={() => openReviewModal(appointment)}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                {appointment.rating ? "Edit Review" : "Add Review"}
              </button>
              <button
                onClick={() =>
                  setDeleteModal({ open: true, appointmentId: appointment._id })
                }
                disabled={deletingId === appointment._id}
                className="px-3 py-1 rounded bg-red-600 disabled:bg-red-300 text-white"
              >
                {deletingId === appointment._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}

      {activeSection === "appointments" && !filteredAppointments.length && (
        <p className="text-gray-500">No completed appointments in history.</p>
      )}

      {activeSection === "shared" && (
        <div className="space-y-3">
          {sharedFiles.map((share) => (
            <div key={share._id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="font-semibold text-slate-800">
                  {share.direction === "doctor_to_patient"
                    ? `From Dr. ${share.doctorName || "Doctor"}`
                    : `To Dr. ${share.doctorName || "Doctor"}`}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    String(share.feedback || "").trim()
                      ? "bg-green-100 text-green-700 border-green-200"
                      : share.status === "seen"
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  {String(share.feedback || "").trim()
                    ? "feedback received"
                    : share.status || "unseen"}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-1">
                Shared: {formatDateTimeDDMMYYYY(share.createdAt)}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Reason:</span> {share.reason || "N/A"}
              </p>
              {share.direction === "doctor_to_patient" && (
                <>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Report Title:</span> {share.reportTitle || "N/A"}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Report Details:</span> {share.reportBody || "N/A"}
                  </p>
                </>
              )}
              <p className="text-sm">
                <span className="font-medium">Feedback:</span> {share.feedback || "No feedback yet"}
              </p>
              <div className="mt-2">
                <p className="text-sm font-medium">Files:</p>
                <ul className="list-disc pl-6 text-sm text-gray-700">
                  {(share.documents || []).map((doc) => (
                    <li key={doc._id}>
                      <a
                        href={`${backendUrl}/api/documents/file/${doc._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        {doc.filename || doc.facilityName || "Document"}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {!sharedFiles.length && (
            <p className="text-gray-500">No shared files history found.</p>
          )}
        </div>
      )}

      {reviewModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold mb-3">Add Rating & Review</h3>
            <select
              className="w-full border rounded px-2 py-2 mb-3"
              value={reviewModal.rating}
              onChange={(e) =>
                setReviewModal((prev) => ({ ...prev, rating: e.target.value }))
              }
            >
              <option value="">Rate doctor</option>
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
            <textarea
              value={reviewModal.review}
              onChange={(e) =>
                setReviewModal((prev) => ({ ...prev, review: e.target.value }))
              }
              rows={4}
              placeholder="Write your review"
              className="w-full border rounded-lg px-3 py-2"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() =>
                  setReviewModal({
                    open: false,
                    appointmentId: "",
                    rating: "",
                    review: "",
                    submitting: false,
                  })
                }
                className="px-3 py-1 rounded border"
              >
                Close
              </button>
              <button
                onClick={submitReview}
                disabled={!reviewModal.rating || reviewModal.submitting}
                className="px-3 py-1 rounded bg-blue-600 disabled:bg-blue-300 text-white"
              >
                {reviewModal.submitting ? "Submitting..." : "Submit"}
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
              Are you sure you want to delete this appointment?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteModal({ open: false, appointmentId: "" })}
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteAppointment(deleteModal.appointmentId);
                  setDeleteModal({ open: false, appointmentId: "" });
                }}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
