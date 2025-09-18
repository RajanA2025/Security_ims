// File: src/components/DonutChart.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography } from "antd";
import { CostContext } from "../Context/CostContext.jsx";  // ⬅️ import context

const { Title } = Typography;

const DonutChart = () => {
  const { costData, loading } = useContext(CostContext); // ✅ use costData
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const chartRef = useRef(null);

  // Responsive breakpoints
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmall = windowWidth < 576; // xs
  const isMedium = windowWidth >= 576 && windowWidth < 992; // sm-md

  const centerTitleSize = isSmall ? 12 : isMedium ? 14 : 16;
  const centerValueSize = isSmall ? 20 : isMedium ? 26 : 30;
  const labelFontSize = isSmall ? 10 : 14;

  // 🔹 Transform API data into chart data
  useEffect(() => {
    if (!costData?.monthly_summary?.service_wise_costs) return;

    const servicesData = costData.monthly_summary.service_wise_costs
      .filter(
        (s) =>
          s.total_cost > 0 && s.service_name.toLowerCase() !== "tax"
      )
      .map((s) => ({ value: s.total_cost, name: s.service_name }));

    const totalValue = servicesData.reduce(
      (acc, item) => acc + item.value,
      0
    );

    // Merge <5% into "Others"
    const majorServices = [];
    let othersValue = 0;
    servicesData.forEach((item) => {
      if ((item.value / totalValue) * 100 < 5) othersValue += item.value;
      else majorServices.push(item);
    });
    if (othersValue > 0)
      majorServices.push({ name: "Others", value: othersValue });

    setData(majorServices);
    setTotal(totalValue);
  }, [costData]);

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
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{d}%",
          color: "#000000ff",
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

  // 🟢 ResizeObserver to handle sidebar toggle
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      chartRef.current?.getEchartsInstance()?.resize();
    });
    if (chartRef.current?.ele) resizeObserver.observe(chartRef.current.ele);

    return () => resizeObserver.disconnect();
  }, []);

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

      <div
        style={{
          width: "100%",
          height: isSmall ? 280 : isMedium ? 350 : 470,
        }}
      >
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>
    </Card>
  );
};

export default DonutChart;
