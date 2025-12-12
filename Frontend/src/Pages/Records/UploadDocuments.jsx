import React, { useState } from "react";
import { Form, Input, Select, DatePicker, Button, Upload, message, theme } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

const { Dragger } = Upload;

const MyDatePicker = React.forwardRef((props, ref) => {
  return <DatePicker {...props} ref={ref} />;
});


const UploadDocuments = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const uploadProps = {
    beforeUpload: (file) => {
      setFile(file);                 
      return false;                      
    },
    maxCount: 1,
  };

  const onFinish = async (values) => {
    if (!file) {
      return message.error("Please upload a document file!");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("documentType", values.documentType);
    formData.append("documentDate", values.documentDate);
    formData.append("facilityName", values.facilityName);
    formData.append("notes", values.notes || "");

    try {
      const res = await axios.post(
        `${backendUrl}/api/documents/upload`,       //multer API
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      message.success("Document uploaded successfully!");
      form.resetFields();
      setFile(null);

      console.log("Server Response: ", res.data);
    } catch (err) {
      message.error("Upload failed!");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: 24,
        minHeight: 550,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      <Form
        form={form}
        onFinish={onFinish}
        style={{ maxWidth: 830 }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
      >
        <Form.Item
          label="Document Type"
          name="documentType"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: "Prescription", value: "Prescription" },
              { label: "Report", value: "Report" },
              { label: "Bill", value: "Bill" },
              { label: "Scan / X-Ray", value: "Scan / X-Ray" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Document Date"
          name="documentDate"
          rules={[{ required: true }]}
        >
          <MyDatePicker />
        </Form.Item>

        <Form.Item
          label="Doctor / Hospital / Lab Name"
          name="facilityName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit" className="w-[88%]">
            Submit
          </Button>
        </Form.Item>
      </Form>

      <p className="ml-54 my-4">upload document in PDF format only.</p>

      <Dragger
        {...uploadProps}
        style={{
          marginLeft: 210,
          minHeight: 100,
          width: 480,
          marginBottom: 40,
        }}
      >
        <InboxOutlined />
        <p>Upload files here</p>
      </Dragger>
    </div>
  );
};

export default UploadDocuments;
