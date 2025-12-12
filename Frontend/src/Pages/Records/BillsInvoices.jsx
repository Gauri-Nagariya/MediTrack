import { useEffect, useState } from "react";
import { Card, Col, Row, message, Popconfirm, Button, Modal, Checkbox } from "antd";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

const { Meta } = Card;

const BillsInvoices = () => {
  const [billsInvoices, setBillsInvoices] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [qrLink, setQrLink] = useState("");
  const [showQR, setShowQR] = useState(false);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    fetchBillsInvoices();
  }, []);

  const fetchBillsInvoices = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/documents/bills`);
      setBillsInvoices(res.data);
    } catch (err) {
      message.error("Failed to load bills");
    }
  };

  const deleteBillsInvoices = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/documents/${id}`);
      message.success("Deleted successfully");
      setBillsInvoices((prev) => prev.filter((item) => item._id !== id));
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

  const openPreview = (doc) => {
    setZoom(1);
    setPreviewDoc(doc);
  };

  return (
    <div
      style={{
        padding: 40,
        minHeight: 560,
        background: "#fff",
        borderRadius: 10,
      }}
    >
      <Button
        type="primary"
        style={{ marginBottom: 25 }}
        onClick={generateQR}
      >
        Generate QR
      </Button>

      <Row gutter={[24, 60]}>
        {billsInvoices.map((item) => (
          <Col key={item._id} span={6}>
            <Card
              hoverable
              style={{ height: "320px" }}
              cover={
                <div
                  style={{
                    height: 160,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f5f7fa",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ fontSize: 60 }}>📄</div>
                  
                  <div style={{ fontWeight: 600, marginTop: 8 }}>
                    {item.filename || "Document"}
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
                  title="Are you sure you want to delete?"
                  onConfirm={() => deleteBillsInvoices(item._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger type="link">
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
                style={{ marginTop: 8, textAlign: "left" }}
                title={`Report: ${item.facilityName}`}
                description={`Note: ${item.notes || "Not Provided"}`}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* QR MODAL */}
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
              downloadLink.download = "prescriptions_qr.png";
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

export default BillsInvoices;
