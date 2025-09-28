import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm } from "antd";
import axios from "axios";
import { List } from "antd";

const ReminderList = ({ refresh }) => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // Request permission once on mount
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    fetchReminders();
    const interval = setInterval(fetchReminders, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const fetchReminders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reminders");
      const data = res.data;
      setReminders(data);
      notifyDueReminders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const notifyDueReminders = (data) => {
    if (Notification.permission !== "granted") return;

    data.forEach(async (r) => {
      const reminderTime = new Date(r.time);
      const now = new Date();

      if (!r.notified && reminderTime <= now) {
        try {
          // Wrap in try/catch to avoid unhandled promise errors
          new Notification("Reminder", { body: r.title });

          // Mark as notified in backend
          await axios.patch(`http://localhost:5000/api/reminders/${r._id}`, { notified: true });
        } catch (err) {
          console.error("Notification error:", err);
        }
      }
    });
  };

  const deleteReminder = async (id) => {
    await axios.delete(`http://localhost:5000/api/reminders/${id}`);
    fetchReminders();
  };

   const editReminder = (item) => {
    // Placeholder: Implement opening form with pre-filled data
    console.log("Edit reminder:", item);
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

  // return <Table dataSource={reminders} columns={columns} rowKey="_id" />;
   return (
   <List
  itemLayout="horizontal"
  dataSource={reminders}
  renderItem={(item, index) => (
    <List.Item>
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        
        {/* Serial number */}
        {/* <div style={{ width: 30, fontWeight: "bold", color: "#000" }}>
          {index + 1}.
        </div> */}

        {/* Title + description */}
        <List.Item.Meta
          title={
            <div style={{ width: 30, fontWeight: "bold", color: "#000" }}>
          {index + 1}.
            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#000",  padding: 20, }}>
              {item.title}
            </span>
        </div>
          }
          description={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                 padding: "0px 30px"
              }}
            >
              <span style={{ fontSize: "14px", color: "#555" }}>
                {item.description}
              </span>
              <span style={{ fontSize: "14px", color: "#999", marginLeft: 10 }}>
                ⏰ {item.time}
              </span>
            </div>
          }
        />
      </div>
       <List.Item
          actions={[
            <Button type="link" onClick={() => editReminder(item)}>Edit</Button>,
            <Popconfirm
              title="Are you sure you want to delete this reminder?"
              onConfirm={() => deleteReminder(item._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>Delete</Button>
            </Popconfirm>
          ]}
        ></List.Item>
    </List.Item>

    
  )}
  pagination={{ pageSize: 6 }}
  style={{
    background: "white",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  }}
/>

  );
};

export default ReminderList;