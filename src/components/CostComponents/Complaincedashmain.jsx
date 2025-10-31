// src/components/Complaincedashmain.js
import React, { useContext, useMemo } from "react";
import { Row, Col, Card, Typography, Progress, Tooltip, Spin } from "antd";
import { TagOutlined, UnorderedListOutlined, DollarCircleOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { CostContext } from "../../Context/CostContext";

const { Text } = Typography;

export const Complaincedashmain = () => {
  const { costData, resourcesData, tagSummary, loading, error } = useContext(CostContext);

  // ✅ Get localStorage account IDs
  const storedAccountIds = JSON.parse(localStorage.getItem("account_ids")) || [];

  // ✅ Normalize and filter resource/tag data by account IDs
  const normalizedIds = storedAccountIds.map(String);

  const filteredResources = useMemo(() => {
    if (!Array.isArray(resourcesData)) return [];
    return resourcesData.filter((res) =>
      normalizedIds.includes(String(res.account_id))
    );
  }, [resourcesData, normalizedIds]);

  const filteredTagSummary = useMemo(() => {
    if (!Array.isArray(tagSummary?.details)) return tagSummary;
    const filtered = tagSummary.details.filter((t) =>
      normalizedIds.includes(String(t.account_id))
    );

    // ✅ Aggregate totals across filtered accounts
    const aggregated = filtered.reduce(
      (acc, cur) => {
        acc.fully_tagged += cur.fully_tagged || 0;
        acc.partially_tagged += cur.partially_tagged || 0;
        acc.not_tagged += cur.not_tagged || 0;
        acc.total_resources += cur.total_resources || 0;
        return acc;
      },
      { fully_tagged: 0, partially_tagged: 0, not_tagged: 0, total_resources: 0 }
    );
    return aggregated;
  }, [tagSummary, normalizedIds]);

  const safeTagData = filteredTagSummary || {
    fully_tagged: 0,
    partially_tagged: 0,
    not_tagged: 0,
    total_resources: 0,
  };

  // ✅ Cost data filtered by account ID (if costData is an array)
  const filteredCostData = useMemo(() => {
    if (Array.isArray(costData)) {
      return costData.filter((c) => normalizedIds.includes(String(c.account_id)));
    }
    return costData;
  }, [costData, normalizedIds]);

  // ✅ Calculate compliance values
  const compliance = {
    total_cost: filteredCostData?.total_cost || 25000,
    tagged_cost: filteredCostData?.tagged_cost || 18000,
    untagged_cost: filteredCostData?.untagged_cost || 5000,
    resources: filteredResources.length,
    tagged_resources: safeTagData.fully_tagged + safeTagData.partially_tagged,
    non_taggable_cost: filteredCostData?.non_taggable_cost || 2000,
    service_costs: filteredCostData?.service_costs || {
      EC2: 8000,
      S3: 5000,
      Lambda: 3000,
      RDS: 2000,
      CloudFront: 1000,
    },
    auto_start_stop: filteredCostData?.auto_start_stop || {
      total: 50,
      enabled: 30,
    },
  };

  // ✅ Debug logs (optional)
  console.log("🧩 Stored IDs:", normalizedIds);
  console.log("🧩 Filtered resources:", filteredResources.length);
  console.log("🧩 Filtered tag summary:", safeTagData);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  // Card styling and component render functions stay unchanged ⬇️
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
      cursor: "default",
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

  const AutoStartStopCard = () => {
    const { total, enabled } = compliance.auto_start_stop;
    const disabled = total - enabled;
    const enabledPercent = Math.round((enabled / (total || 1)) * 100);

    return (
      <Card styles={cardStyles("4px solid #eb2f96")} hoverable style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "absolute", top: 12, left: 16 }}>
          <Text strong>Auto Start/Stop</Text>
        </div>
        <div style={{ display: "flex", marginTop: 50, justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Tooltip title={`Enabled: ${enabled} | Disabled: ${disabled}`}>
            <Progress type="circle" percent={enabledPercent} strokeColor="#52c41a" strokeWidth={10} size={150} format={() => `${enabledPercent}%`} />
          </Tooltip>
        </div>
        <div style={{ position: "absolute", bottom: 12, width: "100%", display: "flex", justifyContent: "space-between", padding: "0 16px", fontSize: 12 }}>
          <span style={{ color: "#52c41a", fontWeight: 500 }}>Enabled: {enabled}</span>
          <span style={{ color: "#999", fontWeight: 500 }}>Disabled: {disabled}</span>
        </div>
      </Card>
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

  const ServiceProgressPieCard = () => {

    const taggedResources = safeTagData.fully_tagged + safeTagData.partially_tagged;
    const notTaggedResources = safeTagData.not_tagged;
    const totalResources = safeTagData.total_resources || 1;

    const pieData = [
      { name: "Tagged Resources", value: taggedResources, itemStyle: { color: "#52c41a" } },
      { name: "Not Tagged Resources", value: notTaggedResources, itemStyle: { color: "#ff4d4f" } },
    ];

    const pieOption = {
      tooltip: { trigger: "item", formatter: (params) => `${params.name}: ${params.value} resources (${((params.value / totalResources) * 100).toFixed(1)}%)` },
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
          <Text strong style={{ marginBottom: 15, marginTop: 0, display: "inline-block" }}>Tag Compliance Overview</Text>
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
        <Col xs={24} sm={24} md={12} lg={8}><AutoStartStopCard /></Col>
        <Col xs={24} sm={24} md={12} lg={8}><CostBreakdownCard /></Col>
        <Col xs={24} sm={24} md={12} lg={8}><ServiceProgressPieCard /></Col>
      </Row>
    </div>
  );
};
