import React from "react";
import { Form, Input, DatePicker, Button, Radio } from "antd";
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
      <Form.Item label="Type" name="type" rules={[{ required: true }]}>
  <Radio.Group>
    <Radio value="reminder">Reminder (one-time)</Radio>
    <Radio value="alarm">Alarm (daily)</Radio>
  </Radio.Group>
</Form.Item>
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
