// import React, { useEffect, useState, useContext } from "react";
// import {
//   Card,
//   Row,
//   Col,
//   Input,
//   Switch,
//   Button,
//   DatePicker,
//   TimePicker,
//   Select,
//   Form,
//   message,
// } from "antd";
// import axios from "axios";
// import { AppContext } from "../../Context/AppContext";
// import moment from "moment";

// const Reminder = () => {
//   const { user, backendUrl } = useContext(AppContext);
//   const [reminders, setReminders] = useState([]);
//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (user) fetchReminders();
//   }, [user]);

//   const fetchReminders = async () => {
//     try {
//       const token = localStorage.getItem("token"); // auth token
//       const { data } = await axios.get(`${backendUrl}/api/reminders`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (data.success) {
//         setReminders(data.reminders);
//       }
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to fetch reminders");
//     }
//   };

//   const onFinish = async (values) => {
//   try {
//     const formattedTime = values.time
//       ? values.time.format("HH:mm")
//       : null;

//     const payload = {
//       ...values,
//       time: formattedTime,
//       date: values.date.format("YYYY-MM-DD"),
//     };

//     const token = localStorage.getItem("token");
//     const { data } = await axios.post(
//       `${backendUrl}/api/reminders`,
//       payload,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     if (data.success) {
//       message.success("Reminder saved!");
//       form.resetFields();
//       // OPTIONAL: Refresh list
//       // fetchReminders();
//     }
//   } catch (error) {
//     console.error(error);
//     message.error("Failed to save reminder");
//   }
// };

// const deleteReminder = async (id) => {
//   try {
//     const token = localStorage.getItem("token");

//     await axios.delete(`${backendUrl}/api/reminders/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     message.success("Reminder deleted");
//     setReminders((prev) => prev.filter((r) => r._id !== id));
//   } catch (err) {
//     console.error(err);
//     message.error("Delete failed");
//   }
// };

//   return (
//     <div className="flex gap-4">
//       <div
//         style={{
//           width: "40vw",
//           background: "white",
//           padding: 20,
//           borderRadius: 5,
//         }}
//       >
//         <Form layout="vertical" form={form} onFinish={onFinish}>
//           <h2>Set Reminder</h2>

//           <Form.Item
//             name="reminderType"
//             label="Reminder Type"
//             rules={[{ required: true }]}
//           >
//             <Select
//               options={[
//                 { label: "Medication", value: "medication" },
//                 { label: "Appointment", value: "appointment" },
//                 { label: "Test / Lab", value: "test" },
//                 { label: "Other", value: "other" },
//               ]}
//             />
//           </Form.Item>

//           <Form.Item name="title" label="Title" rules={[{ required: true }]}>
//             <Input placeholder="Take BP Medicine" />
//           </Form.Item>

//           <Form.Item name="notes" label="Notes">
//             <Input.TextArea rows={3} />
//           </Form.Item>

//           <div className="flex gap-4">
//             <Form.Item name="date" label="Date" rules={[{ required: true }]}>
//               <DatePicker />
//             </Form.Item>
//             <Form.Item name="time" label="Time" rules={[{ required: true }]}>
//               <TimePicker format="HH:mm" />
//             </Form.Item>
//           </div>

//           <Form.Item>
//             <Button type="primary" htmlType="submit" block>
//               Save Reminder
//             </Button>
//           </Form.Item>
//         </Form>
//       </div>

//       <div
//         style={{
//           flex: 1,
//           background: "white",
//           padding: 20,
//           borderRadius: 5,
//           maxHeight: "650px",
//           overflowY: "auto",
//         }}
//       >
//         <Row gutter={[16, 16]}>
//           {reminders.map((r) => (
//             <Col key={r._id} span={8}>
//               <Card
//   title={r.title}
//   extra={`${r.date} ${r.time}`}
//   actions={[
//     <Popconfirm
//       title="Are you sure you want to delete?"
//       okText="Yes"
//       cancelText="No"
//       onConfirm={() => deleteReminder(r._id)}
//       key="delete"
//     >
//       <span style={{ color: "red", cursor: "pointer" }}>Delete</span>
//     </Popconfirm>
//   ]}
// >
//   <p>Type: {r.reminderType}</p>
//   <p>Notes: {r.notes || "—"}</p>

//   <div className="flex items-center gap-2">
//     <strong>Status:</strong>
//     <Switch checked={r.status} />
//   </div>
// </Card>

