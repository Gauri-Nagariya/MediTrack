import React, { useContext, useEffect, useMemo, useState } from "react";
// import Nav from "./components/Nav";
const Nav = React.lazy(() => import("./components/Nav"));

import { Route, Routes, useLocation, Navigate } from "react-router-dom";
// import Dashboard from "./Pages/Dashboard";
const Dashboard = React.lazy(() => import("./Pages/Dashboard"));

// import Records from "./Pages/Records/Records";
const Records = React.lazy(() => import("./Pages/Records/Records"));

// import Reminder from "./Pages/Reminders/Reminder";
const Reminder = React.lazy(() => import("./Pages/Reminders/Reminder"));

// import Emergency from "./Pages/Emergency";
const Emergency = React.lazy(() => import("./Pages/Emergency"));

// import Profile from "./Pages/Profile/Profile";
const Profile = React.lazy(() => import("./Pages/Profile/Profile"));

// import Prescriptions from "./Pages/Records/Prescriptions";
const Prescriptions = React.lazy(() => import("./Pages/Records/Prescriptions"));

// import TestReports from "./Pages/Records/TestReports";
const TestReports = React.lazy(() => import("./Pages/Records/TestReports"));

// import BillsInvoices from "./Pages/Records/BillsInvoices";
const BillsInvoices = React.lazy(() => import("./Pages/Records/BillsInvoices"));

// import MedicalRecords from "./Pages/Records/MedicalRecords";
const MedicalRecords = React.lazy(() =>
  import("./Pages/Records/MedicalRecords")
);

// import UploadDocuments from "./Pages/Records/UploadDocuments";
const UploadDocuments = React.lazy(() =>
  import("./Pages/Records/UploadDocuments")
);

// import LoginForm from "./components/LoginForm";
const LoginForm = React.lazy(() => import("./components/LoginForm"));

import { AppContext } from "./Context/AppContext";
// import MedicalInformation from "./Pages/Profile/MedicalInformation";
const MedicalInformation = React.lazy(() =>
  import("./Pages/Profile/MedicalInformation")
);

// import Setting from "./Pages/Profile/Setting";
const Setting = React.lazy(() => import("./Pages/Profile/Setting"));
const ProfileAppointments = React.lazy(() =>
  import("./Pages/Profile/Appointments")
);
const AppointmentDetails = React.lazy(() =>
  import("./Pages/Profile/AppointmentDetails")
);

// import History from "./Pages/Profile/History";
const History = React.lazy(() => import("./Pages/Profile/History"));

// import CreateProfile from "./Pages/Createprofile";
// const CreateProfile = React.lazy(()=> import("./Pages/Createprofile"))

// import YourInformation from "./Pages/Profile/YourInformation";
const YourInformation = React.lazy(() =>
  import("./Pages/Profile/YourInformation")
);
const DoctorDashboard = React.lazy(() =>
  import("./Pages/Doctor/DoctorDashboard")
);
const DoctorProfile = React.lazy(() => import("./Pages/Doctor/DoctorProfile"));
const DoctorAppointments = React.lazy(() =>
  import("./Pages/Doctor/DoctorAppointments")
);
const DoctorAppointmentsHistory = React.lazy(() =>
  import("./Pages/Doctor/DoctorAppointmentsHistory")
);
const DoctorAppointmentsStatusDetails = React.lazy(() =>
  import("./Pages/Doctor/DoctorAppointmentsStatusDetails")
);
const DoctorAppointmentDetails = React.lazy(() =>
  import("./Pages/Doctor/DoctorAppointmentDetails")
);
const DoctorSharedDocuments = React.lazy(() =>
  import("./Pages/Doctor/DoctorSharedDocuments")
);
const BookAppointments = React.lazy(() =>
  import("./Pages/Patient/BookAppointments")
);
const DoctorDetails = React.lazy(() => import("./Pages/Patient/DoctorDetails"));

import { subscribeUser } from "./utils/pushSubscribe";
import { Suspense } from "react";
import { Tour } from "antd";
import PageLoader from "./components/PageLoader";

