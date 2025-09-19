// File: LogAxisChart.jsx
import React, { useEffect, useRef, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { Card } from "antd";

const LogAxisChart = ({ isSmall = false, isMedium = false }) => {
  const chartRef = useRef(null);
  const wrapRef = useRef(null);
  const rafId = useRef(null);

  const forceResize = useCallback(() => {
    const inst = chartRef.current?.getEchartsInstance?.();
    if (inst) inst.resize();
  }, []);

  // Resize when container width/height changes (e.g., Sider collapse/expand)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(forceResize);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [forceResize]);

  // Fallback: also listen to window resize
  useEffect(() => {
    window.addEventListener("resize", forceResize);
    return () => window.removeEventListener("resize", forceResize);
  }, [forceResize]);

  // Generate last 3 months of dates (weekly interval)
  const today = new Date();
  const pastDate = new Date();
  pastDate.setMonth(today.getMonth() - 3);

  const dateList = [];
  for (let d = new Date(pastDate); d <= today; d.setDate(d.getDate() + 7)) {
    dateList.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
  }

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        let tooltip = `<b>${params[0].axisValue}</b><br/>`;
        params.forEach((item) => {
          tooltip += `${item.marker} ${item.seriesName}: $${item.data}<br/>`;
        });
        return tooltip;
      },
      backgroundColor: "#fff",
      borderColor: "#eaeaea",
      borderWidth: 1,
      textStyle: { fontSize: 12, fontWeight: 500, color: "#333" },
    },
    legend: {
      top: "0%",
      right: "5%",
      data: ["Potential Savings", "Realized Savings"],
    },
    grid: { left: "3%", right: "3%", top: 30, bottom: "10%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dateList,
      axisLabel: { formatter: (val) => val.slice(5), fontSize: 10 }, // MM-DD
    },
    yAxis: {
      type: "value",
      name: "USD ($)",
      axisLabel: { formatter: (val) => `$${val}`, fontSize: 10 },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
    },
    series: [
      {
        name: "Potential Savings",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#1677ff" },
        areaStyle: { color: "rgba(22,119,255,0.1)" },
        data: dateList.map((_, i) => [568, 721, 813][i % 3]),
      },
      {
        name: "Realized Savings",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#fa8c16" },
        areaStyle: { color: "rgba(250,140,22,0.1)" },
        data: dateList.map((_, i) => [400, 600, 750][i % 3]),
      },
    ],
  };

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 175,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
        padding: "5px 20px 0px",
        borderRadius: 8,
        background: "#fff",
        overflow: "hidden", // ✅ keep canvas inside
        borderTop: "4px solid #722ed1"
      }}
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 0,
        overflow: "hidden", // ✅ keep canvas inside
      }}
    >
      <h3
        style={{
          fontWeight: 600,
          fontSize: 14,
          margin: "13px 0 10px",
          color: "#333",
        }}
      >
        Savings Trend
      </h3>

      {/* Wrapper observed by ResizeObserver */}
      <div
        ref={wrapRef}
        style={{
          width: "100%",
          flex: 1,
          minHeight: 110, // ensures chart has height to measure
        }}
      >
        <ReactECharts
          ref={chartRef}
          option={option}
          notMerge
          lazyUpdate
          style={{ width: "100%", height: "100%" }} // fill wrapper
          opts={{ renderer: "canvas" }}
          onChartReady={forceResize} // ensure first paint fits container
        />
      </div>
    </Card >
  );
};

export default LogAxisChart;