//             </Col>
//           ))}
//         </Row>
//       </div>
//     </div>
//   );
// };

// export default Reminder;

import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Switch,
  Button,
  DatePicker,
  TimePicker,
  Select,
  Form,
  message,
  Popconfirm,
} from "antd";
import moment from "moment";
import axios from "axios";
import { AppContext } from "../../Context/AppContext";

const Reminder = () => {
  const { user, backendUrl } = useContext(AppContext);
  const [reminders, setReminders] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) fetchReminders();
  }, [user]);

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${backendUrl}/api/reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch reminders");
    }
  };

  // Save new reminder
  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        reminderType: Array.isArray(values.reminderType)
          ? values.reminderType[0] // take first value
          : values.reminderType,
        date: values.date.format("YYYY-MM-DD"),
        time: values.time.format("HH:mm"),
      };

      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${backendUrl}/api/reminders`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        message.success("Reminder saved!");
        form.resetFields();
        fetchReminders(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to save reminder");
    }
  };

  // Delete reminder
  const deleteReminder = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${backendUrl}/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Reminder deleted");
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  };

  // Toggle on/off
  // const toggleStatus = async (id, checked) => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     await axios.put(
  //       `${backendUrl}/api/reminders/${id}`,
  //       { status: checked },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     setReminders((prev) =>
  //       prev.map((r) => (r._id === id ? { ...r, status: checked } : r))
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     message.error("Failed to update status");
  //   }
  // };

  return (
    <div className="flex gap-4">
      {/* LEFT PANEL = ADD REMINDER FORM */}
      <div
        style={{
          height: "88vh",
          width: "35vw",
          background: "white",
          padding: 20,
          borderRadius: 5,
          margin: 10,
        }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <h2 className=" font-bold text-2xl text-blue-600 mb-10">
            Set Reminder
          </h2>

          <Form.Item
            name="reminderType"
            label="Reminder Type"
            rules={[
              { required: true, message: "Please select or enter a type" },
            ]}
          >
            <Select
              mode="tags" // allows manual input
              placeholder="Select or type a reminder type"
              options={[
                { label: "Medication", value: "medication" },
                { label: "Appointment", value: "appointment" },
                { label: "Test / Lab", value: "test" },
                { label: "Other", value: "other" },
              ]}
            />
          </Form.Item>

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Take BP Medicine" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item name="time" label="Time" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" valueFormat="HH:mm" />
            </Form.Item>
          </div>

          <Button type="primary" htmlType="submit" block>
            Save Reminder
          </Button>
        </Form>
      </div>

      {/* RIGHT PANEL = REMINDERS LIST */}
      <div
        style={{
          flex: 1,
          background: "white",
          padding: 20,
          borderRadius: 5,
          maxHeight: "640px",
          overflowY: "auto",
          margin: 10,
        }}
      >
        <Row gutter={[16, 16]}>
          {reminders.map((r) => (
            <Col key={r._id} span={8}>
              <Card
                style={{
                  margin: 8,
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  opacity: r.sent ? 0.5 : 1, // Faded if sent
                  backgroundColor: r.sent ? "#f5f5f5" : "#ffffff", // optional light gray
                }}
                title={
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {r.title}{" "}
                    {r.sent && (
                      <span style={{ fontSize: 12, color: "green" }}>
                        ✔ Done
                      </span>
                    )}
                  </div>
                }
              >
                <div style={{ marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 14 }}>
                    <strong>Type:</strong> {r.reminderType}
                  </p>

                  <p style={{ margin: 0, fontSize: 14 }}>
                    <strong>Date:</strong> {r.date}
                  </p>

                  <p style={{ margin: "6px 0 0 0", fontSize: 14 }}>
                    <strong>Time:</strong>{" "}
                    {moment(`${r.date} ${r.time}`, "YYYY-MM-DD HH:mm").format(
                      "HH:mm"
                    )}
                  </p>

                  {/* Show notes only if available */}
                  {r.notes && (
                    <p style={{ margin: "6px 0 0 0", fontSize: 14 }}>
                      <strong>Notes:</strong> {r.notes}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    marginTop: 14,
                    paddingTop: 14,
                  }}
                >
                  <Popconfirm
                    title="Are you sure you want to delete?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => deleteReminder(r._id)}
                  >
                    <Button
                      danger
                      block
                      style={{
                        borderRadius: 8,
                        fontWeight: 600,
                      }}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Reminder;
