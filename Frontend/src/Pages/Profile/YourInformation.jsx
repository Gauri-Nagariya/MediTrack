import React, { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Typography, Spin, Button, Modal, Input } from "antd";
import { AppContext } from "../../Context/AppContext";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  HeartOutlined,
  EditOutlined,
} from "@ant-design/icons";

import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Title, Text } = Typography;

const formatDate = (isoDate) => {
  if (!isoDate) return ""; // handle empty/null
  return dayjs(isoDate).format("DD/MM/YYYY");
};

export default function YourInformation() {
  // const { user } = useContext(AppContext);
  const { user, backendUrl } = useContext(AppContext);
  const userId = user?._id;
  // const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [profile, setProfile] = useState(null);

  const [open, setOpen] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [contacts, setContacts] = useState([{ name: "", phone: "" }]);

//   const isoDate = "2025-10-11T18:30:00.000Z";
// const formattedDate = dayjs(isoDate).format("DD/MM/YYYY");

// console.log(formattedDate); // "11/10/2025"

  useEffect(() => {
    if (!userId) return;

    // const fetchProfile = async () => {

    const fetchProfile = async () => {
      try {
        let res = await fetch(`${backendUrl}/api/profile/${userId}`);

        if (res.status === 404) {
          console.log("Profile not found. Creating a new one...");
          await fetch(`${backendUrl}/api/profile/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // body: JSON.stringify({ userId }),

            body: JSON.stringify({
  userId,
  fullName: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  phone: "",
  address: "",
  height: "",
  weight: "",
  emergencyContacts: []
})


          });
          // Fetch again
          res = await fetch(`${backendUrl}/api/profile/${userId}`);
        }

        const data = await res.json();
        setProfile(data || {});
        if (data?.emergencyContacts?.length > 0)
          setContacts(data.emergencyContacts);
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfile({});
      }
    };

    //   try {
    //     const res = await fetch(`${backendUrl}/api/profile/${userId}`);
    //     if (!res.ok) throw new Error("Failed to fetch profile");

    //     const data = await res.json();
    //     setProfile(data);

    //     // ✅ Load emergency contacts from DB
    //     if (data?.emergencyContacts?.length > 0) {
    //       setContacts(data.emergencyContacts);
    //     }
    //   } catch (error) {
    //     console.error("Error loading profile:", error);
    //   }
    // };

    fetchProfile();
  }, [userId]);

  const handleEdit = (field, value) => {
    setFieldName(field);
    setTempValue(value || "");
    setOpen(true);
  };

  // const saveChanges = async () => {
  //   if (!fieldName || !userId) return;

  //   try {
  //     const res = await fetch(`${backendUrl}/api/profile/update/${userId}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ [fieldName]: tempValue }),
  //     });

  //     if (!res.ok) throw new Error("Update failed");

  //     const data = await res.json();
  //     setProfile(data);
  //     setOpen(false);
  //   } catch (error) {
  //     console.error("Error updating profile:", error);
  //   }
  // };



  const saveChanges = async () => {
  if (!fieldName || !userId) return;

  try {
    await fetch(`${backendUrl}/api/profile/update/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [fieldName]: tempValue }),
    });

    // fetch latest profile
    const refreshed = await fetch(`${backendUrl}/api/profile/${userId}`);
    const updated = await refreshed.json();
    setProfile(updated);

    setOpen(false);
  } catch (error) {
    console.error("Error updating profile:", error);
  }
};

  const saveEmergencyContacts = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${backendUrl}/api/profile/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyContacts: contacts }),
      });

      if (!res.ok) throw new Error("Failed to save contacts");

      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("Saving emergency contacts failed:", error);
    }
  };

  if (!profile) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: 200 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#fafafa", padding: 16, borderRadius: 12 }}>
      {/* <Title
        level={2}
        style={{
          color: "#d32f2f",
          fontWeight: 800,
          marginBottom: 24,
        }}
      >
        Your Information
      </Title> */}

      <Row gutter={[20, 20]}>
         <InfoCard
    icon={<UserOutlined style={{ fontSize: 22, color: "#d32f2f" }} />}
    title="Personal Details"
    fields={[
      ["Full Name", "fullName", profile.fullName],
      ["Date of Birth", "dateOfBirth", formatDate(profile.dateOfBirth)], // ✅ formatted
      ["Gender", "gender", profile.gender],
      ["Blood Group", "bloodGroup", profile.bloodGroup],
    ]}
    onEdit={handleEdit}
  />

        <InfoCard
          icon={<PhoneOutlined style={{ fontSize: 22, color: "#d32f2f" }} />}
          title="Your Phone"
          fields={[["Phone Number", "phone", profile.phone]]}
          onEdit={handleEdit}
        />

        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 16,
              padding: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <PhoneOutlined style={{ fontSize: 22, color: "#d32f2f" }} />
              <Text strong style={{ marginLeft: 10, fontSize: 16 }}>
                Emergency Contacts
              </Text>
            </div>

            {contacts.map((contact, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <Text type="secondary">Emergency Name</Text>
                <Input
                  value={contact.name}
                  onChange={(e) => {
                    const newContacts = [...contacts];
                    newContacts[index].name = e.target.value;
                    setContacts(newContacts);
                  }}
                  style={{ marginBottom: 8 }}
                />

                <Text type="secondary">Emergency Phone</Text>
                <Input
                  value={contact.phone}
                  onChange={(e) => {
                    const newContacts = [...contacts];
                    newContacts[index].phone = e.target.value;
                    setContacts(newContacts);
                  }}
                />

                {contacts.length > 1 && (
                  <Button
                    danger
                    style={{ marginTop: 6 }}
                    onClick={() => {
                      const newContacts = contacts.filter(
                        (_, i) => i !== index
                      );
                      setContacts(newContacts);
                    }}
                  >
                    Remove
                  </Button>
                )}

                <div
                  style={{
                    borderBottom: "1px solid #eee",
                    marginTop: 12,
                  }}
                />
              </div>
            ))}

            <Button
              type="dashed"
              block
              onClick={() =>
                setContacts([...contacts, { name: "", phone: "" }])
              }
            >
              + Add Another Contact
            </Button>

            <Button
              type="primary"
              block
              style={{ marginTop: 12 }}
              onClick={saveEmergencyContacts}
            >
              Save Emergency Contacts
            </Button>
          </Card>
        </Col>

        <InfoCard
          icon={<HeartOutlined style={{ fontSize: 22, color: "#d32f2f" }} />}
          title="Health Details"
          fields={[
            ["Height (cm)", "height", profile.height],
            ["Weight (kg)", "weight", profile.weight],
          ]}
          onEdit={handleEdit}
        />

        <InfoCard
          icon={<HomeOutlined style={{ fontSize: 22, color: "#d32f2f" }} />}
          title="Address"
          fields={[["Home Address", "address", profile.address]]}
          onEdit={handleEdit}
        />
      </Row>

   <Modal
  title={`Edit ${fieldName}`}
  open={open}
  onCancel={() => setOpen(false)}
  onOk={saveChanges}
>
  <Text strong>Update Value:</Text>

  {/* Date of Birth */}
  {fieldName === "dateOfBirth" && (
<DatePicker
  style={{ width: "100%" }}
  // Only create dayjs object if tempValue is a valid ISO string
  value={tempValue && dayjs(tempValue).isValid() ? dayjs(tempValue) : null}
  onChange={(date) => {
    // Save as ISO string for backend, or empty string if cleared
    setTempValue(date && date.isValid() ? date.toISOString() : "");
  }}
  format="DD/MM/YYYY"
/>
  )}

  {/* Gender Select */}
  {fieldName === "gender" && (
    <Select
      style={{ width: "100%", marginTop: 8 }}
      value={tempValue || undefined}
      onChange={setTempValue}
      options={[
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ]}
      placeholder="Select Gender"
    />
  )}

  {/* Blood Group Select */}
  {fieldName === "bloodGroup" && (
    <Select
      style={{ width: "100%", marginTop: 8 }}
      value={tempValue || undefined}
      onChange={setTempValue}
      options={["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map((g) => ({
        label: g,
        value: g,
      }))}
      placeholder="Select Blood Group"
    />
  )}

  {/* Default Input for other fields */}
  {fieldName !== "dateOfBirth" &&
    fieldName !== "gender" &&
    fieldName !== "bloodGroup" && (
      <Input
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        style={{ marginTop: 8 }}
      />
    )}
</Modal>

    </div>
  );
}

function InfoCard({ title, icon, fields, onEdit }) {
  return (
    <Col xs={24} md={12}>
      <Card
        style={{
          borderRadius: 16,
          padding: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
        >
          {icon}
          <Text strong style={{ marginLeft: 10, fontSize: 16 }}>
            {title}
          </Text>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map(([label, fieldName, value], idx) => (
            <div key={idx}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {label}
              </Text>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong style={{ fontSize: 15 }}>
                  {value ?? ""}
                </Text>

                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(fieldName, value)}
                  style={{ fontSize: 18 }}
                />
              </div>

              {idx !== fields.length - 1 && (
                <div
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    marginTop: 8,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    </Col>
  );
}
