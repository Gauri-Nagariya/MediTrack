import React, { useContext, useEffect } from "react";
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

// import History from "./Pages/Profile/History";
const History = React.lazy(() => import("./Pages/Profile/History"));

// import CreateProfile from "./Pages/Createprofile";
// const CreateProfile = React.lazy(()=> import("./Pages/Createprofile"))

// import YourInformation from "./Pages/Profile/YourInformation";
const YourInformation = React.lazy(() =>
  import("./Pages/Profile/YourInformation")
);

import { subscribeUser } from "./utils/pushSubscribe";
import { Suspense } from "react";

const App = () => {
  const location = useLocation();
  const { user, showLogin, setShowLogin, loading } = useContext(AppContext);

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
        fallback={
          <p className="text-2xl flex justify-center h-screen items-center">
            Loading...
          </p>
        }
      >
        <Nav />

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
              loading ? null : user ? <Records /> : <Navigate to="/" replace />
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
              loading ? null : user ? <Reminder /> : <Navigate to="/" replace />
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
            element={user ? <Profile /> : <Navigate to="/" replace />}
          >
            {user && (
              <>
                <Route index element={<YourInformation />} />
                <Route
                  path="MedicalInformation"
                  element={<MedicalInformation />}
                />
                <Route path="History" element={<History />} />
                <Route path="Setting" element={<Setting />} />
              </>
            )}
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
