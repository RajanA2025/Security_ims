import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography, Checkbox, Row, Col } from "antd";
import { CostContext } from "../../Context/CostContext";  // ⬅️ import context
import "../../stylecss/App.css";

const { Title } = Typography;

const optionsList = [
  { label: "App", name: "top_apps_current_month" },
  { label: "A/C", name: "top_accounts_current_month" },
  { label: "Srv", name: "top_services_current_month" },
];

const Top5 = () => {
  const { costData, loading } = useContext(CostContext);   // ✅ use costData
  const [selectedGroups, setSelectedGroups] = useState(["top_services_current_month"]);
  const [isSmall, setIsSmall] = useState(false);
  const [isMedium, setIsMedium] = useState(false);
  const chartRef = useRef(null);

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsSmall(width < 576);
      setIsMedium(width >= 576 && width < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelectedGroups((prev) =>
      checked ? [...new Set([...prev, value])] : prev.filter((g) => g !== value)
    );
  };

  // Prepare chart data
  const displayedData = useMemo(() => {
    return selectedGroups
      .flatMap((groupKey) => {
        const groupData = costData?.top_5?.[groupKey] || [];  // ✅ use costData
        return groupData
          .map((item) => {
            const name = item.name || item.account_id || item.app_name || "Unknown";
            return {
              name,
              values: Array(7).fill(item.total_cost),
              total: item.total_cost,
            };
          })
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
      });
  }, [selectedGroups, costData]);  // ✅ dependency changed

  const categories = Array(7).fill("");

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        formatter: (params) =>
          params.map(item => `${item.marker} ${item.seriesName} <strong>₹${item.data}</strong>`).join("<br/>"),
        textStyle: { fontSize: 10, fontWeight: 500, color: "#333" },
      },
      legend: {
        type: "scroll",
        orient: isSmall ? "vertical" : "horizontal",
        bottom: isSmall ? "auto" : "0%",
        right: isSmall ? 0 : "auto",
        top: isSmall ? 30 : "auto",
        data: displayedData.map(({ name }) => name),
        textStyle: {
          fontSize: isSmall ? 8 : isMedium ? 11 : 12,
          fontWeight: 600,
          color: "#333",
        },
      },
      grid: { left: "2%", right: "2%", bottom: "15%", top: "10%", containLabel: true },
      xAxis: [{ type: "category", data: categories, axisLabel: { show: false } }],
      yAxis: [{
        type: "log",
        name: "USD ($)",
        min: 1,
        axisLabel: { formatter: (v) => `₹${v.toFixed(2)}` },
      }],
      series: displayedData.map(({ name, values }) => ({
        name,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        areaStyle: { opacity: 0.15 },
        lineStyle: { width: 2 },
        emphasis: { focus: "series" },
        data: values,
      })),
    }),
    [displayedData, isSmall, isMedium]
  );

  useEffect(() => {
    if (chartRef.current) chartRef.current.getEchartsInstance().resize();
  }, [displayedData]);

  if (loading) return <Card><p>Loading...</p></Card>;

  return (
    <Card
      style={{
        padding: isSmall ? "12px" : "05px 10px",
        display: "flex",
        flexDirection: "column",
        height: isSmall ? 280 : isMedium ? 300 : 358,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        background: "#fff",
      }}
      bodyStyle={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}
    >
      {/* Header */}
      <Row justify="space-between" align={isSmall ? "top" : "middle"} gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col>
          <Title level={5} style={{ fontWeight: 500, fontSize: isSmall ? 13 : 14, margin: 0, marginTop: 2 }}>
            Top'5'
          </Title>
        </Col>
        <Col flex="auto">
          <Row
            wrap={isSmall}
            gutter={[0, 0]}
            className="custom-checkbox-group"
            style={{ justifyContent: isSmall ? "flex-start" : "flex-end" }}
          >
            {optionsList.map(({ label, name }) => (
              <Checkbox
                key={name}
                value={name}
                checked={selectedGroups.includes(name)}
                onChange={handleCheckboxChange}
              >
                {label}
              </Checkbox>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Chart */}
      <div style={{ flex: 1 }}>
        <ReactECharts
          ref={chartRef}
          key={selectedGroups.join(",")}
          option={option}
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>
    </Card>
  );
};

export default Top5;
