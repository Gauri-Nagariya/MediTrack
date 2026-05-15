import { useEffect, useState } from "react";
import { Card, Col, Row, message, Popconfirm, Button, Checkbox } from "antd";
import axios from "axios";
import ShareWithDoctorModal from "../../components/ShareWithDoctorModal";

const { Meta } = Card;

const BillsInvoices = () => {
  const [billsInvoices, setBillsInvoices] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const openShare = async () => {
    if (selectedDocs.length === 0) {
      return message.warning("Select at least one document");
    }
    setShowShareModal(true);
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
        onClick={openShare}
      >
        Share
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

      <ShareWithDoctorModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentIds={selectedDocs}
        onShared={() => setSelectedDocs([])}
      />
    </div>
  );
};

export default BillsInvoices;
