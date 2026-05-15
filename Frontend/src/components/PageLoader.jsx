import React from "react";
import { Spin } from "antd";

const PageLoader = ({ minHeight = 220, label = "Loading..." }) => {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight,
      }}
    >
      <div style={{ display: "grid", placeItems: "center", gap: 8 }}>
        <Spin size="large" />
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{label}</p>
      </div>
    </div>
  );
};

export default PageLoader;
