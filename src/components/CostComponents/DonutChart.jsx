import React, { useEffect, useState, useRef, useContext } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Typography } from "antd";
import { CostContext } from "../../Context/CostContext";

const { Title } = Typography;

/**
 * DonutChart (fixed)
 *
 * Fixes applied:
 * - othersGrouping: avoid division-by-zero and compute threshold relative to actual summed data when API total is missing/zero.
 * - resizeObserverInline: protect against missing ResizeObserver, debounce resize callback, and safe cleanup.
 * - breakpointMagicNumbers: extracted breakpoint constants for clarity (SMALL_BREAKPOINT, MEDIUM_BREAKPOINT).
 * - tooltipValueFormatter: robust formatter that handles various param shapes and formats numbers safely.
 *
 * UI is unchanged.
 */

const SMALL_BREAKPOINT = 576;
const MEDIUM_BREAKPOINT = 992;
const OTHERS_THRESHOLD_PERCENT = 1; // slice smaller than 1% will be grouped into "Others"

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

    const serviceCosts = Array.isArray(costData.monthly_summary?.service_wise_costs)
      ? costData.monthly_summary.service_wise_costs
      : [];

    // Prefer API-provided total if numeric and > 0; otherwise fall back to sum of serviceCosts
    const apiTotalRaw = costData.monthly_summary?.current_month_cost;
    const apiTotal = Number(apiTotalRaw);
    const sumOfServices = serviceCosts.reduce((s, item) => s + Number(item?.total_cost ?? 0), 0);
    const totalValue = Number.isFinite(apiTotal) && apiTotal > 0 ? apiTotal : sumOfServices;

    // aggregate service costs
    const agg = {};
    serviceCosts.forEach((item) => {
      const name = item?.service_name ? String(item.service_name) : "Unknown";
      const value = Number(item?.total_cost ?? 0);
      if (!Number.isFinite(value) || value <= 0) return; // ignore non-positive or invalid
      agg[name] = (agg[name] || 0) + value;
    });

    // If no aggregated data (empty agg), clear state
    const entries = Object.entries(agg);
    if (entries.length === 0) {
      setData([]);
      setTotal(totalValue || 0);
      return;
    }

    // use the sensible denominator for percent calculation:
    // prefer totalValue (API or sumOfServices) but if that's zero, sum agg values
    const denom = totalValue > 0 ? totalValue : entries.reduce((s, [, v]) => s + v, 0);

    // Merge tiny slices into "Others" (items < threshold percent)
    const displayData = [];
    let othersValue = 0;
    entries.forEach(([name, value]) => {
      const pct = denom > 0 ? (value / denom) * 100 : 0;
      if (pct < OTHERS_THRESHOLD_PERCENT) {
        othersValue += value;
      } else {
        displayData.push({ name, value });
      }
    });

    if (othersValue > 0) {
      displayData.push({ name: "Others", value: othersValue });
    }

    // sort descending so legend / slices are stable
    displayData.sort((a, b) => b.value - a.value);

    setData(displayData);
    setTotal(denom);
  }, [costData]);

  // ===== ResizeObserver (safe, debounced) =====
  useEffect(() => {
    if (!containerRef.current) return;

    // guard for environments without ResizeObserver
    const RO = typeof ResizeObserver !== "undefined" ? ResizeObserver : null;
    if (!RO) {
      // set initial width
      setContainerWidth(containerRef.current.offsetWidth || 0);
      return;
    }

    let frame = null;
    const resizeHandler = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        setContainerWidth(containerRef.current.offsetWidth || 0);
        try {
          // chartRef may be null or not yet mounted
          const inst = chartRef.current?.getEchartsInstance?.();
          if (inst && typeof inst.resize === "function") inst.resize();
        } catch {
          // swallow errors - resize is best-effort
        }
      });
    };

    const observer = new RO(resizeHandler);
    observer.observe(containerRef.current);

    // set initial width
    setContainerWidth(containerRef.current.offsetWidth || 0);

    return () => {
      if (observer && observer.disconnect) observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [containerRef]);

  const isSmall = containerWidth > 0 ? containerWidth < SMALL_BREAKPOINT : false;
  const isMedium = containerWidth > 0 ? containerWidth >= SMALL_BREAKPOINT && containerWidth < MEDIUM_BREAKPOINT : false;

  const centerTitleSize = isSmall ? 12 : isMedium ? 14 : 16;
  const centerValueSize = isSmall ? 20 : isMedium ? 26 : 30;
  const labelFontSize = isSmall ? 12 : 14;

  const legendTextStyle = {
    fontSize: 9,
    fontWeight: 600,
    color: "#333",
    fontFamily: "Roboto, sans-serif",
  };

  // Robust tooltip formatter
  const safeFormatter = (params) => {
    try {
      // params can be object or array depending on ECharts usage
      const p = Array.isArray(params) ? params[0] : params;
      const name = String(p?.name ?? "");
      let rawValue = p?.value;
      // value may be number or [name,value] depending on series config
      if (Array.isArray(rawValue)) rawValue = rawValue[1];
      const numeric = Number(rawValue ?? 0);
      const formatted = Number.isFinite(numeric) ? numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
      return `${name}: $${formatted}`;
    } catch {
      return "";
    }
  };

  const option = {
    tooltip: {
      trigger: "item",
      textStyle: { fontSize: 10, fontWeight: 500, color: "#333" },
      formatter: safeFormatter,
    },
    legend: {
      type: "scroll",
      top: "69%",
      bottom: "0%",
      left: "center",
      orient: "vertical",
      textStyle: legendTextStyle,
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
      {
        type: "text",
        left: "center",
        top: "38%",
        style: { text: "Total Spend", textAlign: "center", fill: "#64748b", fontSize: centerTitleSize, fontWeight: 700 },
      },
      {
        type: "text",
        left: "center",
        top: "30%",
        style: { text: `$${Number(total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, textAlign: "center", fill: "#0f172a", fontSize: centerValueSize, fontWeight: 700 },
      },
    ],
  };

  if (loading) {
    return (
      <Card style={{ minHeight: 492, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </Card>
    );
  }

  return (
    <Card bodyStyle={{ padding: "8px 12px" }} style={{ minHeight: 520, boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", borderRadius: "8px", background: "#fff" }}>
      <Title level={5} style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>
        Service & Cloud Spend Breakdown
      </Title>

      <div ref={containerRef} style={{ width: "100%", height: isSmall ? 480 : isMedium ? 350 : 470 }}>
        {data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#64748b" }}>No service cost data available</div>
        ) : (
          <ReactECharts ref={chartRef} option={option} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
        )}
      </div>
    </Card>
  );
};

export default DonutChart;
