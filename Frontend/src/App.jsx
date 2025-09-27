import React from "react";
import Nav from "./components/Nav";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Records from "./components/Records";
import Reminder from "./Pages/ReminderHome";
import Emergency from "./components/Emergency";
import Profile from "./components/Profile";

const App = () => {
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/records" element={<Records />} />
        <Route path="/reminders" element={<Reminder />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
};

export default App;
