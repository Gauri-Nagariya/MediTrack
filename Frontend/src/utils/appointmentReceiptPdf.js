import { jsPDF } from "jspdf";
import { formatDateTimeDDMMYYYY } from "./dateFormat";

const valueOrNA = (value) => (value === undefined || value === null || value === "" ? "N/A" : value);

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "";
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970).toString();
};

export const createAppointmentReceiptPdf = ({
  appointment,
  doctorProfile,
  patientProfile,
}) => {
  const doc = new jsPDF();
  const doctorName = doctorProfile?.fullName || appointment?.doctorId?.name || "Doctor";
  const hospitalName = doctorProfile?.hospitalClinicName || "MediTrack Healthcare";
  const patientAge = calculateAge(patientProfile?.dateOfBirth);
  const patientGender = patientProfile?.gender || "";
  const ageGenderText = [patientAge ? `${patientAge} years` : "", patientGender]
    .filter(Boolean)
    .join(" / ");

  const left = 14;
  const pageWidth = 210;
  const contentWidth = pageWidth - left * 2;
  let y = 16;

  const drawHeader = () => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(left, y - 8, contentWidth, 26, 2, 2, "F");
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(left, y - 8, contentWidth, 26, 2, 2);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(16);
    doc.text(hospitalName, left + 4, y + 1);
    doc.setFontSize(11);
    doc.text("Appointment Receipt / Acknowledgement Slip", left + 4, y + 8);
    doc.setFontSize(10);
    doc.text(`Generated On: ${formatDateTimeDDMMYYYY(new Date())}`, left + 4, y + 14);
    doc.setTextColor(0, 0, 0);
    y += 24;
  };

  const drawSection = (title, rows) => {
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(left, y, contentWidth, 8, 1.5, 1.5, "F");
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(title, left + 3, y + 5.5);
    y += 11;

    doc.setFontSize(10.5);
    rows.forEach(([label, value]) => {
      doc.setTextColor(55, 65, 81);
      doc.text(`${label}:`, left + 2, y);
      doc.setTextColor(17, 24, 39);
      doc.text(String(valueOrNA(value)), left + 55, y);
      y += 6;
    });
    y += 3;
  };

  drawHeader();

  drawSection("Patient Details", [
    ["Patient Name", patientProfile?.fullName],
    ["Age/Gender", ageGenderText],
    ["Patient ID", appointment?.patientBookingId],
  ]);

  drawSection("Doctor Details", [
    ["Doctor Name", doctorName],
    ["Specialization", doctorProfile?.specialization],
    ["Hospital/Clinic Name", doctorProfile?.hospitalClinicName],
  ]);

  const apptDateTime = formatDateTimeDDMMYYYY(appointment?.appointmentDate);
  drawSection("Appointment Details", [
    ["Appointment ID", appointment?.appointmentPublicId],
    ["Appointment Date", apptDateTime.split(" ")[0] || "N/A"],
    ["Appointment Time", apptDateTime.split(" ").slice(1).join(" ") || "N/A"],
    ["Consultation Type", doctorProfile?.consultationMode],
  ]);

  drawSection("Payment Details", [
    [
      "Consultation Fees",
      doctorProfile?.consultationFees !== null && doctorProfile?.consultationFees !== undefined
        ? `Rs. ${doctorProfile.consultationFees}`
        : "N/A",
    ],
    ["Payment Method", appointment?.paymentMethod || "Cash"],
    ["Payment Status", appointment?.paymentStatus || "Pending"],
  ]);

  drawSection("Extra Details", [
    [
      "Clinic Address",
      [doctorProfile?.clinicAddress, doctorProfile?.cityState].filter(Boolean).join(", "),
    ],
    ["Contact Number", doctorProfile?.doctorPhone || patientProfile?.phone],
    ["Booking Date & Time", formatDateTimeDDMMYYYY(appointment?.createdAt)],
    ["Notes/Instructions", appointment?.reason],
  ]);

  doc.setDrawColor(203, 213, 225);
  doc.line(left, y, left + contentWidth, y);
  y += 7;
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text("Thank You for choosing MediTrack.", left, y);
  y += 6;
  doc.setFontSize(9.5);
  doc.setTextColor(75, 85, 99);
  doc.text(
    "Cancellation/Reschedule Policy: Allowed before appointment time as per hospital policy.",
    left,
    y,
    { maxWidth: contentWidth }
  );
  y += 9;
  doc.setFontSize(9);
  doc.text(`${hospitalName} | This is a digitally generated acknowledgement slip.`, left, y);

  return doc;
};

export const downloadAppointmentReceiptPdf = ({
  appointment,
  doctorProfile,
  patientProfile,
}) => {
  const doc = createAppointmentReceiptPdf({
    appointment,
    doctorProfile,
    patientProfile,
  });
  doc.save(`appointment-receipt-${appointment?._id || "receipt"}.pdf`);
};

export const openAppointmentReceiptPdf = ({
  appointment,
  doctorProfile,
  patientProfile,
}) => {
  const doc = createAppointmentReceiptPdf({
    appointment,
    doctorProfile,
    patientProfile,
  });
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl, "_blank");
};
