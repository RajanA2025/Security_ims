// File: LogAxisChart.jsx
import React, { useEffect, useRef, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { Card } from "antd";

const LogAxisChart = () => {
  const chartRef = useRef(null);
  const wrapRef = useRef(null);
  const rafId = useRef(null);

  const forceResize = useCallback(() => {
    const inst = chartRef.current?.getEchartsInstance?.();
    if (inst) inst.resize();
  }, []);

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

  useEffect(() => {
    window.addEventListener("resize", forceResize);
    return () => window.removeEventListener("resize", forceResize);
  }, [forceResize]);

  // Small dataset
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep"];
  const potentialSavings = [500, 1000, 1500, 2000,2500,3000,3500,4000,4500];
  const realizedSavings = [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400];

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
      textStyle: { fontSize: 10 },
    },
    grid: { left: "3%", right: "3%", top: 30, bottom: "10%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: months,
      axisLabel: { fontSize: 10 },
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
        data: potentialSavings,
      },
      {
        name: "Realized Savings",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#fa8c16" },
        areaStyle: { color: "rgba(250,140,22,0.1)" },
        data: realizedSavings,
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
        overflow: "hidden",
        borderTop: "4px solid #722ed1",
      }}
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 0,
        overflow: "hidden",
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

      <div
        ref={wrapRef}
        style={{
          width: "100%",
          flex: 1,
          minHeight: 110,
        }}
      >
        <ReactECharts
          ref={chartRef}
          option={option}
          notMerge
          lazyUpdate
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "canvas" }}
          onChartReady={forceResize}
        />
      </div>
    </Card>
  );
};

export default LogAxisChart;
