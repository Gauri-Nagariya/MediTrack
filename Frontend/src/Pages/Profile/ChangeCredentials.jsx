// import React, { useState } from "react";
// import { Modal, Button, Input, Typography, message } from "antd";

// const { Text } = Typography;

// export default function ChangeCredentials({ userId, backendUrl }) {
//   const [open, setOpen] = useState(false);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const saveChanges = async () => {
//     if (!username.trim()) {
//       message.error("Username cannot be empty");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${backendUrl}/api/profile/update/${userId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username,
//           ...(password ? { password } : {}), // send password only if entered
//         }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         message.success("Credentials updated successfully!");
//         setOpen(false);
//         setPassword("");
//       } else {
//         message.error(data.message || "Failed to update credentials");
//       }
//     } catch (err) {
//       console.error(err);
//       message.error("Error updating credentials");
//     }
//     setLoading(false);
//   };

//   return (
//     <>
//       <Button type="primary" onClick={() => setOpen(true)}>
//         Change Username / Password
//       </Button>

//       <Modal
//         title="Change Username and Password"
//         open={open}
//         onCancel={() => setOpen(false)}
//         onOk={saveChanges}
//         confirmLoading={loading}
//       >
//         <Text strong>Username:</Text>
//         <Input
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           style={{ marginBottom: 12, marginTop: 4 }}
//         />

//         <Text strong>Password:</Text>
//         <Input.Password
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Leave blank to keep current password"
//           style={{ marginTop: 4 }}
//         />
//       </Modal>
//     </>
//   );
// }
