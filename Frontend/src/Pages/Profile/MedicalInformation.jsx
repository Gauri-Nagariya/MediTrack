import React, { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Typography, Button, Modal, Input, AutoComplete } from "antd";
import { EditOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { AppContext } from "../../Context/AppContext";

const { Title, Text } = Typography;

export default function MedicalInformation() {
  const { user, backendUrl } = useContext(AppContext);
  const userId = user?._id;

  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [tempValue, setTempValue] = useState([]);

const suggestionsMap = {
  allergies: [
    "Peanuts", "Seafood", "Dust", "Pollen", "Milk", "Eggs", "Soy",
    "Wheat", "Tree nuts", "Latex", "Insect stings", "Pet dander",
    "Mold", "Gluten", "Medications"
  ],
  chronicConditions: [
    "Diabetes", "Hypertension", "Asthma", "Arthritis", "Heart Disease",
    "Chronic Kidney Disease", "COPD", "Depression", "Anxiety",
    "Obesity", "Hypothyroidism", "Hyperthyroidism", "Epilepsy",
    "Migraines", "Osteoporosis"
  ],
  medications: [
    "Aspirin", "Metformin", "Ibuprofen", "Paracetamol", "Lisinopril",
    "Atorvastatin", "Omeprazole", "Albuterol", "Levothyroxine",
    "Warfarin", "Prednisone", "Amoxicillin", "Furosemide", "Clopidogrel",
    "Simvastatin"
  ],
  surgeries: [
    "Appendectomy", "Gallbladder removal", "Knee replacement",
    "Hip replacement", "Cataract surgery", "Hernia repair",
    "Heart bypass surgery", "Tonsillectomy", "C-section",
    "Prostatectomy", "Hysterectomy", "Back surgery", "Mastectomy",
    "Cholecystectomy", "Spinal fusion"
  ],
  disabilities: [
    "Visual", "Hearing", "Mobility", "Speech", "Cognitive",
    "Intellectual", "Mental health", "Chronic illness", "Autism",
    "ADHD", "Dyslexia", "Blindness", "Deafness", "Paralysis", "Amputation"
  ],
};


  useEffect(() => {
  if (!userId || !backendUrl) return;

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/profile/${userId}`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.log(err);
    }
  };

  fetchProfile();
}, [userId, backendUrl]);


  const handleEdit = (field, currentValue) => {
    setFieldName(field);
    setTempValue(Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []);
    setOpen(true);
  };

const saveChanges = async () => {
  if (!userId || !fieldName) return;

  const updatedValue = Array.isArray(profile[fieldName])
    ? tempValue.map((x) => x.trim()).filter(Boolean)
    : tempValue[0]?.trim() || "";

  try {
    const res = await fetch(`${backendUrl}/api/profile/update/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [fieldName]: updatedValue }),
    });

    if (!res.ok) throw new Error("Failed to update");

    const refreshed = await fetch(`${backendUrl}/api/profile/${userId}`);
    const data = await refreshed.json();

    setProfile(data);
    setOpen(false);
  } catch (err) {
    console.log(err);
  }
};


  if (!profile) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: 200 }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff", padding: 16, borderRadius: 12 }}>
      {/* <Title level={2} style={{ color: "#d32f2f", fontWeight: 800 }}>
        Medical Information
      </Title> */}

      <Row gutter={[20, 20]}>
        <MedicalCard
          title="Known Allergies"
          value={profile.allergies}
          onEdit={() => handleEdit("allergies", profile.allergies)}
        />
        <MedicalCard
          title="Chronic Conditions"
          value={profile.chronicConditions}
          onEdit={() => handleEdit("chronicConditions", profile.chronicConditions)}
        />
        <MedicalCard
          title="Medications"
          value={profile.medications}
          onEdit={() => handleEdit("medications", profile.medications)}
        />
        <MedicalCard
          title="Past Surgeries"
          value={profile.surgeries}
          onEdit={() => handleEdit("surgeries", profile.surgeries)}
        />
        <MedicalCard
          title="Family History"
          value={profile.familyHistory}
          onEdit={() => handleEdit("familyHistory", profile.familyHistory)}
        />
        <MedicalCard
          title="Disabilities"
          value={profile.disabilities}
          onEdit={() => handleEdit("disabilities", profile.disabilities)}
        />
        <MedicalCard
          title="Health ID Number"
          value={profile.healthId}
          onEdit={() => handleEdit("healthId", profile.healthId)}
        />
        <MedicalCard
          title="Preferred Hospital"
          value={profile.preferredHospital}
          onEdit={() => handleEdit("preferredHospital", profile.preferredHospital)}
        />
      </Row>
    <Modal
  title={`Edit ${fieldName}`}
  open={open}
  onCancel={() => setOpen(false)}
  onOk={saveChanges}
>
  {/* <Text strong>Enter values (comma separated or pick from dropdown):</Text> */}
  {suggestionsMap[fieldName] ? (
    <Select
      mode="tags"
      style={{ width: "100%", marginTop: 8 }}
      placeholder="Type or select multiple values..."
      value={tempValue}
      onChange={setTempValue}
      options={suggestionsMap[fieldName].map((item) => ({ value: item }))}
      tokenSeparators={[","]}
    />
  ) : (
    <Input
      value={tempValue.join(", ")}
      onChange={(e) => {
        const arr = e.target.value
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x);
        setTempValue(arr);
      }}
      style={{ marginTop: 8 }}
      placeholder="Type values"
    />
  )}
</Modal>
    </div>
  );
}

function MedicalCard({ title, value, onEdit }) {
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <MedicineBoxOutlined style={{ fontSize: 22, color: "#d32f2f" }} />
            <Text strong style={{ marginLeft: 10, fontSize: 16 }}>
              {title}
            </Text>
          </div>
          <Button
            type="text"
            icon={<EditOutlined style={{ fontSize: 18 }} />}
            onClick={onEdit}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          {Array.isArray(value)
            ? value.map((item, i) => (
                <Text key={i} strong style={{ display: "block", marginBottom: 6 }}>
                  {item}
                </Text>
              ))
            : <Text strong>{value ?? ""}</Text>}
        </div>
      </Card>
    </Col>
  );
}
