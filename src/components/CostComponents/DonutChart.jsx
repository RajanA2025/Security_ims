import React, { useEffect, useState, useRef, useContext } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography } from "antd";
import { CostContext } from "../../Context/CostContext";

const { Title } = Typography;

const DonutChart = () => {
  const { costData, loading } = useContext(CostContext);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // ===== Process service_wise_costs =====
  useEffect(() => {
    if (!costData || !costData.monthly_summary) {
      setData([]);
      setTotal(0);
      return;
    }

    const serviceCosts = costData.monthly_summary?.service_wise_costs || [];
    const totalValue = Number(costData.monthly_summary?.current_month_cost ?? 0); // ✅ Use API total

    const agg = {};
    serviceCosts.forEach((item) => {
      const name = item.service_name || "Unknown";
      const value = Number(item.total_cost ?? 0);

      if (value < 0) return; // ignore negative
      agg[name] = (agg[name] || 0) + value;
    });

    // Merge tiny slices (<1%) into Others
    const displayData = [];
    let othersValue = 0;
    const thresholdPercent = 1;

    Object.entries(agg).forEach(([name, value]) => {
      if ((value / totalValue) * 100 < thresholdPercent) {
        othersValue += value;
      } else {
        displayData.push({ name, value });
      }
    });

    if (othersValue > 0) displayData.push({ name: "Others", value: othersValue });

    setData(displayData);
    setTotal(totalValue); // ✅ Total now matches API
  }, [costData]);


  // ===== ResizeObserver =====
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      setContainerWidth(containerRef.current.offsetWidth);
      chartRef.current?.getEchartsInstance().resize();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isSmall = containerWidth < 576;
  const isMedium = containerWidth >= 576 && containerWidth < 992;
  const centerTitleSize = isSmall ? 12 : isMedium ? 14 : 16;
  const centerValueSize = isSmall ? 20 : isMedium ? 26 : 30;
  const labelFontSize = isSmall ? 12 : 14;

  const option = {
    tooltip: {
      trigger: "item",
      textStyle: { fontSize: 10, fontWeight: 500, color: "#333" },
      formatter: (params) => {
        const value = Array.isArray(params.value) ? params.value[1] : params.value;
        return `${params.name}: $${Number(value).toFixed(2)}`;
      },
    },
    legend: {
      type: "scroll",
      top: "69%",
      bottom: "0%",
      left: "center",
      orient: "vertical",
      textStyle: { fontSize: 8, fontWeight: 600, color: "#333", fontFamily: " Roboto, sans-serif", },
      icon: "circle",
      padding: [5, 100, 0, 100],
      itemGap: 8,
    },
    series: [
      {
        type: "pie",
        radius: ["50%", "90%"],
        center: ["50%", "35%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, position: "inside", formatter: "{d}%", color: "#000", fontWeight: "bold", fontSize: labelFontSize },
        labelLine: { show: false },
        data,
      },
    ],
    color: ["#0284c7", "#22c55e", "#facc15", "#f97316", "#afef40ff", "#8b5cf6", "#7cdafaff", "#0ea5e9", "#14b8a6"],
    graphic: [
      { type: "text", left: "center", top: "38%", style: { text: "Total Spend", textAlign: "center", fill: "#64748b", fontSize: centerTitleSize, fontWeight: 500 } },
      { type: "text", left: "center", top: "30%", style: { text: `$${total.toFixed(2)}`, textAlign: "center", fill: "#0f172a", fontSize: centerValueSize, fontWeight: 700 } },
    ],
  };

  if (loading) {
    return <Card style={{ minHeight: 492, display: "flex", alignItems: "center", justifyContent: "center" }}><p>Loading...</p></Card>;
  }

  return (
    <Card bodyStyle={{ padding: "8px 12px" }} style={{ minHeight: 520, boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", borderRadius: "8px", background: "#fff" }}>
      <Title level={5} style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Service & Cloud Spend Breakdown</Title>

      <div ref={containerRef} style={{ width: "100%", height: isSmall ? 480 : isMedium ? 350 : 470 }}>
        {data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#64748b" }}>
            No service cost data available
          </div>
        ) : (
          <ReactECharts ref={chartRef} option={option} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
        )}
      </div>
    </Card>
  );
};

export default DonutChart;
