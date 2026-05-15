import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";
import PageLoader from "../../components/PageLoader";

const DoctorDashboard = () => {
  const { backendUrl, token, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    done: 0,
    rejected: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!data.success) return;
        const all = data.appointments || [];
        setCounts({
          all: all.length,
          pending: all.filter((a) => a.status === "pending").length,
          done: all.filter((a) => a.status === "done").length,
          rejected: all.filter((a) => a.status === "rejected").length,
          cancelled: all.filter((a) => a.status === "cancelled").length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) load();
  }, [backendUrl, token]);

  const statusCards = useMemo(
    () => [
      {
        key: "all",
        label: "All Appointments",
        value: counts.all,
        hint: "Total assigned appointments",
        tone: "bg-slate-700",
      },
      {
        key: "pending",
        label: "Pending",
        value: counts.pending,
        hint: "Need your response",
        tone: "bg-amber-500",
      },
      {
        key: "done",
        label: "Done",
        value: counts.done,
        hint: "Completed consultations",
        tone: "bg-emerald-600",
      },
      {
        key: "rejected",
        label: "Rejected",
        value: counts.rejected,
        hint: "Declined by doctor",
        tone: "bg-rose-600",
      },
      {
        key: "cancelled",
        label: "Cancelled",
        value: counts.cancelled,
        hint: "Cancelled by patient",
        tone: "bg-zinc-500",
      },
    ],
    [counts]
  );

  if (isLoading) {
    return <PageLoader minHeight={280} label="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="rounded-3xl bg-gradient-to-r from-slate-800 via-cyan-800 to-teal-700 text-white p-8 shadow-xl mb-8">
        <p className="text-sm tracking-wide uppercase text-cyan-100">Care Command Center</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-2">Welcome, Dr. {user?.name || "Doctor"}</h1>
        <p className="mt-3 text-cyan-50 max-w-2xl">
          Track appointments, monitor patient flow, and open each category for complete details.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statusCards.map((card) => (
          <button
            key={card.key}
            onClick={() => navigate(`/doctor/appointments-status/${card.key}`)}
            className="group text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className={`w-10 h-10 rounded-xl ${card.tone} text-white flex items-center justify-center font-semibold`}>
              {card.value}
            </div>
            <p className="mt-4 text-sm text-slate-500">{card.hint}</p>
            <h2 className="text-lg font-semibold text-slate-800">{card.label}</h2>
            <p className="mt-3 text-sm text-cyan-700 font-medium group-hover:underline">
              View details
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
