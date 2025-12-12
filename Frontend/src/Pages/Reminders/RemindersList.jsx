// import { useEffect, useState } from "react";
// import { Card, Row, Col, Switch, message, Button, Popconfirm } from "antd";
// import axios from "axios";

// const backendUrl = import.meta.env.VITE_BACKEND_URL;
// const RemindersList = ({ userId }) => {
//   const [reminders, setReminders] = useState([]);

//   useEffect(() => {
//     fetchReminders();
//   }, []);

//   const fetchReminders = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const { data } = await axios.get(`${backendUrl}/api/reminders`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setReminders(data.reminders);
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to load reminders");
//     }
//   };

//   const toggleStatus = async (id, checked) => {
//     try {
//       const token = localStorage.getItem("token");

//       await axios.put(
//         `http://localhost:5000/api/reminders/${id}`,
//         { status: checked },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setReminders((prev) =>
//         prev.map((r) => (r._id === id ? { ...r, status: checked } : r))
//       );
//     } catch (err) {
//       message.error("Failed to update status");
//     }
//   };

//   const deleteReminders = async (id) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/reminders/${reminder._id}`);
//       message.success("Deleted successfully");
//       setReminders((prev) => prev.filter((item) => item._id !== id));
//     } catch (err) {
//       message.error(err.response?.data?.message || "Delete failed");
//     }
//   };

//   return (
//     <Row gutter={[40, 46]}>
//       {reminders.map((reminder) => (
//         <Col key={reminder._id} span={8}>
//           <Card
//             title={reminder.title}
//             extra={
//               <span>
//                 {reminder.date} {reminder.time}
//               </span>
//             }
//             actions={[
//               <Popconfirm
//                 title="Are you sure you want to delete?"
//                 okText="Yes"
//                 cancelText="No"
//                 onConfirm={() => deleteReminders(item._id)}
//               >
//                 <Button type="link" danger>
//                   Delete
//                 </Button>
//               </Popconfirm>,
//             ]}
//           >
//             <p>Type: {reminder.reminderType}</p>
//             <p>Notes: {reminder.notes || "—"}</p>
//             <p>date: {reminder.time || "—"}</p>
//             <div className="flex items-center gap-3 mb-2">
//               <strong>Status:</strong>
//               <Switch
//                 checked={reminder.status}
//                 onChange={(checked) => toggleStatus(reminder._id, checked)}
//               />
//             </div>
//           </Card>
//         </Col>
//       ))}
//     </Row>
//   );
// };

// export default RemindersList;
