import React, { useEffect, useState } from "react";
import { Layout, Typography } from "antd";
import ReminderForm from "../components/Reminder/ReminderForm";
import ReminderList from "../components/Reminder/ReminderList";

const { Header, Content } = Layout;
const { Title } = Typography;

const ReminderHome = () => {
  const [refresh, setRefresh] = useState(false);


useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);

  return (
    <Layout style={{ minHeight: "80vh" }}>
      {/* <Header>
       <Title style={{ color: "white", margin: 0 }} level={2}>
          Reminders App
        </Title>
      </Header> */}
      {/* <Content style={{ padding: "0, 20" }}> */}
      <Content style={{ padding: "16px 100px"}}>
        <ReminderForm onAdd={() => setRefresh(!refresh)} />
        <ReminderList refresh={refresh} />
      </Content>
    </Layout>
  );
};

export default ReminderHome;
