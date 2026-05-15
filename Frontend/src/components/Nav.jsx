import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { Button, Dropdown, Modal } from "antd";
import { AppContext } from "../Context/AppContext";
import axios from "axios";

const handleMenuClick = ({ key }) => {
  const section = document.getElementById(key);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

const items = [
  {
    label: "Features",
    key: "features", // matches <section id="home">
  },
  {
    label: "Why Us",
    key: "whyUs", // matches <section id="features">
  },
  {
    label: "FAQs",
    key: "faqs", // matches <section id="contact">
  },
  {
    label: "Get Started",
    key: "getStarted", // matches <section id="contact">
  },
  {
    label: "Contact Us",
    key: "footer", // matches <section id="contact">
  },
];

const Nav = () => {
  const { user, token, backendUrl, setShowLogin, logout } = useContext(AppContext);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [unseenShareCount, setUnseenShareCount] = useState(0);
  const isDoctor = user?.role === "doctor";

  React.useEffect(() => {
    const loadCount = async () => {
      if (!isDoctor || !token) return;
      try {
        const { data } = await axios.get(`${backendUrl}/api/share/doctor/unseen-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setUnseenShareCount(data.count || 0);
      } catch {
        setUnseenShareCount(0);
      }
    };
    loadCount();
  }, [isDoctor, token, backendUrl]);

  return (
    <nav className="sticky top-0 z-50 bg-white h-16 flex items-center justify-end pr-16 font-medium font-acumin-pro text-md shadow-sm">
      <Link to="/">
        <img
          src={logo}
          alt="logo"
          className="absolute top-2 left-10 h-12 cursor-pointer"
        />
      </Link>

      <div className="flex gap-20 mt-2">
        {/* <Link to="/"> */}
        {/* <Dropdown menu={{ items, onClick: handleMenuClick }}>
      <Link to="/">
        <Space>Dashboard</Space>
      </Link>
    </Dropdown> */}

        <Dropdown menu={{ items, onClick: handleMenuClick }}>
          <NavLink
            to="/"
            id="nav-dashboard"
            className={({ isActive }) =>
              isActive ? "!underline" : "hover:!underline"
            }
          >
            Dashboard
          </NavLink>
        </Dropdown>

        {!isDoctor && (
          <NavLink
            to="/Records"
            id="nav-records"
            className={({ isActive }) =>
              isActive ? "!underline" : "hover:!underline"
            }
          >
            Records
          </NavLink>
        )}

        {!isDoctor && (
          <NavLink
            to="/Reminders"
            id="nav-reminders"
            className={({ isActive }) =>
              isActive ? "!underline" : "hover:!underline"
            }
          >
            Reminders
          </NavLink>
        )}

        {!isDoctor && (
          <NavLink
            to="/book-appointments"
            id="nav-appointments"
            className={({ isActive }) =>
              isActive ? "!underline" : "hover:!underline"
            }
          >
            Book Appointment
          </NavLink>
        )}

        {/* <NavLink
          to="/Emergency"
          className={({ isActive }) =>
            isActive
              ? "!underline"
              : "hover:!underline"
          }
        >
          Emergency
        </NavLink> */}

        {/* <Link to="/CreateProfile">create</Link> */}

        {/* SHOW PROFILE ONLY IF LOGGED IN */}
        {user && !isDoctor ? (
          <NavLink
            to="/Profile"
            id="nav-profile"
            className={({ isActive }) =>
              isActive ? "!underline" : "hover:!underline"
            }
          >
            Profile
          </NavLink>
        ) : null}

        {user && isDoctor ? (
          <>
            <NavLink
              to="/doctor/dashboard"
              id="nav-doctor-dashboard"
              className={({ isActive }) =>
                isActive ? "!underline" : "hover:!underline"
              }
            >
              Doctor Dashboard
            </NavLink>
            <NavLink
              to="/doctor/profile"
              id="nav-doctor-profile"
              className={({ isActive }) =>
                isActive ? "!underline" : "hover:!underline"
              }
            >
              Doctor Profile
            </NavLink>
            <NavLink
              to="/doctor/appointments"
              id="nav-doctor-appointments"
              className={({ isActive }) =>
                isActive ? "!underline" : "hover:!underline"
              }
            >
              Appointments
            </NavLink>
            <NavLink
              to="/doctor/appointments-history"
              className={({ isActive }) =>
                isActive ? "!underline" : "hover:!underline"
              }
            >
              Appointments History
            </NavLink>
            <NavLink
              to="/doctor/shared-documents"
              className={({ isActive }) =>
                isActive ? "!underline" : "hover:!underline"
              }
            >
              <span className="inline-flex items-center gap-2">
                Shared Files
                {unseenShareCount > 0 && (
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                )}
              </span>
            </NavLink>
          </>
        ) : null}

        {/* LOGIN / LOGOUT  */}
        <div className="flex items-center gap-5">
          {user ? (
            // LOGGED
            <div className="flex items-center gap-4">
              <p className="text-gray-700">Hi, {user.name}</p>

              <button
                onClick={() => setLogoutModalOpen(true)}
                id="nav-logout"
                className="bg-red-500 text-white px-4 py-1 rounded-full"
              >
                Logout
              </button>
            </div>
          ) : (
            // NOT LOGGED IN
            <button
              onClick={() => setShowLogin(true)}
              id="nav-login"
              className="bg-blue-600 text-white px-5 py-1 rounded-full"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <Modal
        title="Confirm Logout"
        open={logoutModalOpen}
        centered
        onCancel={() => setLogoutModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setLogoutModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="logout"
            danger
            type="primary"
            onClick={() => {
              setLogoutModalOpen(false);
              logout();
            }}
          >
            Logout
          </Button>,
        ]}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </nav>
  );
};

export default Nav;
