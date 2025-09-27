import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
// import { DownOutlined } from "@ant-design/icons";
import { Dropdown, message, Space } from "antd";

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
  return (
    // <nav className="bg-white h-16 flex items-center justify-end pr-16 relative font-medium font-acumin-pro text-md shadow-sm">
    <nav className="sticky top-0 z-50 bg-white h-16 flex items-center justify-end pr-16 font-medium font-acumin-pro text-md shadow-sm">

      <Link to="/">
        <img
          src={logo}
          alt="logo"
          className="absolute top-2 left-10 h-12 cursor-pointer"
        />
      </Link>

      <div className="flex gap-20">
        <Link to="/">
          <Dropdown menu={{ items, onClick: handleMenuClick }}>
            <Link to="/">
              <Space>Dashboard</Space>
            </Link>
          </Dropdown>
        </Link>
        <Link to="/Records">Records</Link>
        <Link to="/Reminders">Reminders</Link>
        <Link to="/Emergency">Emergency</Link>
        <Link to="/Profile">Profile</Link>
      </div>
    </nav>
  );
};

export default Nav;

