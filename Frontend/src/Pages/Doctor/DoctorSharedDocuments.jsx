import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AppContext } from "../../Context/AppContext";
import { formatDateTimeDDMMYYYY } from "../../utils/dateFormat";
import { message } from "antd";
import PageLoader from "../../components/PageLoader";

const DoctorSharedDocuments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackById, setFeedbackById] = useState({});
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportBody, setReportBody] = useState("");

  const loadShares = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/share/doctor/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const loadedShares = data.shares || [];
        setShares(loadedShares);
        const unseen = loadedShares.filter((item) => item.status === "unseen");
        if (unseen.length) {
          await Promise.all(
            unseen.map((item) =>
              axios.patch(
                `${backendUrl}/api/share/${item._id}/seen`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              )
            )
          );
          setShares((prev) =>
            prev.map((item) =>
              item.status === "unseen" ? { ...item, status: "seen", seenAt: new Date().toISOString() } : item
            )
          );
        }
      }
      else message.error(data.message || "Unable to load shared documents");
    } catch {
      message.error("Unable to load shared documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
    loadPatients();
  }, [token]);

  const loadPatients = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/share/doctor/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setPatients(data.patients || []);
    } catch {
      setPatients([]);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map();
    shares.forEach((item) => {
      const key = item.patientId || "unknown";
      if (!map.has(key)) {
        map.set(key, { patientName: item.patientName || "Patient", items: [] });
      }
      map.get(key).items.push(item);
    });
    return Array.from(map.values());
  }, [shares]);

  const markSeen = async (shareId) => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/share/${shareId}/seen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setShares((prev) =>
          prev.map((item) => (item._id === shareId ? { ...item, status: "seen", seenAt: new Date().toISOString() } : item))
        );
      }
    } catch {
      message.error("Unable to mark seen");
    }
  };

  const submitFeedback = async (shareId) => {
    const feedback = String(feedbackById[shareId] || "").trim();
    if (!feedback) return;
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/share/${shareId}/feedback`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        message.success("Feedback sent");
        setShares((prev) =>
          prev.map((item) => (item._id === shareId ? { ...item, feedback, status: "seen" } : item))
        );
      } else {
        message.error(data.message || "Unable to send feedback");
      }
    } catch {
      message.error("Unable to send feedback");
    }
  };

  const deleteShare = async (shareId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/share/${shareId}/doctor`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        message.success("Shared record deleted");
        setShares((prev) => prev.filter((item) => item._id !== shareId));
      } else {
        message.error(data.message || "Unable to delete");
      }
    } catch {
      message.error("Unable to delete");
    }
  };

  const sendReportToPatient = async () => {
    if (!selectedPatientId) {
      message.warning("Select patient");
      return;
    }
    if (!String(reportTitle).trim() && !String(reportBody).trim()) {
      message.warning("Add report title or report details");
      return;
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/share/to-patient`,
        {
          patientId: selectedPatientId,
          reportTitle: reportTitle.trim(),
          reportBody: reportBody.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        message.success("Report sent to patient");
        setReportTitle("");
        setReportBody("");
        loadShares();
      } else {
        message.error(data.message || "Unable to send report");
      }
    } catch {
      message.error("Unable to send report");
    }
  };

  if (loading) return <PageLoader minHeight={260} label="Loading shared documents..." />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Shared Documents</h1>
      <p className="text-sm text-slate-600 mb-6">
        Review patient-shared files, mark updates as seen, and send feedback.
      </p>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
        <h2 className="text-lg font-semibold mb-3 text-slate-800">Send Report to Patient</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Report title"
            className="border rounded-lg px-3 py-2"
          />
          <textarea
            rows={3}
            value={reportBody}
            onChange={(e) => setReportBody(e.target.value)}
            placeholder="Report details"
            className="border rounded-lg px-3 py-2 md:col-span-2"
          />
        </div>
        <button
          onClick={sendReportToPatient}
          className="mt-3 px-4 py-2 rounded bg-blue-600 text-white text-sm"
        >
          Send Report
        </button>
      </div>
      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.patientName} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">{group.patientName}</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                {group.items.length} share{group.items.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3">
              {group.items.map((share) => (
                <div key={share._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="text-sm text-slate-700">
                      <p>
                        <span className="font-semibold">Shared:</span>{" "}
                        {formatDateTimeDDMMYYYY(share.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        share.status === "unseen"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}
                    >
                      {share.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-700">Reason</p>
                    <p className="text-sm text-slate-600">{share.reason || "N/A"}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Documents</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(share.documents || []).map((doc) => (
                        <div
                          key={doc._id}
                          className="rounded-lg border border-slate-200 bg-white p-2 flex items-center justify-between gap-2"
                        >
                          <p className="text-sm text-slate-700 truncate">
                            {doc.filename || doc.facilityName || "Document"}
                          </p>
                          <a
                            href={`${backendUrl}/api/documents/file/${doc._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 font-medium"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {share.status === "unseen" && (
                    <button
                      onClick={() => markSeen(share._id)}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                    >
                      Mark Seen
                    </button>
                  )}
                  <div className="mt-3">
                    <textarea
                      rows={2}
                      placeholder="Write feedback to patient"
                      value={feedbackById[share._id] ?? share.feedback ?? ""}
                      onChange={(e) =>
                        setFeedbackById((prev) => ({ ...prev, [share._id]: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => submitFeedback(share._id)}
                      className="mt-2 px-3 py-1 rounded bg-emerald-600 text-white text-sm"
                    >
                      Send Feedback
                    </button>
                    <button
                      onClick={() => deleteShare(share._id)}
                      className="mt-2 ml-2 px-3 py-1 rounded bg-red-600 text-white text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!grouped.length && <p className="text-gray-500">No shared documents found.</p>}
      </div>
    </div>
  );
};

export default DoctorSharedDocuments;
