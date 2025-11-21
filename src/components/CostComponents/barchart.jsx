// File: src/components/BarChart.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";
import { Card, Typography, Select, Button, Modal, Spin } from "antd";
import { FaExpandArrowsAlt } from "react-icons/fa";
import { CostContext } from "../../Context/CostContext";

const { Title } = Typography;
const { Option } = Select;

const getDays = (range) => {
  if (range === "3M") return 90;
  if (range === "6M") return 180;
  if (range === "YTD") return dayjs().diff(dayjs().startOf("year"), "day") + 1;
  return 30;
};

let serviceColors = {};

const BarChart = () => {
  const chartRef = useRef(null);
  const modalChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const modalChartInstanceRef = useRef(null);

  const [range, setRange] = useState("3M");
  const [showModal, setShowModal] = useState(false);

  const { costData, loading, error } = useContext(CostContext);

  // ✅ Initialize ECharts for sharp rendering
  const initChart = (ref) => {
    if (!ref.current) return null;
    echarts.dispose(ref.current); // Clear previous instance
    const chart = echarts.init(ref.current, null, {
      devicePixelRatio: window.devicePixelRatio || 2,
      renderer: "canvas",
    });
    return chart;
  };

  const updateChart = (ref) => {
    if (!costData || !costData.daily_service_costs) return;

    const apiData = costData.daily_service_costs;
    const grouped = {};
    const allServices = new Set();

    apiData.forEach(({ usage_date, service_name, total_cost }) => {
      if (!grouped[usage_date]) grouped[usage_date] = {};
      grouped[usage_date][service_name] = total_cost || 0;
      allServices.add(service_name);
    });

    const services = Array.from(allServices).sort();
    services.forEach((service) => {
      if (!serviceColors[service]) {
        serviceColors[service] =
          "#" + Math.floor(Math.random() * 16777215).toString(16);
      }
    });

    const days = getDays(range);
    const today = dayjs();
    const dates = Array.from({ length: days }, (_, i) =>
      today.subtract(i, "day").format("YYYY-MM-DD")
    ).reverse();

    const normalizedData = dates.map((date) => {
      const entry = { date };
      services.forEach((service) => {
        entry[service] = grouped[date]?.[service] ?? 0;
      });
      return entry;
    });

    const option = {
      backgroundColor: "#fff",
      tooltip: {
        trigger: "item",
        axisPointer: { type: "shadow" },
        textStyle: { fontSize: 10, fontWeight: 500, color: "#333" },
      },
      legend: {
        type: "scroll",
        bottom: "2%",
        orient: "horizontal",
        data: services,
        textStyle: {
          fontSize: 9,
          fontWeight: 600,
          color: "#333",
        },
        padding: [5, 70, 0, 70],
      },
      grid: {
        top: "15%",
        left: "5%",
        right: "3%",
        bottom: "12%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        name: "Months",
        nameLocation: "middle",
        nameGap: 35,
        nameTextStyle: {
          padding: 15,
          color: "rgba(0, 0, 0, 0.9)",
          fontWeight: 600,
          fontSize: 14,
          fontFamily: "Roboto, sans-serif",
        },
        data: dates,
        axisLabel: {
          color: "rgba(0, 0, 0, 0.7)",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "Roboto, sans-serif",
          rotate: 45,
          hideOverlap: true,
          formatter: (v) => dayjs(v).format("MMM D"),
        },
      },
      yAxis: {
        type: "value",
        name: "USD ($)",
        nameTextStyle: {
          color: "rgba(0, 0, 0, 0.9)",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "Roboto, sans-serif",
        },
        axisLabel: {
          color: "rgba(0, 0, 0, 0.7)",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "Roboto, sans-serif",
          formatter: (val) => `$${val}`,
        },
      },
      dataZoom: [
        { type: "slider", start: 80, end: 100, top: "0%" },
        { type: "inside", start: 80, end: 100 },
      ],
      series: services.map((service) => ({
        name: service,
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" },
        itemStyle: { color: serviceColors[service] },
        data: normalizedData.map((d) => d[service]),
        barWidth: "60%",
      })),
    };

    const chart = initChart(ref);
    chart.setOption(option);
    chart.resize();
    return chart;
  };

useEffect(() => {
  if (!loading && costData) {
    chartInstanceRef.current = updateChart(chartRef);
  }

  // Window resize
  const resizeHandler = () => {
    chartInstanceRef.current?.resize();
    modalChartInstanceRef.current?.resize();
  };
  window.addEventListener("resize", resizeHandler);

  // ⭐ Observe container resize (sidebar expand)
  let resizeObserver = new ResizeObserver(() => {
    chartInstanceRef.current?.resize();
  });

  if (chartRef.current) {
    resizeObserver.observe(chartRef.current.parentElement);
  }

  return () => {
    window.removeEventListener("resize", resizeHandler);
    resizeObserver.disconnect();
  };
}, [range, costData, loading]);


  if (loading) return <Spin tip="Loading..." />;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <>
      {/* Main Card */}
      <Card
        style={{
          width: "100%",
          minHeight: 520,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
          borderRadius: "8px",
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "8px 12px",
          }}
        >
          <Title level={5} style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
            Daily Cost
          </Title>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ paddingRight: "10px" }}>
              <Select
                value={range}
                onChange={(v) => setRange(v)}
                size="middle"
                style={{ width: 150, height: 28 }}
                dropdownRender={(menu) => (
                  <div style={{ textAlign: "center", fontSize: "14px" }}>
                    {menu}
                  </div>
                )}
              >
                <Option value="3M">Last 3 Months</Option>
                <Option value="6M">Last 6 Months</Option>
                <Option value="YTD">Year to Date</Option>
              </Select>
            </div>

            <Button
              size="small"
              type="default"
              onClick={() => setShowModal(true)}
              icon={<FaExpandArrowsAlt />}
              style={{
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </div>
        </div>

        {/* Chart */}
        <div
          ref={chartRef}
          style={{
            flexGrow: 1,
            width: "100%",
            minHeight: 460,
            imageRendering: "pixelated",
            transform: "none",
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width="95%"
        style={{ top:20, transform: "none" }}
        styles={{ body: { height: "85vh", padding: 0 } }}
        destroyOnClose
        afterOpenChange={(open) => {
          if (open && costData) {
            requestAnimationFrame(() => {
              modalChartInstanceRef.current = updateChart(modalChartRef);
              modalChartInstanceRef.current?.resize();
            });
          } else {
            modalChartInstanceRef.current?.dispose?.();
          }
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "8px 40px 10px 0px ",
          }}
        >
          <Title level={5} style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
            Daily Cost
          </Title>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Select
              value={range}
              onChange={(v) => setRange(v)}
              size="small"
              style={{ width: 140 }}
            >
              <Option value="3M">Last 3 Months</Option>
              <Option value="6M">Last 6 Months</Option>
              <Option value="YTD">Year to Date</Option>
            </Select>
          </div>
        </div>

        <div
          ref={modalChartRef}
          style={{
            width: "100%",
            height: "95%",
            imageRendering: "pixelated",
            transform: "none",
          }}
        />
      </Modal>
    </>
  );
};

export default BarChart;



