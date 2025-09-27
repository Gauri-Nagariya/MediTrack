// import React, { useState } from "react";
import { Card, Space } from "antd";

// Tabs and cards
const tabListNoTitle  = [
  { key: "Bills", label: "Bills" },
//   { key: "Prescriptions", label: "Prescriptions" },
//   { key: "Lab_Reports", label: "Lab Reports" },
];

const contentListNoTitle = {
  Bills: (
    <div className="bg-[#f4f6f8]">
      <div id="Bills">
        <Space direction="horizontal" size={16}>
          <Card
            size="small"
            title="Bills"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 20px" }}
          >
            <p>Bills</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
          <Card
            size="small"
            title="Bills"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 10px" }}
          >
            <p>Bills</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
        </Space>
      </div>
    </div>
  )
};

const Bills = ({ activeTabKey, setActiveTabKey }) => {
  return (
    <section id="Bills" >
      <Card
         title={
    <h1
      id="ReportsHeading"
      className="p-5 bg-white text-4xl text-center font-bold text-blue-600 border-none"
    >
      Bills
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

export default Bills;
