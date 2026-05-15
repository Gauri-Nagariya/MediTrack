import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../Context/AppContext";
import { Button, Card, Col, DatePicker, Input, Row, Select, Typography, message } from "antd";
import PageLoader from "../../components/PageLoader";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const INDIAN_STATE_CITY_MAP = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
  Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
  Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Durg", "Korba"],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  Manipur: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
  Meghalaya: ["Shillong", "Tura", "Jowai", "Nongpoh", "Baghmara"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Tuensang"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Puri"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  Sikkim: ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Singtam"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  Uttarakhand: ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  Chandigarh: ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  Delhi: ["New Delhi", "Delhi", "Dwarka", "Rohini", "Saket"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Pulwama"],
  Ladakh: ["Leh", "Kargil"],
  Lakshadweep: ["Kavaratti"],
  Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

const defaultForm = {
  fullName: "",
  profilePhoto: "",
  doctorGender: "",
  doctorDateOfBirth: "",
  languagesSpoken: "",
  specialization: "",
  degreesQualifications: "",
  medicalLicenseNumber: "",
  yearsOfExperience: "",
  hospitalClinicName: "",
  currentPosition: "",
  doctorEmail: "",
  doctorPhone: "",
  clinicAddress: "",
  cityState: "",
  workingDays: "",
  consultationTimings: "",
  consultationMode: "",
  emergencyAvailability: "",
  consultationFees: "",
  servicesOffered: "",
  acceptedInsurance: "",
  shortBio: "",
  achievementsCertifications: "",
  medicalCertificate: "",
  licenseUpload: "",
  idProof: "",
};

const WEEK_DAY_OPTIONS = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Urdu",
  "Gujarati",
  "Kannada",
  "Odia",
  "Malayalam",
  "Punjabi",
  "Assamese",
  "Maithili",
  "Sanskrit",
  "Konkani",
  "Manipuri",
  "Nepali",
  "Bodo",
  "Dogri",
  "Kashmiri",
  "Santhali",
  "Sindhi",
];

