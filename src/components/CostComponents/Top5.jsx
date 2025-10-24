import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography, Checkbox, Row, Col } from "antd";
import { CostContext } from "../../Context/CostContext";
import "../../stylecss/App.css";

const { Title } = Typography;

// Group options
const optionsList = [
  { label: "App", name: "top_apps" },
  { label: "A/C", name: "top_accounts" },
  { label: "Srv", name: "top_services" },
];

// Color palette
const colorPalette = [
  "#0284c7", "#22c55e", "#facc15", "#f97316", "#dc2626",
  "#8b5cf6", "#f43f5e", "#0ea5e9", "#14b8a6"
];

const Top5 = () => {
  const { costData, loading } = useContext(CostContext);
  const [selectedGroup, setSelectedGroup] = useState("top_accounts"); // ✅ single value
  const [isSmall, setIsSmall] = useState(false);
  const [isMedium, setIsMedium] = useState(false);
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  // Responsiveness
  useEffect(() => {
    const handleResize = () => {
      const width = containerRef.current?.offsetWidth || window.innerWidth;
      setIsSmall(width < 576);
      setIsMedium(width >= 576 && width < 768);
      if (chartRef.current) chartRef.current.getEchartsInstance().resize();
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ✅ Single-select handler (radio-like behavior)
  const handleCheckboxChange = (e) => {
    setSelectedGroup(e.target.value); // always replace, never multi-select
  };

  // Top 5 data
  const displayedData = useMemo(() => {
    const groupData = costData?.top_5?.[selectedGroup] || [];
    return groupData
      .map((item) => {
        const name = item.name || item.account_id || item.app_name || "Unknown";
        const currentMonthCost = item.current_month_cost || item.total_cost || 0;
        return { name, value: currentMonthCost };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [selectedGroup, costData]);

  const categories = displayedData.map((item) => item.name);

  // Chart options
  const option = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) =>
        params
          .map((item) => `${item.marker} ${item.name} : <strong>₹${item.data}</strong>`)
          .join("<br/>"),
      textStyle: { fontSize: 10, fontWeight: 500, color: "#333" },
    },
    grid: { left: "0%", right: "10%", bottom: "2%", top: "10%", containLabel: true },
    xAxis: [{
      type: "value",
      name: "USD ($)",
      axisLabel: {
        formatter: (v) => `₹${Math.round(v)}`
      },
      nameTextStyle: { fontSize: 12, fontWeight: 600 },
    }],
    yAxis: [{
      type: "category",
      data: categories,
      axisLabel: {
        fontSize: isSmall ? 9 : 11,
        fontWeight: 500,
        rotate: 40,
        interval: 0,
        formatter: (value) =>
          value.length > 10 ? value.slice(0, 5) + "..." : value,
      },
    }],
    legend: {
      type: "scroll",
      orient: "horizontal",
      bottom: 0,
      data: displayedData.map(({ name }) => name),
      textStyle: {
        fontSize: isSmall ? 8 : isMedium ? 11 : 12,
        fontWeight: 600,
        color: "#333",
      },
    },
    series: [
      {
        name: "Cost",
        type: "bar",
        barWidth: "50%",
        data: displayedData.map((item) => item.value),
        itemStyle: {
          color: (params) => colorPalette[params.dataIndex % colorPalette.length],
        },
        emphasis: { focus: "series" },
        cursor: "default", // 👈 this removes the hand cursor

      },
    ],
  }), [displayedData, isSmall, isMedium]);

  if (loading) return <Card><p>Loading...</p></Card>;

  return (
    <Card
      ref={containerRef}
      style={{
        padding: isSmall ? "12px" : "5px 10px",
        display: "flex",
        flexDirection: "column",
        height: isSmall ? 370 : isMedium ? 300 : 370,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        background: "#fff",
      }}
      bodyStyle={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}
    >
      <Row justify="space-between" align={isSmall ? "top" : "middle"} gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col>
          <Title level={5} style={{ fontWeight: 600, fontSize: isSmall ? 13 : 14, margin: 0, marginTop: 2 }}>
            Top'5'
          </Title>
        </Col>
        <Col flex="auto">
          <Row
            wrap={isSmall}
            gutter={[0, 0]}
            className="custom-checkbox-group"
            style={{ justifyContent: isSmall ? "flex-end" : "flex-start" }}
          >
            {optionsList.map(({ label, name }) => (
              <Checkbox
                key={name}
                value={name}
                checked={selectedGroup === name} // ✅ only one checked
                onChange={handleCheckboxChange}
              >
                {label}
              </Checkbox>
            ))}
          </Row>
        </Col>
      </Row>

      <div style={{ flex: 1 }}>
        <ReactECharts
          ref={chartRef}
          key={selectedGroup}
          option={option}
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>
    </Card>
  );
};

export default Top5;
