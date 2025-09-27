import React from "react";
import { Form, Input, DatePicker, Button } from "antd";
import axios from "axios";

const ReminderForm = ({ onAdd }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const reminder = {
      title: values.title,
      description: values.description,
      time: values.time.toDate()
    };
    await axios.post("http://localhost:5000/api/reminders", reminder);
    onAdd();
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={onFinish} layout="inline" style={{ marginBottom: 20 }}>
      <Form.Item name="title" rules={[{ required: true, message: "Title required" }]}>
        <Input placeholder="Reminder Title" />
      </Form.Item>
      <Form.Item name="description">
        <Input placeholder="Description" />
      </Form.Item>
      <Form.Item name="time" rules={[{ required: true }]}>
        <DatePicker showTime />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Add</Button>
      </Form.Item>
    </Form>
  );
};

export default ReminderForm;