const App = () => {
  const location = useLocation();
  const { user, showLogin, setShowLogin, loading } = useContext(AppContext);
  const [showTour, setShowTour] = useState(false);
  const isDoctor = user?.role === "doctor";
  const onboardingKey = user?._id ? `meditrack-tour-seen-${user._id}` : null;

  const patientTourSteps = useMemo(
    () => [
      {
        title: "Dashboard",
        description: "Check health highlights, quick actions, and updates here.",
        target: () => document.getElementById("nav-dashboard"),
      },
      {
        title: "Records",
        description: "Store and organize prescriptions, reports, bills, and more.",
        target: () => document.getElementById("nav-records"),
      },
      {
        title: "Reminders",
        description: "Set medicine and health reminders so you never miss a dose.",
        target: () => document.getElementById("nav-reminders"),
      },
      {
        title: "Book Appointments",
        description: "Find doctors and schedule visits in a few clicks.",
        target: () => document.getElementById("nav-appointments"),
      },
      {
        title: "Profile",
        description: "Manage your personal info, medical details, and settings.",
        target: () => document.getElementById("nav-profile"),
      },
    ],
    []
  );

  const doctorTourSteps = useMemo(
    () => [
      {
        title: "Doctor Dashboard",
        description: "View your summary and key updates at a glance.",
        target: () => document.getElementById("nav-doctor-dashboard"),
      },
      {
        title: "Doctor Profile",
        description: "Keep your profile and professional details up to date.",
        target: () => document.getElementById("nav-doctor-profile"),
      },
      {
        title: "Appointments",
        description: "Track current and upcoming patient appointments.",
        target: () => document.getElementById("nav-doctor-appointments"),
      },
    ],
    []
  );

  const tourSteps = isDoctor ? doctorTourSteps : patientTourSteps;

  // Whenever user is not logged in and tries to navigate, show login form
  //   useEffect(() => {
  //   if (!loading && !user) {
  //     setShowLogin(true);
  //   }
  // }, [loading, user, location]);

  useEffect(() => {
    if (!loading && !user && location.pathname !== "/") {
      setShowLogin(true);
    }
  }, [loading, user, location]);

  useEffect(() => {
    if (loading || !user?._id || !onboardingKey) return;
    const shouldShowAfterSignup =
      localStorage.getItem("meditrack-show-tour-after-signup") === "true";
    const alreadySeenTour = localStorage.getItem(onboardingKey) === "true";
    if (shouldShowAfterSignup && !alreadySeenTour) {
      setShowTour(true);
      localStorage.removeItem("meditrack-show-tour-after-signup");
    }
  }, [loading, user, onboardingKey]);

  useEffect(() => {
    if (!loading && user?._id) {
      // Subscribe browser for push notifications
      subscribeUser(user._id);
    }
  }, [user, loading]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("✅ SW registered"))
        .catch((err) => console.error("❌ SW failed", err));
    }
  }, []);

  useEffect(() => {
    const subscribe = async () => {
      const registration = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      const token = localStorage.getItem("token");

      await fetch("http://localhost:5000/api/reminders/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });
    };

    subscribe();
  }, []);

  return (
    <div>
      <Suspense
        fallback={<PageLoader minHeight={"100vh"} label="Loading..." />}
      >
        <Nav />

        <Tour
          open={showTour}
          onClose={() => {
            setShowTour(false);
            if (onboardingKey) {
              localStorage.setItem(onboardingKey, "true");
            }
          }}
          steps={tourSteps}
          nextButtonProps={{ children: "Next" }}
          prevButtonProps={{ children: "Back" }}
        />

        {showLogin && (
          <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/50">
            <LoginForm />
          </div>
        )}

        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* <Route path="/CreateProfile" element={<CreateProfile />} /> */}
          {/* <Route 
  path="/CreateProfile" 
  element={user ? <CreateProfile /> : <Navigate to="/" replace />} 
/> */}

          <Route
            path="/records/*"
            element={
              loading
                ? null
                : user && !isDoctor
                ? <Records />
                : <Navigate to="/" replace />
            }
          >
            {user && (
              <>
                <Route index element={<UploadDocuments />} />
                <Route path="prescriptions" element={<Prescriptions />} />
                <Route path="test-reports" element={<TestReports />} />
                <Route path="bills" element={<BillsInvoices />} />
                <Route path="medical-records" element={<MedicalRecords />} />
              </>
            )}
          </Route>

          <Route
            path="/reminders"
            element={
              loading
                ? null
                : user && !isDoctor
                ? <Reminder />
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/book-appointments"
            element={
              loading
                ? null
                : user && !isDoctor
                ? <BookAppointments />
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/book-appointments/doctor/:doctorId"
            element={
              loading
                ? null
                : user && !isDoctor
                ? <DoctorDetails />
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/emergency"
            element={
              loading ? null : user ? <Profile /> : <Navigate to="/" replace />
            }
          />
          {/* <Route
    path="/profile"
    element={user ? <Profile /> : <Navigate to="/" replace />}
  /> */}

          <Route
            path="/profile/*"
            element={user && !isDoctor ? <Profile /> : <Navigate to="/" replace />}
          >
            {user && (
              <>
                <Route index element={<YourInformation />} />
                <Route
                  path="MedicalInformation"
                  element={<MedicalInformation />}
                />
                <Route path="History" element={<History />} />
                <Route path="Appointments" element={<ProfileAppointments />} />
                <Route
                  path="Appointments/:appointmentId"
                  element={<AppointmentDetails />}
                />
                <Route path="Setting" element={<Setting />} />
              </>
            )}
          </Route>

          <Route
            path="/doctor/dashboard"
            element={
              user && isDoctor ? <DoctorDashboard /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/doctor/profile"
            element={
              user && isDoctor ? <DoctorProfile /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              user && isDoctor ? <DoctorAppointments /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/doctor/appointments-history"
            element={
              user && isDoctor ? (
                <DoctorAppointmentsHistory />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/doctor/shared-documents"
            element={
              user && isDoctor ? <DoctorSharedDocuments /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/doctor/appointments/:appointmentId"
            element={
              user && isDoctor ? (
                <DoctorAppointmentDetails />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/doctor/appointments-status/:status"
            element={
              user && isDoctor ? (
                <DoctorAppointmentsStatusDetails />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
