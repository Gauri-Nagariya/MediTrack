import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { formatDateTimeDDMMYYYY } from "../../utils/dateFormat";
import PageLoader from "../../components/PageLoader";

const allowedStatuses = ["all", "pending", "done", "rejected", "cancelled"];
const getStatusBadgeClass = (status) => {
  if (status === "done") return "bg-green-100 text-green-700";
  if (status === "cancelled" || status === "rejected") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
};

const statusMeta = {
  all: {
    title: "All Appointments",
    subtitle: "Complete list of your appointments.",
  },
  pending: {
    title: "Pending Appointments",
    subtitle: "Appointments waiting for your action.",
  },
  done: {
    title: "Completed Appointments",
    subtitle: "All consultations marked as done.",
  },
  rejected: {
    title: "Rejected Appointments",
    subtitle: "Appointments rejected with doctor reason.",
  },
  cancelled: {
    title: "Cancelled Appointments",
    subtitle: "Appointments cancelled by patients.",
  },
};

const DoctorAppointmentsStatusDetails = () => {
  const { status = "all" } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const normalizedStatus = allowedStatuses.includes(status) ? status : "all";

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!data.success) return;
        setAppointments(data.appointments || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) loadAppointments();
  }, [backendUrl, token]);

  const filteredAppointments = useMemo(() => {
    if (normalizedStatus === "all") return appointments;
    return appointments.filter((appointment) => appointment.status === normalizedStatus);
  }, [appointments, normalizedStatus]);

  if (isLoading) {
    return <PageLoader minHeight={260} label="Loading status details..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate("/doctor/dashboard")}
        className="mb-5 text-sm font-medium text-cyan-700 hover:underline"
      >
        Back to dashboard
      </button>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          {statusMeta[normalizedStatus].title}
        </h1>
        <p className="text-slate-600 mt-2">{statusMeta[normalizedStatus].subtitle}</p>
        <p className="text-slate-500 mt-3 text-sm">
          Total records: <span className="font-semibold text-slate-700">{filteredAppointments.length}</span>
        </p>
      </div>

      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div
            key={appointment._id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{appointment.patientName}</p>
                <p className="text-sm text-slate-600">{appointment.patientEmail || "No email provided"}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {formatDateTimeDDMMYYYY(appointment.appointmentDate)}
                </p>
              </div>
              <div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>

            {!!appointment.patientStatusReason && (
              <p className="text-sm text-orange-700 mt-3">
                Cancelled by patient: {appointment.patientStatusReason}
              </p>
            )}
            {!!appointment.doctorStatusReason && (
              <p className="text-sm text-rose-700 mt-1">
                Doctor reason: {appointment.doctorStatusReason}
              </p>
            )}
          </div>
        ))}

        {!filteredAppointments.length && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            No appointments found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentsStatusDetails;
