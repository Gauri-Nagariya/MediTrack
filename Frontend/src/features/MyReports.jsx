// src/features/MyReports.js
import React, { useState } from "react";
import { Card, Space } from "antd";

// Tabs and cards
const tabListNoTitle = [
  { key: "Reports", label: "Reports" },
  { key: "Prescriptions", label: "Prescriptions" },
  { key: "Lab_Reports", label: "Lab Reports" },
];

const contentListNoTitle = {
  Reports: (
    <div className="bg-[#f4f6f8]">
      <div id="Reports">
        <Space direction="horizontal" size={16}>
          <Card
            size="small"
            title="Report"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 20px" }}
          >
            <p>Card content</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
          <Card
            size="small"
            title="Report"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 10px" }}
          >
            <p>Card content</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
        </Space>
      </div>
    </div>
  ),
  Prescriptions: (
    <div className="bg-[#f4f6f8]">
      <div id="Prescriptions">
        <Space direction="horizontal" size={16}>
          <Card
            size="small"
            title="Prescription"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 20px" }}
          >
            <p>Card content</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
          <Card
            size="small"
            title="Prescription"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 10px" }}
          >
            <p>Card content</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
        </Space>
      </div>
    </div>
  ),
  Lab_Reports: (
    <div className="bg-[#f4f6f8]">
      <div id="Lab_Reports">
        <Space direction="horizontal" size={16}>
          <Card
            size="small"
            title="Lab Report"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 20px" }}
          >
            <p>Card content</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
          <Card
            size="small"
            title="Lab Report"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 10px" }}
          >
            <p>Card content</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
        </Space>
      </div>
    </div>
  ),
};

const MyReports = ({ activeTabKey, setActiveTabKey }) => {
  return (
    <section id="myRecords">
     <Card
  title={
    <h1
      id="ReportsHeading"
      className="p-5 bg-white text-4xl text-center font-bold text-blue-600 border-none"
    >
      My Records
    </h1>
  }
  style={{ width: "100%" }}
  tabList={tabListNoTitle}
  activeTabKey={activeTabKey}
  onTabChange={setActiveTabKey}
  tabProps={{ size: "middle" }}
>
  {contentListNoTitle[activeTabKey]}
</Card>
    </section>
  );
};

export default MyReports;
