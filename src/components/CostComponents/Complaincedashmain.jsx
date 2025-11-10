// src/components/Complaincedashmain.js
import React, { useContext, useMemo, useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Tooltip, Spin } from "antd";
import { TagOutlined, UnorderedListOutlined, DollarCircleOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { CostContext } from "../../Context/CostContext";
import axios from "axios";

const { Text } = Typography;

export const Complaincedashmain = () => {
  const { costData, resourcesData, tagSummary, loading, error } = useContext(CostContext);

  // ✅ Always place hooks before any return conditions
  const [instanceData, setInstanceData] = useState([]);
  const [instanceLoading, setInstanceLoading] = useState(false);

  useEffect(() => {
    const fetchInstances = async () => {
      setInstanceLoading(true);
      try {
        const res = await axios.get("http://13.212.15.14:8004/instances");
        setInstanceData(res.data || []);
      } catch (err) {
        console.error("Instance API Error:", err);
      }
      setInstanceLoading(false);
    };

    fetchInstances();
  }, []);

  // ✅ Stored Accounts
  const storedAccountIds = JSON.parse(localStorage.getItem("account_ids")) || [];
  const normalizedIds = storedAccountIds.map(String);

  // ✅ Filtered resources
  const filteredResources = useMemo(() => {
    if (!Array.isArray(resourcesData)) return [];
    return resourcesData.filter((res) => normalizedIds.includes(String(res.account_id)));
  }, [resourcesData, normalizedIds]);

  // ✅ Filtered tag summary + aggregated totals
  const filteredTagSummary = useMemo(() => {
    if (!Array.isArray(tagSummary?.details)) return tagSummary;

    const filtered = tagSummary.details.filter((t) =>
      normalizedIds.includes(String(t.account_id))
    );

    return filtered.reduce(
      (acc, cur) => {
        acc.fully_tagged += cur.fully_tagged || 0;
        acc.partially_tagged += cur.partially_tagged || 0;
        acc.not_tagged += cur.not_tagged || 0;
        acc.total_resources += cur.total_resources || 0;
        return acc;
      },
      { fully_tagged: 0, partially_tagged: 0, not_tagged: 0, total_resources: 0 }
    );
  }, [tagSummary, normalizedIds]);

  const safeTagData =
    filteredTagSummary || { fully_tagged: 0, partially_tagged: 0, not_tagged: 0, total_resources: 0 };

  // ✅ Cost data filter
  const filteredCostData = useMemo(() => {
    if (Array.isArray(costData)) {
      return costData.filter((c) => normalizedIds.includes(String(c.account_id)));
    }
    return costData;
  }, [costData, normalizedIds]);

  // ✅ Filter instance list for selected accounts
  const filteredInstances = useMemo(() => {
    if (!Array.isArray(instanceData)) return [];
    return instanceData.filter((item) => normalizedIds.includes(String(item.account_id)));
  }, [instanceData, normalizedIds]);

  // ✅ Return loading or error only AFTER all hooks
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  // ✅ UI Start (no changes)
  const cardStyles = (border) => ({
    body: {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      minHeight: 290,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: 12,
      borderTop: border,
      padding: 10,
      width: "100%",
      fontFamily: "'Roboto', sans-serif",
      gap: "1px",
    },
  });

  const renderResourceProgress = (label, value, total, color, icon = null) => {
    const percent = Math.round((value / (total || 1)) * 100);
    return (
      <div style={{ width: "100%" }}>
        <Text strong>
          {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
          {label}
        </Text>
        <Tooltip title={`${value} resources (${percent}%)`}>
          <Progress
            percent={percent}
            strokeColor={{ "0%": color, "100%": `${color}AA` }}
            strokeWidth={14}
            showInfo
            format={() => `${percent}%`}
            style={{ marginTop: 0 }}
          />
        </Tooltip>
        <Text type="secondary" style={{ fontSize: 12, marginTop: 2, display: "block" }}>
          {value} resources
        </Text>
      </div>
    );
  };

  const CostBreakdownCard = () => (
    <Card styles={cardStyles("4px solid #722ed1")} hoverable style={{ flex: 1 }}>
      <div style={{ textAlign: "left", width: "100%" }}>
        <Text strong style={{ marginTop: 0, display: "inline-block" }}>Tag Compliance</Text>
      </div>

      <div style={{ marginBottom: 0 }}>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Total Resources:
          <span style={{ color: "#1890ff", fontWeight: 800, fontSize: 20, marginLeft: 4 }}>
            {safeTagData.total_resources}
          </span>
        </Text>
      </div>

      {renderResourceProgress("Fully Tagged", safeTagData.fully_tagged, safeTagData.total_resources, "#52c41a", <TagOutlined />)}
      {renderResourceProgress("Partially Tagged", safeTagData.partially_tagged, safeTagData.total_resources, "#fa8c16", <UnorderedListOutlined />)}
      {renderResourceProgress("Not Tagged", safeTagData.not_tagged, safeTagData.total_resources, "#ff4d4f", <DollarCircleOutlined />)}
    </Card>
  );

  const InstanceAutoCard = () => {
    const total = filteredInstances.length;
    const enabled = filteredInstances.filter((i) => i.auto_enabled === "YES").length;
    const disabled = total - enabled;
    const enabledPercent = Math.round((enabled / (total || 1)) * 100);

    return (
      <Card styles={cardStyles("4px solid #13c2c2")} hoverable style={{ flex: 1 }}>
        <Text strong style={{ marginBottom: 10, display: "block" }}>
          Auto Start/Stop Status
        </Text>

        {instanceLoading ? (
          <Spin />
        ) : total === 0 ? (
          <Text type="secondary">No instances found for selected account(s)</Text>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Progress
                type="circle"
                percent={enabledPercent}
                strokeColor="#52c41a"
                strokeWidth={10}
                size={150}
                format={() => `${enabledPercent}%`}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 12px", fontSize: 13 }}>
              <span style={{ color: "#52c41a", fontWeight: 500 }}>Enabled: {enabled}</span>
              <span style={{ color: "#ff4d4f", fontWeight: 500 }}>Disabled: {disabled}</span>
            </div>

            <div style={{ marginTop: 15, maxHeight: 140, overflowY: "auto" }}>
              {filteredInstances.map((inst, idx) => (
                <div key={idx} style={{ marginBottom: 10, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                  <Text strong>{inst.instance_id}</Text>
                  <div style={{ fontSize: 12 }}>
                    {inst.region} • {inst.instance_type}
                  </div>
                  <Text type={inst.auto_enabled === "YES" ? "success" : "danger"}>
                    Auto Start/Stop: {inst.auto_enabled}
                  </Text>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    );
  };

  const ServiceProgressPieCard = () => {
    const taggedResources = safeTagData.fully_tagged + safeTagData.partially_tagged;
    const notTaggedResources = safeTagData.not_tagged;
    const totalResources = safeTagData.total_resources || 1;

    const pieData = [
      { name: "Tagged Resources", value: taggedResources, itemStyle: { color: "#52c41a" } },
      { name: "Not Tagged Resources", value: notTaggedResources, itemStyle: { color: "#ff4d4f" } },
    ];

    const pieOption = {
      tooltip: {
        trigger: "item",
        formatter: (params) =>
          `${params.name}: ${params.value} resources (${(
            (params.value / totalResources) *
            100
          ).toFixed(1)}%)`,
      },
      legend: { orient: "horizontal", type: "scroll", height: 100, textStyle: { fontSize: 8, fontWeight: 600 }, bottom: "1%" },
      series: [
        {
          name: "Tag Compliance",
          type: "pie",
          radius: ["35%", "70%"],
          center: ["50%", "40%"],
          avoidLabelOverlap: false,
          label: { show: true, position: "inside", formatter: (params) => `${((params.value / totalResources) * 100).toFixed(1)}%`, fontSize: 14, fontWeight: "bold" },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: "bold" } },
          labelLine: { show: false },
          data: pieData,
        },
      ],
    };

    return (
      <Card styles={cardStyles("4px solid #1890ff")} hoverable style={{ flex: 1 }}>
        <div style={{ textAlign: "left", width: "100%" }}>
          <Text strong style={{ marginBottom: 15, marginTop: 0, display: "inline-block" }}>
            Tag Compliance Overview
          </Text>
        </div>

        <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", marginRight: 16 }}>
              <span style={{ width: 12, height: 12, backgroundColor: "#52c41a", marginRight: 6, borderRadius: "50%" }}></span>
              Tagged: {taggedResources}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <span style={{ width: 12, height: 12, backgroundColor: "#ff4d4f", marginRight: 6, borderRadius: "50%" }}></span>
              Not Tagged: {notTaggedResources}
            </span>
          </Text>
        </div>

        <ReactECharts option={pieOption} style={{ height: 190, width: "100%" }} opts={{ renderer: "svg" }} />
      </Card>
    );
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", padding: "25px 10px" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={8}><InstanceAutoCard /></Col>
        <Col xs={24} sm={24} md={12} lg={8}><CostBreakdownCard /></Col>
        <Col xs={24} sm={24} md={12} lg={8}><ServiceProgressPieCard /></Col>
      </Row>
    </div>
  );
};