const toCommaString = (value) =>
  Array.isArray(value) ? value.filter(Boolean).join(", ") : value || "";

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
  if (
    value.startsWith("data:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }
  return value;
};

export default function DoctorProfile() {
  const { user, backendUrl } = useContext(AppContext);
  const [form, setForm] = useState(defaultForm);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [consultationFrom, setConsultationFrom] = useState("");
  const [consultationTo, setConsultationTo] = useState("");
  const [selectedWorkingDays, setSelectedWorkingDays] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userId = user?._id;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = async (field, file) => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateField(field, base64);
    } catch (error) {
      console.error(error);
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!form.fullName.trim()) nextErrors.fullName = "Full Name is required";
    if (!form.profilePhoto) nextErrors.profilePhoto = "Profile Photo is required";
    if (!form.specialization.trim()) nextErrors.specialization = "Specialization is required";
    if (!form.degreesQualifications.trim()) {
      nextErrors.degreesQualifications = "Degrees/Qualifications is required";
    }
    if (!form.medicalLicenseNumber.trim()) {
      nextErrors.medicalLicenseNumber = "Medical License Number is required";
    }
    if (
      form.yearsOfExperience === "" ||
      Number(form.yearsOfExperience) < 0
    ) {
      nextErrors.yearsOfExperience = "Valid Years of Experience is required";
    }
    if (!form.doctorPhone.trim() || !phoneRegex.test(form.doctorPhone.trim())) {
      nextErrors.doctorPhone = "Valid 10-digit Phone Number is required";
    }
    if (!form.doctorEmail.trim() || !emailRegex.test(form.doctorEmail.trim())) {
      nextErrors.doctorEmail = "Valid Email is required";
    }
    if (!form.clinicAddress.trim()) {
      nextErrors.clinicAddress = "Clinic/Hospital Address is required";
    }
    if (
      form.consultationFees === "" ||
      Number(form.consultationFees) <= 0
    ) {
      nextErrors.consultationFees = "Consultation Fees must be greater than 0";
    }
    if (!form.consultationTimings.trim()) {
      nextErrors.consultationTimings = "Available Timings is required";
    }
    if (!consultationFrom || !consultationTo) {
      nextErrors.consultationTimings = "Both From Time and To Time are required";
    } else if (consultationTo <= consultationFrom) {
      nextErrors.consultationTimings = "To Time must be later than From Time";
    }
    if (!form.shortBio.trim()) {
      nextErrors.shortBio = "About Doctor is required";
    }
    if (!form.licenseUpload) {
      nextErrors.licenseUpload = "Medical License Upload is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/profile/${userId}`);
        setForm({
          ...defaultForm,
          ...data,
          fullName: data?.fullName || user?.name || "",
          doctorEmail: data?.doctorEmail || user?.email || "",
          doctorPhone: data?.doctorPhone || data?.phone || "",
          doctorDateOfBirth: data?.doctorDateOfBirth
            ? dayjs(data.doctorDateOfBirth).format("YYYY-MM-DD")
            : "",
          languagesSpoken: "",
          workingDays: "",
          servicesOffered: toCommaString(data?.servicesOffered),
          acceptedInsurance: toCommaString(data?.acceptedInsurance),
          yearsOfExperience: data?.yearsOfExperience ?? "",
          consultationFees: data?.consultationFees ?? "",
        });
        if (data?.cityState) {
          const [cityPart, statePart] = data.cityState.split(",").map((x) => x.trim());
          setSelectedCity(cityPart || "");
          setSelectedState(statePart || "");
        }
        setSelectedLanguages(Array.isArray(data?.languagesSpoken) ? data.languagesSpoken : []);
        setSelectedWorkingDays(Array.isArray(data?.workingDays) ? data.workingDays : []);
        if (data?.consultationTimings && data.consultationTimings.includes(" - ")) {
          const [fromPart, toPart] = data.consultationTimings.split(" - ").map((x) => x.trim());
          setConsultationFrom(fromPart || "");
          setConsultationTo(toPart || "");
        }
      } catch (error) {
        setForm((prev) => ({
          ...prev,
          fullName: user?.name || "",
          doctorEmail: user?.email || "",
        }));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, backendUrl, user?.name, user?.email]);

  const saveProfile = async () => {
    if (!userId) return;
    if (!validateForm()) {
      message.error("Please fill required fields before saving.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        languagesSpoken: selectedLanguages,
        workingDays: selectedWorkingDays,
        servicesOffered: form.servicesOffered.split(",").map((x) => x.trim()).filter(Boolean),
        acceptedInsurance: form.acceptedInsurance.split(",").map((x) => x.trim()).filter(Boolean),
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : 0,
        consultationFees: form.consultationFees ? Number(form.consultationFees) : 0,
        doctorDateOfBirth: form.doctorDateOfBirth || null,
        phone: form.doctorPhone || "",
        consultationTimings: `${consultationFrom} - ${consultationTo}`,
        cityState:
          selectedCity && selectedState
            ? `${selectedCity}, ${selectedState}`
            : "",
      };

      await axios.put(`${backendUrl}/api/profile/update/${userId}`, payload);
      message.success("Doctor profile saved successfully");
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message || error?.message || "Unable to save doctor profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader minHeight={220} label="Loading profile..." />;
  }

  return (
    <div style={{ background: "#fafafa", padding: 16, borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>Doctor Profile</h1>
        <Button
          type="primary"
          loading={saving}
          onClick={saveProfile}
          style={{ background: "#0f766e", borderColor: "#0f766e" }}
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          borderTop: "4px solid #0f766e",
        }}
        bodyStyle={{ padding: 18 }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <label
            style={{
              width: 150,
              height: 150,
              border: "2px dashed #99f6e4",
              borderRadius: 12,
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f0fdfa",
            }}
          >
            {form.profilePhoto ? (
              <img
                src={form.profilePhoto}
                alt="Doctor Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 11, color: "#0f766e", textAlign: "center", padding: 6 }}>
                Select Image
              </span>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("profilePhoto", e.target.files?.[0])}
              style={{ display: "none" }}
            />
          </label>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              {form.fullName || "Doctor Name"}
            </h2>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
              Profile Photo <span style={{ color: "#dc2626" }}>*</span>
            </Text>
            <p style={{ margin: "4px 0", color: "#0f766e", fontSize: 13, fontWeight: 600 }}>
              Doctor ID: {user?.doctorId || "N/A"}
            </p>
            {form.profilePhoto ? (
              <Button
                size="small"
                danger
                style={{ marginTop: 6 }}
                onClick={() => updateField("profilePhoto", "")}
              >
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
        <InfoCard title="Basic Information" icon={<UserOutlined style={iconStyle} />}>
          <Field label="Full Name *" error={errors.fullName}>
            <Input
              status={errors.fullName ? "error" : ""}
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
          </Field>
          <Field label="Gender">
            <Select
              style={{ width: "100%" }}
              value={form.doctorGender || undefined}
              onChange={(value) => updateField("doctorGender", value || "")}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
            />
          </Field>
          <Field label="Date of Birth">
            <DatePicker
              style={{ width: "100%" }}
              value={toDatePickerValue(form.doctorDateOfBirth)}
              onChange={(date) =>
                updateField("doctorDateOfBirth", date && date.isValid() ? date.format("YYYY-MM-DD") : "")
              }
            />
          </Field>
          <Field label="Languages Spoken">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={selectedLanguages}
              onChange={(value) => setSelectedLanguages(value)}
              options={LANGUAGE_OPTIONS.map((lang) => ({ label: lang, value: lang }))}
              placeholder="Select languages spoken"
              showSearch
              optionFilterProp="label"
            />
          </Field>
        </InfoCard>

        <InfoCard title="Professional Details" icon={<MedicineBoxOutlined style={iconStyle} />}>
          <Field label="Specialization *" error={errors.specialization}><Input status={errors.specialization ? "error" : ""} value={form.specialization} onChange={(e) => updateField("specialization", e.target.value)} /></Field>
          <Field label="Degrees & Qualifications *" error={errors.degreesQualifications}><Input status={errors.degreesQualifications ? "error" : ""} value={form.degreesQualifications} onChange={(e) => updateField("degreesQualifications", e.target.value)} /></Field>
          <Field label="Medical License Number *" error={errors.medicalLicenseNumber}><Input status={errors.medicalLicenseNumber ? "error" : ""} value={form.medicalLicenseNumber} onChange={(e) => updateField("medicalLicenseNumber", e.target.value)} /></Field>
          <Field label="Years of Experience *" error={errors.yearsOfExperience}><Input status={errors.yearsOfExperience ? "error" : ""} type="number" min={0} value={form.yearsOfExperience} onChange={(e) => updateField("yearsOfExperience", e.target.value)} /></Field>
          <Field label="Hospital/Clinic Name"><Input value={form.hospitalClinicName} onChange={(e) => updateField("hospitalClinicName", e.target.value)} /></Field>
          <Field label="Current Position"><Input value={form.currentPosition} onChange={(e) => updateField("currentPosition", e.target.value)} /></Field>
        </InfoCard>

        <InfoCard title="Contact Information" icon={<PhoneOutlined style={iconStyle} />}>
          <Field label="Email *" error={errors.doctorEmail}><Input status={errors.doctorEmail ? "error" : ""} type="email" value={form.doctorEmail} onChange={(e) => updateField("doctorEmail", e.target.value)} /></Field>
          <Field label="Phone Number *" error={errors.doctorPhone}><Input status={errors.doctorPhone ? "error" : ""} value={form.doctorPhone} onChange={(e) => updateField("doctorPhone", e.target.value)} /></Field>
          <Field label="Clinic Address *" error={errors.clinicAddress}><Input status={errors.clinicAddress ? "error" : ""} value={form.clinicAddress} onChange={(e) => updateField("clinicAddress", e.target.value)} /></Field>
          <Field label="State">
            <Select
              style={{ width: "100%" }}
              value={selectedState || undefined}
              onChange={(value) => {
                setSelectedState(value || "");
                setSelectedCity("");
              }}
              options={Object.keys(INDIAN_STATE_CITY_MAP).map((state) => ({
                label: state,
                value: state,
              }))}
              placeholder="Select State"
              showSearch
              optionFilterProp="label"
            />
          </Field>
          <Field label="City">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              value={selectedCity ? [selectedCity] : []}
              onChange={(value) => {
                const city = Array.isArray(value) ? value[value.length - 1] : value;
                setSelectedCity(city || "");
              }}
              options={(INDIAN_STATE_CITY_MAP[selectedState] || []).map((city) => ({
                label: city,
                value: city,
              }))}
              placeholder={selectedState ? "Select or type City" : "Select State First"}
              disabled={!selectedState}
              showSearch
              optionFilterProp="label"
              maxCount={1}
            />
          </Field>
        </InfoCard>

        <InfoCard title="Availability" icon={<CalendarOutlined style={iconStyle} />}>
          <Field label="Working Days">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={selectedWorkingDays}
              onChange={(value) => setSelectedWorkingDays(value)}
              options={WEEK_DAY_OPTIONS}
              placeholder="Select working days (e.g., Monday, Wednesday, Saturday)"
            />
          </Field>
          <Field label="Consultation Timings *" error={errors.consultationTimings}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Input
                type="time"
                status={errors.consultationTimings ? "error" : ""}
                value={consultationFrom}
                onChange={(e) => {
                  setConsultationFrom(e.target.value);
                  updateField("consultationTimings", `${e.target.value} - ${consultationTo}`.trim());
                }}
                placeholder="From Time"
              />
              <Input
                type="time"
                status={errors.consultationTimings ? "error" : ""}
                value={consultationTo}
                onChange={(e) => {
                  setConsultationTo(e.target.value);
                  updateField("consultationTimings", `${consultationFrom} - ${e.target.value}`.trim());
                }}
                placeholder="To Time"
              />
            </div>
          </Field>
          <Field label="Online/Offline Consultation">
            <Select
              style={{ width: "100%" }}
              value={form.consultationMode || undefined}
              onChange={(value) => updateField("consultationMode", value || "")}
              options={[
                { label: "Online", value: "Online" },
                { label: "Offline", value: "Offline" },
                { label: "Both", value: "Both" },
              ]}
            />
          </Field>
          <Field label="Emergency Availability">
            <Select
              style={{ width: "100%" }}
              value={form.emergencyAvailability || undefined}
              onChange={(value) => updateField("emergencyAvailability", value || "")}
              options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]}
            />
          </Field>
        </InfoCard>

        <InfoCard title="Fees & Services" icon={<HomeOutlined style={iconStyle} />}>
          <Field label="Consultation Fees *" error={errors.consultationFees}><Input status={errors.consultationFees ? "error" : ""} type="number" min={0} value={form.consultationFees} onChange={(e) => updateField("consultationFees", e.target.value)} /></Field>
          <Field label="Services Offered (comma separated)"><Input value={form.servicesOffered} onChange={(e) => updateField("servicesOffered", e.target.value)} /></Field>
          <Field label="Accepted Insurance (comma separated)"><Input value={form.acceptedInsurance} onChange={(e) => updateField("acceptedInsurance", e.target.value)} /></Field>
        </InfoCard>

        <InfoCard title="About Section" icon={<FileTextOutlined style={iconStyle} />}>
          <Field label="Short Bio/About Doctor *" error={errors.shortBio}><Input.TextArea status={errors.shortBio ? "error" : ""} rows={3} value={form.shortBio} onChange={(e) => updateField("shortBio", e.target.value)} /></Field>
          <Field label="Achievements & Certifications"><Input.TextArea rows={3} value={form.achievementsCertifications} onChange={(e) => updateField("achievementsCertifications", e.target.value)} /></Field>
        </InfoCard>

        <InfoCard title="Verification Documents" icon={<SafetyCertificateOutlined style={iconStyle} />}>
          <Field label="Medical Certificate Upload">
            <Input type="file" onChange={(e) => handleFileChange("medicalCertificate", e.target.files?.[0])} />
            <DocumentActions label="Medical Certificate" value={form.medicalCertificate} filename="medical-certificate" />
          </Field>
          <Field label="Medical License Upload *" error={errors.licenseUpload}>
            <Input status={errors.licenseUpload ? "error" : ""} type="file" onChange={(e) => handleFileChange("licenseUpload", e.target.files?.[0])} />
            <DocumentActions label="Medical License" value={form.licenseUpload} filename="medical-license" />
          </Field>
          <Field label="ID Proof">
            <Input type="file" onChange={(e) => handleFileChange("idProof", e.target.files?.[0])} />
            <DocumentActions label="ID Proof" value={form.idProof} filename="id-proof" />
          </Field>
        </InfoCard>
      </Row>
    </div>
  );
}

const iconStyle = { fontSize: 22, color: "#0f766e" };

function InfoCard({ title, icon, children }) {
  return (
    <Col xs={24} md={12}>
      <Card
        style={{
          borderRadius: 16,
          padding: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          borderTop: "3px solid #0f766e",
        }}
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
      {error ? (
        <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{error}</p>
      ) : null}
    </div>
  );
}

function DocumentActions({ label, value, filename }) {
  if (!value) {
    return <Text type="secondary" style={{ display: "block", marginTop: 8 }}>No file uploaded.</Text>;
  }

  const href = getDocumentHref(value);
  return (
    <div
      style={{
        marginTop: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "8px 10px",
      }}
    >
      <span style={{ fontSize: 13 }}>{label} uploaded</span>
      <div style={{ display: "flex", gap: 8 }}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#0f766e", fontSize: 13, fontWeight: 600 }}
        >
          View
        </a>
        <a
          href={href}
          download={filename}
          style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 600 }}
        >
          Download
        </a>
      </div>
    </div>
  );
}
