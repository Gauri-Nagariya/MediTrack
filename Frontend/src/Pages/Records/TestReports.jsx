import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  message,
  Popconfirm,
  Button,
  Modal,
  Checkbox,
} from "antd";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

const { Meta } = Card;

const TestReports = () => {
  const [testReports, setTestReports] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [qrLink, setQrLink] = useState("");
  const [showQR, setShowQR] = useState(false);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchTestReports();
  }, []);

  const fetchTestReports = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/documents/TestReports`);
      setTestReports(res.data);
    } catch (err) {
      message.error("Failed to load Test Reports");
    }
  };

  const deleteTestReport = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/documents/${id}`);
      message.success("Deleted successfully");
      setTestReports((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const toggleSelect = (id) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const generateQR = async () => {
    if (selectedDocs.length === 0) {
      return message.warning("Select at least one document");
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
    <div
      style={{
        padding: 40,
        minHeight: 560,
        background: "#ffffff",
        borderRadius: 10,
      }}
    >
      <Button type="primary" style={{ marginBottom: 25 }} onClick={generateQR}>
        Generate QR
      </Button>

      <Row gutter={[24, 60]}>
        {testReports.map((item) => (
          <Col key={item._id} span={6}>
            <Card
              hoverable
              style={{ height: "280px" }}
              cover={
                <div
                  style={{
                    height: 100,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f6f8fa",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {/* <div style={{ fontSize: 60 }}>🧪</div> */}
                  <div style={{ fontWeight: 600, marginTop: 6 }}>
                    {'Test Report'}
                  </div>

                  <a
                    href={`${backendUrl}/api/documents/file/${item._id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </div>
              }
              actions={[
                <Popconfirm
                  title="Delete this report?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => deleteTestReport(item._id)}
                >
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>,

                <a
                  href={`${backendUrl}/api/documents/file/${item._id}?download=true`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button type="link">Download</Button>
                </a>,
              ]}
            >
              <Checkbox
                checked={selectedDocs.includes(item._id)}
                onChange={() => toggleSelect(item._id)}
              >
                Select
              </Checkbox>

              <Meta
                style={{ marginTop: 8, textAlign: "center" }}
                title={item.facilityName}
                description={new Date(item.documentDate).toDateString()}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal open={showQR} footer={null} onCancel={() => setShowQR(false)}>
        <h3 style={{ textAlign: "center" }}>Scan QR to access documents</h3>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <QRCodeCanvas id="qrCodeCanvas" value={qrLink} size={256} />
        </div>
        <p style={{ textAlign: "center", marginTop: 10 }}>{qrLink}</p>
         <div
          style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        >
          <Button
            type="primary"
            onClick={() => {
              const canvas = document.getElementById("qrCodeCanvas");
              const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");

              const downloadLink = document.createElement("a");
              downloadLink.href = pngUrl;
              downloadLink.download = "TestReports_qr.png";
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

export default TestReports;
