import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  DatePicker,
  Select,
  message,
} from "antd";
import { AppContext } from "../../Context/AppContext";
import { UserOutlined, PhoneOutlined, HomeOutlined, HeartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PageLoader from "../../components/PageLoader";

const { Text } = Typography;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const toDatePickerValue = (isoDate) => {
  if (!isoDate) return null;
  const parsed = dayjs(isoDate);
  return parsed.isValid() ? parsed : null;
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const getDocumentHref = (value) => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return value;
};

export default function YourInformation() {
  const { user, backendUrl } = useContext(AppContext);
  const userId = user?._id;

  const [profile, setProfile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        let res = await fetch(`${backendUrl}/api/profile/${userId}`);

        if (res.status === 404) {
          await fetch(`${backendUrl}/api/profile/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              fullName: user?.name || "",
              emailId: user?.email || "",
              dateOfBirth: "",
              gender: "",
              bloodGroup: "",
              phone: "",
              address: "",
              emergencyContactNumber: "",
              allergies: [],
              medicalHistory: "",
              currentMedications: "",
              profilePhoto: "",
              insuranceDetails: "",
              medicalReportsUpload: "",
              doctorPrescriptions: "",
              appointmentHistory: "",
              vaccinationRecords: "",
            }),
          });
          res = await fetch(`${backendUrl}/api/profile/${userId}`);
        }

        const data = await res.json();
        setProfile({
          ...data,
          fullName: data?.fullName || user?.name || "",
          emailId: data?.emailId || user?.email || "",
          allergies: Array.isArray(data?.allergies) ? data.allergies.join(", ") : data?.allergies || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfile({});
      }
    };

    fetchProfile();
  }, [userId, backendUrl, user?.name, user?.email]);

  const updateProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setIsProfileSaved(false);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = async (field, file) => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateProfileField(field, base64);
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  const validateProfile = () => {
    const nextErrors = {};
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!profile.profilePhoto) nextErrors.profilePhoto = "Profile Photo is required";
    if (!profile.fullName?.trim()) nextErrors.fullName = "Full Name is required";
    if (!profile.dateOfBirth) nextErrors.dateOfBirth = "Date of Birth / Age is required";
    if (!profile.gender) nextErrors.gender = "Gender is required";
    if (!profile.phone?.trim() || !phoneRegex.test(profile.phone.trim())) {
      nextErrors.phone = "Valid 10-digit Phone Number is required";
    }
    if (!profile.emailId?.trim() || !emailRegex.test(profile.emailId.trim())) {
      nextErrors.emailId = "Valid Email ID is required";
    }
    if (!profile.address?.trim()) nextErrors.address = "Address is required";
    if (
      !profile.emergencyContactNumber?.trim() ||
      !phoneRegex.test(profile.emergencyContactNumber.trim())
    ) {
      nextErrors.emergencyContactNumber = "Valid Emergency Contact Number is required";
    }
    if (!BLOOD_GROUPS.includes(profile.bloodGroup || "")) {
      nextErrors.bloodGroup = "Please select a valid Blood Group";
    }
    if (!profile.allergies?.trim()) nextErrors.allergies = "Allergies is required";
    if (!profile.medicalHistory?.trim()) nextErrors.medicalHistory = "Medical History is required";
    if (!profile.currentMedications?.trim()) {
      nextErrors.currentMedications = "Current Medications is required";
    }
    if (!profile.insuranceDetails?.trim()) {
      nextErrors.insuranceDetails = "Insurance Details is required";
    }
    if (!profile.medicalReportsUpload) {
      nextErrors.medicalReportsUpload = "Upload Medical Reports is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!userId || !profile) return;
    if (!validateProfile()) {
      message.error("Please fill all required fields correctly.");
      return;
    }

    try {
      setIsSavingProfile(true);
      const payload = {
        fullName: profile.fullName || "",
        profilePhoto: profile.profilePhoto || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        bloodGroup: profile.bloodGroup || "",
        phone: profile.phone || "",
        emailId: profile.emailId || "",
        address: profile.address || "",
        emergencyContactNumber: profile.emergencyContactNumber || "",
        allergies: (profile.allergies || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        medicalHistory: profile.medicalHistory || "",
        currentMedications: profile.currentMedications || "",
        insuranceDetails: profile.insuranceDetails || "",
        medicalReportsUpload: profile.medicalReportsUpload || "",
        doctorPrescriptions: profile.doctorPrescriptions || "",
        appointmentHistory: profile.appointmentHistory || "",
        vaccinationRecords: profile.vaccinationRecords || "",
      };

      const res = await fetch(`${backendUrl}/api/profile/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      const data = await res.json();
      setProfile((prev) => ({
        ...prev,
        ...data,
        allergies: Array.isArray(data?.allergies) ? data.allergies.join(", ") : prev.allergies,
      }));
      setIsProfileSaved(true);
      message.success("Profile saved");
    } catch (error) {
      console.error("Error saving profile:", error);
      message.error("Unable to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!profile) {
    return <PageLoader minHeight={200} label="Loading your information..." />;
  }

  return (
    <div style={{ background: "#fafafa", padding: 16, borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button type="primary" loading={isSavingProfile} onClick={saveProfile}>
          {isProfileSaved ? "Saved" : "Save"}
        </Button>
      </div>

      <Card
        style={{ borderRadius: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <label
            style={{
              width: 120,
              height: 120,
              border: "2px dashed #d1d5db",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              background: "#f9fafb",
            }}
          >
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt="Patient Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 12, color: "#6b7280", textAlign: "center", padding: 8 }}>
                Select Image
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("profilePhoto", e.target.files?.[0])}
              style={{ display: "none" }}
            />
          </label>
          <div style={{ minWidth: 120 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111827" }}>
              {profile.fullName || user?.name || "Patient Name"}
            </h2>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
              Profile Photo <span style={{ color: "#dc2626" }}>*</span>
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
              Patient ID: <span style={{ color: "#111827", fontWeight: 600 }}>{user?.patientId || "N/A"}</span>
            </Text>
            {profile.profilePhoto ? (
              <Button size="small" danger onClick={() => updateProfileField("profilePhoto", "")}>
                Delete
              </Button>
            ) : null}
            {errors.profilePhoto ? (
              <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{errors.profilePhoto}</p>
            ) : null}
          </div>
        </div>
      </Card>

      <Row gutter={[20, 20]}>
        <InfoCard icon={<UserOutlined style={{ fontSize: 22, color: "#d32f2f" }} />} title="Personal Details">
          <Field label="Full Name *" error={errors.fullName}>
            <Input value={profile.fullName || ""} onChange={(e) => updateProfileField("fullName", e.target.value)} />
          </Field>
          <Field label="Date of Birth / Age *" error={errors.dateOfBirth}>
            <DatePicker
              style={{ width: "100%" }}
              value={toDatePickerValue(profile.dateOfBirth)}
              onChange={(date) =>
                updateProfileField("dateOfBirth", date && date.isValid() ? date.toISOString() : "")
              }
              format="DD/MM/YYYY"
            />
          </Field>
          <Field label="Gender *" error={errors.gender}>
            <Select
              value={profile.gender || undefined}
              onChange={(value) => updateProfileField("gender", value || "")}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
              placeholder="Select Gender"
            />
          </Field>
          <Field label="Blood Group *" error={errors.bloodGroup}>
            <Select
              value={profile.bloodGroup || undefined}
              onChange={(value) => updateProfileField("bloodGroup", value || "")}
              options={BLOOD_GROUPS.map((g) => ({ label: g, value: g }))}
              placeholder="Select Blood Group"
            />
          </Field>
        </InfoCard>

        <InfoCard icon={<PhoneOutlined style={{ fontSize: 22, color: "#d32f2f" }} />} title="Contact Details">
          <Field label="Phone Number *" error={errors.phone}>
            <Input value={profile.phone || ""} onChange={(e) => updateProfileField("phone", e.target.value)} />
          </Field>
          <Field label="Email ID *" error={errors.emailId}>
            <Input value={profile.emailId || ""} onChange={(e) => updateProfileField("emailId", e.target.value)} />
          </Field>
          <Field label="Emergency Contact Number *" error={errors.emergencyContactNumber}>
            <Input
              value={profile.emergencyContactNumber || ""}
              onChange={(e) => updateProfileField("emergencyContactNumber", e.target.value)}
            />
          </Field>
        </InfoCard>

        <InfoCard icon={<HomeOutlined style={{ fontSize: 22, color: "#d32f2f" }} />} title="Address">
          <Field label="Address *" error={errors.address}>
            <Input value={profile.address || ""} onChange={(e) => updateProfileField("address", e.target.value)} />
          </Field>
          <Field label="Insurance Details *" error={errors.insuranceDetails}>
            <Input.TextArea
              rows={3}
              value={profile.insuranceDetails || ""}
              onChange={(e) => updateProfileField("insuranceDetails", e.target.value)}
            />
          </Field>
        </InfoCard>

        <InfoCard icon={<HeartOutlined style={{ fontSize: 22, color: "#d32f2f" }} />} title="Medical Details">
          <Field label="Allergies *" error={errors.allergies}>
            <Input.TextArea
              rows={2}
              placeholder="e.g. Penicillin, Dust"
              value={profile.allergies || ""}
              onChange={(e) => updateProfileField("allergies", e.target.value)}
            />
          </Field>
          <Field label="Medical History *" error={errors.medicalHistory}>
            <Input.TextArea
              rows={2}
              value={profile.medicalHistory || ""}
              onChange={(e) => updateProfileField("medicalHistory", e.target.value)}
            />
          </Field>
          <Field label="Current Medications *" error={errors.currentMedications}>
            <Input.TextArea
              rows={2}
              value={profile.currentMedications || ""}
              onChange={(e) => updateProfileField("currentMedications", e.target.value)}
            />
          </Field>
        </InfoCard>

        <InfoCard icon={<HeartOutlined style={{ fontSize: 22, color: "#d32f2f" }} />} title="Uploads & Records">
          <Field label="Upload Medical Reports *" error={errors.medicalReportsUpload}>
            <Input type="file" onChange={(e) => handleFileChange("medicalReportsUpload", e.target.files?.[0])} />
            <DocumentActions value={profile.medicalReportsUpload} filename="medical-reports" />
          </Field>
          <Field label="Doctor Prescriptions">
            <Input type="file" onChange={(e) => handleFileChange("doctorPrescriptions", e.target.files?.[0])} />
            <DocumentActions value={profile.doctorPrescriptions} filename="doctor-prescriptions" />
          </Field>
          <Field label="Vaccination Records">
            <Input type="file" onChange={(e) => handleFileChange("vaccinationRecords", e.target.files?.[0])} />
            <DocumentActions value={profile.vaccinationRecords} filename="vaccination-records" />
          </Field>
          <Field label="Appointment History">
            <Input.TextArea
              rows={3}
              value={profile.appointmentHistory || ""}
              onChange={(e) => updateProfileField("appointmentHistory", e.target.value)}
            />
          </Field>
        </InfoCard>
      </Row>
    </div>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <Col xs={24} md={12}>
      <Card
        style={{ borderRadius: 16, padding: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          {icon}
          <Text strong style={{ marginLeft: 10, fontSize: 16 }}>
            {title}
          </Text>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
      </Card>
    </Col>
  );
}

function Field({ label, children, error }) {
  const hasRequired = label.includes("*");
  const cleanLabel = label.replace("*", "").trim();
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {cleanLabel} {hasRequired ? <span style={{ color: "#dc2626" }}>*</span> : null}
      </Text>
      <div style={{ marginTop: 6 }}>{children}</div>
      {error ? <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{error}</p> : null}
    </div>
  );
}

function DocumentActions({ value, filename }) {
  if (!value) return null;
  const href = getDocumentHref(value);
  return (
    <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
      <a href={href} target="_blank" rel="noreferrer" style={{ color: "#d32f2f", fontSize: 13, fontWeight: 600 }}>
        View
      </a>
      <a href={href} download={filename} style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 600 }}>
        Download
      </a>
    </div>
  );
}
