// src/components/DonutChart.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography } from "antd";
import { CostContext } from "../../Context/CostContext";

const { Title } = Typography;

const DonutChart = () => {
  const { costData, loading, filters } = useContext(CostContext);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const chartRef = useRef(null);

  // ===== Handle window resize =====
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // ResizeObserver for sidebar toggle
    let resizeTimeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        chartRef.current?.getEchartsInstance()?.resize();
      }, 200); // debounce
    });

    if (chartRef.current?.ele) resizeObserver.observe(chartRef.current.ele);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  // ===== Responsive font sizes =====
  const isSmall = windowWidth < 576;
  const isMedium = windowWidth >= 576 && windowWidth < 992;
  const centerTitleSize = isSmall ? 12 : isMedium ? 14 : 16;
  const centerValueSize = isSmall ? 20 : isMedium ? 26 : 30;
  const labelFontSize = isSmall ? 10 : 14;

  // ===== Process cost data =====
  useEffect(() => {
    if (!costData) return;

    const dailyCosts = costData.daily_service_costs || [];
    const currentMonth = costData.monthly_summary?.current_month;

    const agg = {};
    dailyCosts.forEach((item) => {
      if (!item.service_name || !item.usage_date) return;
      const month = new Date(item.usage_date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (month !== currentMonth) return;

      agg[item.service_name] = (agg[item.service_name] || 0) + (item.total_cost || 0);
    });

    let servicesData = Object.entries(agg)
      .map(([name, value]) => ({ name, value }))
      .filter((s) => s.value > 0 && s.name.toLowerCase() !== "tax");

    const totalValue = servicesData.reduce((acc, item) => acc + item.value, 0);

    // Merge services <5% into "Others"
    const majorServices = [];
    let othersValue = 0;
    servicesData.forEach((item) => {
      if ((item.value / totalValue) * 100 < 5) othersValue += item.value;
      else majorServices.push(item);
    });
    if (othersValue > 0) majorServices.push({ name: "Others", value: othersValue });

    setData(majorServices);
    setTotal(totalValue);
  }, [costData, filters.account_id]);

  // ===== Chart option =====
  const option = {
    tooltip: {
      trigger: "item",
      textStyle: { fontSize: 10, fontWeight: 500, color: "#333" },
    },
    legend: {
      type: "scroll",
      bottom: "1%",
      left: "center",
      orient: isSmall ? "horizontal" : "vertical",
      textStyle: { fontSize: 8, fontWeight: 600 },
      icon: "circle",
      padding: [5, 10],
      itemGap: 4,
    },
    series: [
      {
        type: "pie",
        radius: ["50%", "90%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: {
          show: true,
          position: "inside",
          formatter: "{d}%",
          color: "#000",
          fontWeight: "bold",
          fontSize: labelFontSize,
        },
        labelLine: { show: false },
        data,
      },
    ],
    color: [
      "#0284c7",
      "#22c55e",
      "#facc15",
      "#f97316",
      "#dc2626",
      "#8b5cf6",
      "#f43f5e",
      "#0ea5e9",
      "#14b8a6",
    ],
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "Total Spend",
          textAlign: "center",
          fill: "#64748b",
          fontSize: centerTitleSize,
          fontWeight: 500,
        },
      },
      {
        type: "text",
        left: "center",
        top: "40%",
        style: {
          text: `$${total.toFixed(2)}`,
          textAlign: "center",
          fill: "#0f172a",
          fontSize: centerValueSize,
          fontWeight: 700,
        },
      },
    ],
  };

  // ===== Render =====
  if (loading) {
    return (
      <Card
        style={{
          minHeight: 492,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading...</p>
      </Card>
    );
  }

  return (
    <Card
      bodyStyle={{ padding: "8px 12px" }}
      style={{
        minHeight: 492,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        background: "#fff",
      }}
    >
      <Title level={5} style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>
        Service & Cloud Spend Breakdown
      </Title>

      {data.length === 0 ? (
        <div
          style={{
            height: isSmall ? 280 : isMedium ? 350 : 470,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          No cost data available
        </div>
      ) : (
        <div style={{ width: "100%", height: isSmall ? 280 : isMedium ? 350 : 470 }}>
          <ReactECharts
            ref={chartRef}
            option={option}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "svg" }}
          />
        </div>
      )}
    </Card>
  );
};

export default DonutChart;
