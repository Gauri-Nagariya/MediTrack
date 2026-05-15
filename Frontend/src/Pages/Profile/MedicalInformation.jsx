import React, { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Typography, Button, Input, Select } from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";
import { AppContext } from "../../Context/AppContext";
import PageLoader from "../../components/PageLoader";

const { Text } = Typography;

export default function MedicalInformation() {
  const { user, backendUrl } = useContext(AppContext);
  const userId = user?._id;

  const [profile, setProfile] = useState(null);
  const [isSavingMedical, setIsSavingMedical] = useState(false);
  const [isMedicalSaved, setIsMedicalSaved] = useState(false);

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


const saveChanges = async () => {
  if (!userId || !profile) return;

  try {
    setIsSavingMedical(true);
    const res = await fetch(`${backendUrl}/api/profile/update/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allergies: profile.allergies || [],
        chronicConditions: profile.chronicConditions || [],
        medications: profile.medications || [],
        surgeries: profile.surgeries || [],
        familyHistory: profile.familyHistory || "",
        disabilities: profile.disabilities || [],
        healthId: profile.healthId || "",
        preferredHospital: profile.preferredHospital || "",
      }),
    });

    if (!res.ok) throw new Error("Failed to update");

    const data = await res.json();
    setProfile((prev) => ({ ...prev, ...data }));
    setIsMedicalSaved(true);
  } catch (err) {
    console.log(err);
  } finally {
    setIsSavingMedical(false);
  }
};


  if (!profile) {
    return <PageLoader minHeight={200} label="Loading medical information..." />;
  }

  return (
    <div style={{ background: "#ffffff", padding: 16, borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button type="primary" loading={isSavingMedical} onClick={saveChanges}>
          {isMedicalSaved ? "Saved" : "Save"}
        </Button>
      </div>

      <Row gutter={[20, 20]}>
        <MedicalCard
          title="Known Allergies"
          value={profile.allergies}
          editor={
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Type or select values"
              value={profile.allergies || []}
              onChange={(value) => {
                setProfile((prev) => ({ ...prev, allergies: value }));
                setIsMedicalSaved(false);
              }}
              options={suggestionsMap.allergies.map((item) => ({ value: item }))}
              tokenSeparators={[","]}
            />
          }
        />
        <MedicalCard
          title="Chronic Conditions"
          value={profile.chronicConditions}
          editor={
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Type or select values"
              value={profile.chronicConditions || []}
              onChange={(value) => {
                setProfile((prev) => ({ ...prev, chronicConditions: value }));
                setIsMedicalSaved(false);
              }}
              options={suggestionsMap.chronicConditions.map((item) => ({ value: item }))}
              tokenSeparators={[","]}
            />
          }
        />
        <MedicalCard
          title="Medications"
          value={profile.medications}
          editor={
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Type or select values"
              value={profile.medications || []}
              onChange={(value) => {
                setProfile((prev) => ({ ...prev, medications: value }));
                setIsMedicalSaved(false);
              }}
              options={suggestionsMap.medications.map((item) => ({ value: item }))}
              tokenSeparators={[","]}
            />
          }
        />
        <MedicalCard
          title="Past Surgeries"
          value={profile.surgeries}
          editor={
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Type or select values"
              value={profile.surgeries || []}
              onChange={(value) => {
                setProfile((prev) => ({ ...prev, surgeries: value }));
                setIsMedicalSaved(false);
              }}
              options={suggestionsMap.surgeries.map((item) => ({ value: item }))}
              tokenSeparators={[","]}
            />
          }
        />
        <MedicalCard
          title="Family History"
          value={profile.familyHistory}
          editor={
            <Input
              value={profile.familyHistory || ""}
              onChange={(e) => {
                setProfile((prev) => ({ ...prev, familyHistory: e.target.value }));
                setIsMedicalSaved(false);
              }}
            />
          }
        />
        <MedicalCard
          title="Disabilities"
          value={profile.disabilities}
          editor={
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Type or select values"
              value={profile.disabilities || []}
              onChange={(value) => {
                setProfile((prev) => ({ ...prev, disabilities: value }));
                setIsMedicalSaved(false);
              }}
              options={suggestionsMap.disabilities.map((item) => ({ value: item }))}
              tokenSeparators={[","]}
            />
          }
        />
        <MedicalCard
          title="Health ID Number"
          value={profile.healthId}
          editor={
            <Input
              value={profile.healthId || ""}
              onChange={(e) => {
                setProfile((prev) => ({ ...prev, healthId: e.target.value }));
                setIsMedicalSaved(false);
              }}
            />
          }
        />
        <MedicalCard
          title="Preferred Hospital"
          value={profile.preferredHospital}
          editor={
            <Input
              value={profile.preferredHospital || ""}
              onChange={(e) => {
                setProfile((prev) => ({ ...prev, preferredHospital: e.target.value }));
                setIsMedicalSaved(false);
              }}
            />
          }
        />
      </Row>
    </div>
  );
}

function MedicalCard({ title, value, editor }) {
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <MedicineBoxOutlined style={{ fontSize: 22, color: "#d32f2f" }} />
          <Text strong style={{ marginLeft: 10, fontSize: 16 }}>
            {title}
          </Text>
        </div>
        <div style={{ marginTop: 12, marginBottom: 8 }}>
          {Array.isArray(value)
            ? value.map((item, i) => (
                <Text key={i} strong style={{ display: "block", marginBottom: 6 }}>
                  {item}
                </Text>
              ))
            : <Text strong>{value ?? ""}</Text>}
        </div>
        {editor}
      </Card>
    </Col>
  );
}
