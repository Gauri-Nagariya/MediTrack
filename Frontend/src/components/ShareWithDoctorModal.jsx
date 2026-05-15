import React, { useContext, useEffect, useState } from "react";
import { Modal, Select, Input, message } from "antd";
import axios from "axios";
import { AppContext } from "../Context/AppContext";

const ShareWithDoctorModal = ({ open, onClose, documentIds = [], onShared }) => {
  const { backendUrl, token } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      if (!open || !token) return;
      try {
        const { data } = await axios.get(`${backendUrl}/api/appointments/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setDoctors(data.doctors || []);
      } catch {
        message.error("Unable to load doctors");
      }
    };
    loadDoctors();
  }, [open, token, backendUrl]);

  const share = async () => {
    if (!documentIds.length) {
      message.warning("Select at least one document");
      return;
    }
    if (!doctorId) {
      message.warning("Select doctor");
      return;
    }
    if (!reason.trim()) {
      message.warning("Enter reason for sharing");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `${backendUrl}/api/share/to-doctor`,
        { documentIds, doctorId, reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        message.success("Documents shared");
        setDoctorId("");
        setReason("");
        onShared?.(data.share);
        onClose();
      } else {
        message.error(data.message || "Unable to share");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Unable to share");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Share Documents with Doctor"
      open={open}
      onCancel={onClose}
      onOk={share}
      okText={submitting ? "Sharing..." : "Share"}
      okButtonProps={{ disabled: submitting }}
    >
      <div className="space-y-3">
        <div>
          <p className="text-sm mb-1">Doctor</p>
          <Select
            value={doctorId || undefined}
            onChange={(value) => setDoctorId(value)}
            className="w-full"
            placeholder="Select doctor"
            options={doctors.map((doctor) => ({
              value: doctor._id,
              label: `${doctor.name}${doctor.doctorId ? ` (${doctor.doctorId})` : ""}`,
            }))}
          />
        </div>
        <div>
          <p className="text-sm mb-1">Reason</p>
          <Input.TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you sharing these files?"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ShareWithDoctorModal;

