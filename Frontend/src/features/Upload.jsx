import React from "react";
import { Upload, message, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

const Upload = () => {
  const props = {
    name: "file",
    multiple: true,
    action: "/upload.do", // replace with your API endpoint
    accept: ".jpg,.png,.pdf,.docx",
    maxCount: 5,
    showUploadList: {
      showRemoveIcon: true,
      showPreviewIcon: true,
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    beforeUpload(file) {
      const allowedTypes = [".jpg", ".png", ".pdf", ".docx"];
      const isAllowed = allowedTypes.some((ext) => file.name.endsWith(ext));
      if (!isAllowed) {
        message.error(`${file.name} is not a supported file type.`);
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(`${file.name} must be smaller than 2MB.`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  return (
    <div className="p-4 border-2 bg-yellow-100">
      <h2 className="mb-4">Upload Your Files</h2>
      <Dragger {...props} style={{ padding: 20 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for multiple files. Max 5 files. Only JPG, PNG, PDF, DOCX.
        </p>
        <Button type="primary" style={{ marginTop: 10 }}>
          Select Files
        </Button>
      </Dragger>
    </div>
  );
};

export default Upload;
