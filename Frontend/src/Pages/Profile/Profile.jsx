import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme, Input, Space } from "antd";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    { key: "1", icon: <UserOutlined />, label: "Your Information", path: "/Profile" },
    { key: "2", icon: <UploadOutlined />, label: "Medical Information", path: "/Profile/MedicalInformation" },
    { key: "3", icon: <UserOutlined />, label: "Activity History", path: "/Profile/History" },
    { key: "4", icon: <SettingOutlined />, label: "Setting", path: "/Profile/Setting" },
    ];

  const pageTitles = menuItems.reduce((acc, item) => {
    acc[item.key] = item.label;
    return acc;
  }, {});

  const getActiveKey = () => {
  const path = location.pathname;

  if (path === "/Profile") return "1";
  if (path.startsWith("/Profile/MedicalInformation")) return "2";
  if (path.startsWith("/Profile/History")) return "3";
  if (path.startsWith("/Profile/Setting")) return "4";

  return "1";
};

const activeKey = getActiveKey();

  return (
    <Layout style={{ minHeight: "70vh", overflow: "hidden" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        theme="light"
        style={{ borderRadius: 8, background: colorBgContainer, height:650 }}
      >
        <Menu
  theme="light"
  mode="inline"
  selectedKeys={[activeKey]}
  items={menuItems}
  onClick={(e) => {
    const item = menuItems.find(i => i.key === e.key);
    if (item) navigate(item.path);
  }}
/>
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: colorBgContainer,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, marginRight: 16 }}
            />
            <h2 style={{ margin: 0, fontWeight: "bold", color: "#1677ff" }}>
              {pageTitles[activeKey]}
            </h2>
          </div>

          {/* <Space>
            <Search
              placeholder="Search..."
              onSearch={(value) => console.log("Search:", value)}
              style={{ width: 300, marginTop:20 }}
              enterButton
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
