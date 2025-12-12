import { Button, Modal } from "antd";
import { useContext, useRef, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import "antd/dist/reset.css";
import { QRCodeCanvas } from "qrcode.react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export default function Settings() {
  const { user, backendUrl, logout } = useContext(AppContext);
  const [report, setReport] = useState("");
  const [open, setOpen] = useState(false);
  const [qrValue, setQrValue] = useState(""); 
    const qrRef = useRef(null); 


    const now = new Date();

let hours = now.getHours();
const minutes = String(now.getMinutes()).padStart(2, "0");
const seconds = String(now.getSeconds()).padStart(2, "0");
const ampm = hours >= 12 ? "PM" : "AM";

hours = hours % 12;
hours = hours ? hours : 12; // 0 → 12

const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${
  String(now.getMonth() + 1).padStart(2, "0")
}/${now.getFullYear()} ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

  const arrayOrStringToList = (arrOrString) => {
    let arr = [];
    if (Array.isArray(arrOrString)) arr = arrOrString.filter(Boolean);
    else if (typeof arrOrString === "string") {
      arr = arrOrString.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    }
    if (arr.length === 0) return "<p>None</p>";
    return `<ul>${arr.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  };

  const handleGenerateReport = async () => {
    if (!user) {
      alert("User not loaded yet");
      return;
    }

    const res = await fetch(`${backendUrl}/api/profile/${user._id}`);
    const data = await res.json();

    // const reportHTML = `
    //   <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333;">
    //     <h1 style="text-align:center; color:#d32f2f; margin-bottom: 5px;">MEDICAL REPORT</h1>
    //     <hr style="border:1px solid #d32f2f; margin-bottom: 15px;"/>
    //     <section style="margin-bottom: 15px;">
    //       <h2 style="font-size:16px; border-bottom:1px solid #ccc; padding-bottom:3px; margin-bottom:5px;"><b>Personal Information</b></h2>
    //       <table style="width:100%; border-collapse: collapse; font-size:14px;">
    //         <tr><td style="padding:4px; width:130px;"><b>Name:</b></td><td style="padding:4px;">${data.fullName || "N/A"}</td></tr>
    //         <tr><td style="padding:4px;"><b>DOB:</b></td><td style="padding:4px;">${data.dateOfBirth || "N/A"}</td></tr>
    //         <tr><td style="padding:4px;"><b>Gender:</b></td><td style="padding:4px;">${data.gender || "N/A"}</td></tr>
    //         <tr><td style="padding:4px;"><b>Blood Group:</b></td><td style="padding:4px;">${data.bloodGroup || "N/A"}</td></tr>
    //         <tr><td style="padding:4px;"><b>Phone:</b></td><td style="padding:4px;">${data.phone || "N/A"}</td></tr>
    //         <tr><td style="padding:4px;"><b>Address:</b></td><td style="padding:4px;">${data.address || "N/A"}</td></tr>
    //       </table>
    //     </section>
    //     <section style="margin-bottom: 15px;">
    //       <h2 style="font-size:16px; border-bottom:1px solid #ccc; padding-bottom:3px; margin-bottom:5px;"><b>Emergency Contacts</b></h2>
    //       ${
    //         data.emergencyContacts?.length > 0
    //           ? `<p style="margin:2px 0;"></p><ul>${data.emergencyContacts
    //               .map((c) => `<li>${c.name || "N/A"} - ${c.phone || "N/A"}</li>`)
    //               .join("")}</ul>`
    //           : `<p style="margin:2px 0;">No additional contacts</p>`
    //       }
    //     </section>
    //     <section style="margin-bottom: 15px;">
    //       <h2 style="font-size:16px; border-bottom:1px solid #ccc; padding-bottom:3px; margin-bottom:5px;"><b>Medical Information</b></h2>
    //       <p style="margin:2px 0;"><b>Allergies:</b></p>${arrayOrStringToList(data.allergies)}
    //       <p style="margin:2px 0;"><b>Chronic Conditions:</b></p>${arrayOrStringToList(data.chronicConditions)}
    //       <p style="margin:2px 0;"><b>Medications:</b></p>${arrayOrStringToList(data.medications)}
    //       <p style="margin:2px 0;"><b>Surgeries:</b></p>${arrayOrStringToList(data.surgeries)}
    //       <p style="margin:2px 0;"><b>Family History:</b></p>${arrayOrStringToList(data.familyHistory)}
    //       <p style="margin:2px 0;"><b>Disabilities:</b></p>${arrayOrStringToList(data.disabilities)}
    //       <p style="margin:2px 0;"><b>Preferred Hospital:</b> ${data.preferredHospital || "Not provided"}</p>
    //     </section>
    //     <hr style="margin-top: 15px; border:1px solid #ccc;"/>
    //     <small>Generated on: ${new Date().toLocaleString()}</small>
    //   </div>
    // `;

const dobFormatted = data.dateOfBirth
  ? dayjs(data.dateOfBirth).format("DD/MM/YYYY")
  : "N/A";




    const reportHTML = `
  <div style="font-family:'Segoe UI', Arial, sans-serif; padding: 25px; color:#222; line-height:1.6;">

    <!-- HEADER -->
    <div style="text-align:center; margin-bottom:25px;">
      <h1 style="margin:0; color:#B71C1C; font-size:28px; letter-spacing:1px;">MEDICAL REPORT</h1>
    </div>

    <div style="border-top:3px solid #B71C1C; margin:15px 0 25px;"></div>

    <!-- PERSONAL INFO -->
    <section style="margin-bottom:25px;">
      <h2 style="font-size:18px; color:#B71C1C; padding-bottom:5px; border-bottom:2px solid #B71C1C;">Personal Information</h2>

      <table style="width:100%; border-collapse:collapse; margin-top:12px; font-size:14px;">
        <tr><td class="key">Name</td><td class="val">${data.fullName || "N/A"}</td></tr>
        <tr><td class="key">Date of Birth</td><td class="val">${dobFormatted || "N/A"}</td></tr>
        <tr><td class="key">Gender</td><td class="val">${data.gender || "N/A"}</td></tr>
        <tr><td class="key">Blood Group</td><td class="val">${data.bloodGroup || "N/A"}</td></tr>
        <tr><td class="key">Phone</td><td class="val">${data.phone || "N/A"}</td></tr>
        <tr><td class="key">Address</td><td class="val">${data.address || "N/A"}</td></tr>
      </table>
    </section>


    <!-- EMERGENCY CONTACTS -->
    <section style="margin-bottom:25px;">
      <h2 style="font-size:18px; color:#B71C1C; padding-bottom:5px; border-bottom:2px solid #B71C1C;">Emergency Contacts</h2>

      ${
        data.emergencyContacts?.length > 0
          ? `<ul style="margin-top:12px; padding-left:18px; font-size:14px;">
              ${data.emergencyContacts
                .map(
                  (c) =>
                    `<li style="margin-bottom:5px;"><b>${c.name || "N/A"}</b> — ${c.phone || "N/A"}</li>`
                )
                .join("")}
            </ul>`
          : `<p style="font-size:14px; margin-top:12px; color:#666;">No emergency contacts available.</p>`
      }
    </section>


    <!-- MEDICAL INFO -->
    <section style="margin-bottom:25px;">
      <h2 style="font-size:18px; color:#B71C1C; padding-bottom:5px; border-bottom:2px solid #B71C1C;">Medical Information</h2>

      <div style="margin-top:12px; font-size:14px;">
        <p><b>Allergies:</b></p> ${arrayOrStringToList(data.allergies)}
        <div style="border-bottom:1px solid #EEE; margin:12px 0;"></div>

        <p><b>Chronic Conditions:</b></p> ${arrayOrStringToList(data.chronicConditions)}
        <div style="border-bottom:1px solid #EEE; margin:12px 0;"></div>

        <p><b>Medications:</b></p> ${arrayOrStringToList(data.medications)}
        <div style="border-bottom:1px solid #EEE; margin:12px 0;"></div>

        <p><b>Surgeries:</b></p> ${arrayOrStringToList(data.surgeries)}
        <div style="border-bottom:1px solid #EEE; margin:12px 0;"></div>

        <p><b>Family History:</b></p> ${arrayOrStringToList(data.familyHistory)}
        <div style="border-bottom:1px solid #EEE; margin:12px 0;"></div>

        <p><b>Disabilities:</b></p> ${arrayOrStringToList(data.disabilities)}
        <div style="border-bottom:1px solid #EEE; margin:12px 0;"></div>

        <p><b>Preferred Hospital:</b> ${data.preferredHospital || "Not provided"}</p>
      </div>
    </section>

    <div style="border-top:1px solid #CCC; margin:25px 0;"></div>

    <footer style="text-align:center; font-size:12px; color:#777;">
Report generated on: ${formattedDate}
    </footer>

  </div>

  <style>
    /* PRINT CONSISTENCY FIXES */
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .key { font-weight:bold; width:160px; padding:5px 0; }
      .val { padding:5px 0; }
      ul li { margin-bottom:4px; }
    }
  </style>
`;

    setReport(reportHTML);

    setQrValue(`${backendUrl}/api/profile/${user._id}/qr`);

    setOpen(true);
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding:20px; line-height:1.5; color:#333; }
            h1 { text-align:center; color:#d32f2f; margin-bottom:5px; }
            h2 { font-size:16px; border-bottom:1px solid #ccc; padding-bottom:3px; margin-bottom:5px; }
            table { width:100%; border-collapse: collapse; font-size:14px; margin-bottom:10px; }
            td { padding:4px; vertical-align:top; }
            ul { margin-left:18px; margin-bottom:5px; }
            li { margin-bottom:3px; }
            hr { margin:15px 0; border:1px solid #ccc; }
            @media print { @page { margin: 15mm; } }
          </style>
        </head>
        <body>
          ${report}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };


  const handleDownloadQR = () => {
  if (!qrRef.current) return alert("QR code not ready");

  const canvas = qrRef.current.querySelector("canvas");
  if (!canvas) return alert("Canvas not found");

  const pngUrl = canvas.toDataURL("image/png");
  const downloadLink = document.createElement("a");
  downloadLink.href = pngUrl;
  downloadLink.download = `user-${user._id}-qr.png`;
  downloadLink.click();
};

  return (
    // <div style={{ maxWidth: 400, margin: "20px 0", display: "flex", flexDirection: "column" }}>
    <div style={{ padding: 40, background: "#ffffff", minHeight: "80vh", borderRadius: 10 }}>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 5 }}>Generate Your Medical Report</h3>
        <p style={{ fontSize: 14, color: "#555" }}>
          Click below to generate a detailed medical report which you can save as PDF.
        </p>
        <Button
          type="primary"
          style={{ background: "#d32f2f", borderRadius: 8, padding: "0 25px", height: 45 }}
          onClick={handleGenerateReport}
        >
          Generate Medical Report
        </Button>
      </div>

      {qrValue && (
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ marginBottom: 5 }}>Scan QR Code to View Your Report</h3>
          <div ref={qrRef}>
  <QRCodeCanvas value={qrValue} size={200} />
</div>
<Button
  type="default"
  style={{ marginTop: 10, background: "#1976d2", color: "#fff" }}
  onClick={handleDownloadQR}
>
  Download QR Code
</Button>
        </div>
      )}

      {user && (
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ marginBottom: 5 }}>Logout</h3>
          <p style={{ fontSize: 14, color: "#555" }}>
            Click below to safely logout from your account.
          </p>
          <Button
            type="default"
            style={{ background: "#f44336", color: "#fff", borderRadius: 8, padding: "0 25px", height: 45 }}
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      )}

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={[
          <Button onClick={handlePrintReport} key="print">
            Print / Save PDF
          </Button>,
          <Button onClick={() => setOpen(false)} key="close">
            Close
          </Button>,
        ]}
        width={900}
      >
        <div dangerouslySetInnerHTML={{ __html: report }} />
      </Modal>
    </div>
  );
}
