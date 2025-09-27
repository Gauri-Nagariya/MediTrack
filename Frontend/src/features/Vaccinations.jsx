// import React, { useState } from "react";
import { Card, Space } from "antd";

// Tabs and cards
const tabListNoTitle = [
  { key: "Vaccinations", label: "Vaccinations" },
//   { key: "Prescriptions", label: "Prescriptions" },
//   { key: "Lab_Reports", label: "Lab Reports" },
];

const contentListNoTitle = {
  Vaccinations: (
    <div className="bg-[#f4f6f8]">
      <div id="Vaccinations">
        <Space direction="horizontal" size={16}>
          <Card
            size="small"
            title="Vaccinations"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 20px" }}
          >
            <p>Vaccinations</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
          <Card
            size="small"
            title="Vaccinations"
            extra={<a href="#">View</a>}
            style={{ width: 300, margin: "20px 10px" }}
          >
            <p>Vaccinations</p>
            <p>Date</p>
            <p>Type</p>
          </Card>
        </Space>
      </div>
    </div>
  )
};

const Vaccinations = ({ activeTabKey, setActiveTabKey }) => {
  return (
    <section id="Vaccinations" >
      <Card
         title={
    <h1
      id="ReportsHeading"
      className="p-5 bg-white text-4xl text-center font-bold text-blue-600 border-none"
    >
      Vaccinations
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

export default Vaccinations;
