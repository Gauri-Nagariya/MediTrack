import React, { useState } from "react";
import Prescriptions from "./Prescriptions";
import TestReports from "./TestReports";
import BillsInvoices from "./BillsInvoices";
import MedicalRecords from "./MedicalRecords";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import {
  Layout,
  Menu,
  theme,
  message,
  Upload,
  Form,
  Input,
  // Flex,
} from "antd";

const { Header, Content, Sider } = Layout;
const { Dragger } = Upload;
const { Search } = Input;

// Sidebar menu items
const items = [
  { key: "1", icon: <UserOutlined />, label: "Upload Documents" },
  { key: "2", icon: <VideoCameraOutlined />, label: "Prescriptions" },
  { key: "3", icon: <UploadOutlined />, label: "Test Reports" },
  { key: "4", icon: <UserOutlined />, label: "Bills & Invoices" },
  { key: "5", icon: <UserOutlined />, label: "Medical Records" },
];

const pageTitles = {
  1: "Upload Documents",
  2: "Prescriptions",
  3: "Test Reports",
  4: "Bills & Invoices",
  5: "Medical Records",
};

const uploadProps = {
  name: "file",
  multiple: true,
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  onChange(info) {
    const { status } = info.file;
    if (status === "done") message.success(`${info.file.name} uploaded.`);
    else if (status === "error") message.error(`${info.file.name} failed.`);
  },
};

const onSearch = (value, _e, info) => {
  console.log(info?.source, value);
};

const App = () => {


  const navigate = useNavigate();
const location = useLocation();
  // const [activeLayout, setActiveLayout] = useState("1");
  const getActiveKeyFromPath = () => {
  if (location.pathname === "/records") return "1";
  if (location.pathname.includes("prescriptions")) return "2";
  if (location.pathname.includes("test-reports")) return "3";
  if (location.pathname.includes("bills")) return "4";
  if (location.pathname.includes("medical-records")) return "5";
  return "1";
};

const activeKey = getActiveKeyFromPath();



  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [form] = Form.useForm();
  const variant = Form.useWatch("variant", form);

  return (
    <Layout style={{ minHeight: "70vh", overflow: "hidden" }}>
      <Sider
        style={{ background: colorBgContainer, height: 638, borderRadius: 5 }}
      >
        <Menu
  theme="light"
  mode="inline"
  selectedKeys={[activeKey]}
  items={items}
  onClick={(e) => {
    if (e.key === "1") navigate("/records");
    if (e.key === "2") navigate("/records/prescriptions");
    if (e.key === "3") navigate("/records/test-reports");
    if (e.key === "4") navigate("/records/bills");
    if (e.key === "5") navigate("/records/medical-records");
  }}
/>
      </Sider>

      <Layout>
        <Header
          style={{
            background: colorBgContainer,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // gap: 740,
          }}
        >
          <h2 className="text-xl font-bold text-blue-600 flex w-60">
            {/* {pageTitles[activeLayout]} */}
            {pageTitles[activeKey]}
          </h2>
          {/* <Space>
            <Search
              placeholder="Search"
              onSearch={onSearch}
              enterButton
              style={{ marginTop: 20, width: 300 }}
            />
          </Space> */}
        </Header>

        <Content
          style={{
            margin: "24px 16px 0",
            height: "calc(80vh - 100px)", 
            overflowY: "auto",
            paddingRight: 16,
            scrollbarWidth: "none",
          }}
        >
         <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
