import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  message,
  Popconfirm,
  Button,
  Checkbox,
} from "antd";
import axios from "axios";
import ShareWithDoctorModal from "../../components/ShareWithDoctorModal";

const { Meta } = Card;

const TestReports = () => {
  const [testReports, setTestReports] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const openShare = async () => {
    if (selectedDocs.length === 0) {
      return message.warning("Select at least one document");
    }
    setShowShareModal(true);
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
      <Button type="primary" style={{ marginBottom: 25 }} onClick={openShare}>
        Share
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

      <ShareWithDoctorModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentIds={selectedDocs}
        onShared={() => setSelectedDocs([])}
      />
    </div>
  );
};

export default TestReports;
