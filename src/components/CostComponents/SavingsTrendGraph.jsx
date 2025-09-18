// File: SavingsTrendGraph.jsx
import React, { useRef, useEffect, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { Card } from "antd";

const SavingsTrendGraph = () => {
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

  const option = {
    tooltip: { trigger: "axis" },
    legend: {
      top: "0%",
      right: "5%",
      data: ["Tagged", "Untagged", "Non-Taggable", "Total"],
    },
    grid: { left: "3%", right: "3%", top: 30, bottom: "10%", containLabel: true },
    xAxis: {
      type: "category",
      // boundaryGap: false,
      data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (val) => `$${val}` },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
    },
    series: [
      {
        name: "Tagged",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#722ed1" },
        data: [120, 200, 150, 180, 170, 190],
      },
      {
        name: "Untagged",
        type: "bar",
        data: [90, 180, 130, 160, 150, 170],
        itemStyle: { color: "#fa8c16" },
      },
      {
        name: "Non-Taggable",
        type: "bar",
        data: [50, 100, 80, 90, 70, 60],
        itemStyle: { color: "#52c41a" },
      },
      {
        name: "Total",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#eb2f96" },
        data: [260, 480, 360, 430, 390, 420],
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
        borderTop: "4px solid #d23a83",
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

export default SavingsTrendGraph;
