import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { Dropdown, message, Space } from "antd";
import { AppContext } from "../Context/AppContext";

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
  const { user, setShowLogin, logout } = useContext(AppContext);

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
            className={({ isActive }) =>
              isActive ? "!underline" : "hover:!underline"
            }
          >
            Dashboard
          </NavLink>
        </Dropdown>

        <NavLink
          to="/Records"
          className={({ isActive }) =>
            isActive ? "!underline" : "hover:!underline"
          }
        >
          Records
        </NavLink>

        <NavLink
          to="/Reminders"
          className={({ isActive }) =>
            isActive ? "!underline" : "hover:!underline"
          }
        >
          Reminders
        </NavLink>

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
        {user ? (
          <NavLink
            to="/Profile"
            className={({ isActive }) =>
              isActive ? "!underline" : "hover:!underline"
            }
          >
            Profile
          </NavLink>
        ) : null}

        {/* LOGIN / LOGOUT  */}
        <div className="flex items-center gap-5">
          {user ? (
            // LOGGED
            <div className="flex items-center gap-4">
              <p className="text-gray-700">Hi, {user.name}</p>

              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-1 rounded-full"
              >
                Logout
              </button>
            </div>
          ) : (
            // NOT LOGGED IN
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 text-white px-5 py-1 rounded-full"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
