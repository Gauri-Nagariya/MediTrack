import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  message,
  Popconfirm,
  Button,
  Modal,
  Checkbox,
  Typography,
  Space,
  Empty,
} from "antd";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

const { Title, Text } = Typography;

const MedicalRecords = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [qrLink, setQrLink] = useState("");
  const [showQR, setShowQR] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/documents/medicalRecords`
      );
      setMedicalRecords(res.data);
    } catch (err) {
      message.error("Failed to load medical records");
    }
  };

  const deleteMedicalRecords = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/documents/${id}`);
      message.success("Deleted successfully");
      setMedicalRecords((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const toggleSelect = (id) => {
    setSelectedDocs((prev) =>
      prev.includes(id)
        ? prev.filter((docId) => docId !== id)
        : [...prev, id]
    );
  };

  const generateQR = async () => {
    if (selectedDocs.length === 0) {
      message.warning("Select at least one document");
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/share`, {
        documentIds: selectedDocs,
      });

      setQrLink(res.data.link);
      setShowQR(true);
    } catch {
      message.error("Failed to create QR");
    }
  };

  return (
    <div style={{ padding: 40, background: "#ffffff", minHeight: "100vh", borderRadius: 10 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        {/* <Title level={3} style={{ margin: 0 }}>
          Medical Records
        </Title> */}
        <Button type="primary" onClick={generateQR}>
          Generate QR
        </Button>
      </Row>

      {medicalRecords.length === 0 ? (
        <Empty description="No records found" />
      ) : (
        <Row gutter={[24, 24]} justify="start">
          {medicalRecords.map((item) => (
            <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{ height: "100%", borderRadius: 12 }}
                title={
                  <Space>
                    <Checkbox
                      checked={selectedDocs.includes(item._id)}
                      onChange={() => toggleSelect(item._id)}
                    />
                    <Text strong>{item.facilityName}</Text>
                  </Space>
                }
                actions={[
                  <Popconfirm
                    title="Are you sure you want to delete?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => deleteMedicalRecords(item._id)}
                  >
                    <Button type="link" danger>
                      Delete
                    </Button>
                  </Popconfirm>,

                  <a
                    href={`${backendUrl}/api/documents/file/${item._id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button type="link">Open</Button>
                  </a>,

                  <a
                    href={`${backendUrl}/api/documents/file/${item._id}?download=true`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button type="link">Download</Button>
                  </a>,
                ]}
              >
                <Space direction="vertical">
                  <Text>
                    <b className="font-semibold">Type:</b> {item.documentType}
                  </Text>
                  <Text>
                    <b className="font-semibold">Date:</b>{" "}
                    {item.documentDate
                      ? new Date(item.documentDate).toDateString()
                      : ""}
                  </Text>
                  <Text>
                    <b className="font-semibold">Notes:</b> {item.notes || "Not Provided"}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* QR MODAL */}
      <Modal
        open={showQR}
        footer={null}
        onCancel={() => setShowQR(false)}
        centered
      >
        <Title level={4} style={{ textAlign: "center" }}>
          Scan QR to access documents
        </Title>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <QRCodeCanvas id="qrCodeCanvas" value={qrLink} size={260} />
        </div>

        <Text
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 12,
            wordBreak: "break-word",
          }}
        >
          {qrLink}
        </Text>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <Button
            type="primary"
            onClick={() => {
              const canvas = document.getElementById("qrCodeCanvas");
              const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");

              const downloadLink = document.createElement("a");
              downloadLink.href = pngUrl;
              downloadLink.download = "medical_records_qr.png";
              downloadLink.click();
            }}
          >
            Download QR
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MedicalRecords;
