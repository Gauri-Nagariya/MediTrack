import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import axios from "axios";

const ReminderList = ({ refresh }) => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetchReminders();
    // const interval = setInterval(fetchReminders, 60000);
    const interval = setInterval(fetchReminders, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const fetchReminders = async () => {
    const res = await axios.get("http://localhost:5000/api/reminders");
    setReminders(res.data);
    triggerNotifications(res.data);
  };

  const triggerNotifications = (reminders) => {
    if (Notification.permission === "granted") {
      reminders.forEach(r => {
        const reminderTime = new Date(r.time);
       if (!r.notified && new Date(r.time) <= new Date()) {
  new Notification("Reminder", { body: r.title });
}
      });
    }
  };

  const deleteReminder = async (id) => {
    await axios.delete(`http://localhost:5000/api/reminders/${id}`);
    fetchReminders();
  };

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Description", dataIndex: "description" },
    { title: "Time", dataIndex: "time", render: t => new Date(t).toLocaleString() },
    {
      title: "Action",
      render: (_, record) => (
        <Button danger onClick={() => deleteReminder(record._id)}>Delete</Button>
      )
    }
  ];

  return <Table dataSource={reminders} columns={columns} rowKey="_id" />;
};

export default ReminderList;
