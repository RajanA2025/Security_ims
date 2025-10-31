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

  // Initialize or get ECharts instance
  const initChart = (ref) => {
    if (!ref.current) return null;
    let chart = echarts.getInstanceByDom(ref.current);
    if (!chart) chart = echarts.init(ref.current);
    return chart;
  };

  // Update chart with latest data
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

    // Assign stable colors
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
        textStyle: { fontSize: 8, fontWeight: 600, color: "#333", fontFamily: " Roboto, sans-serif", },
        padding: [5, 70, 0, 70],
      },
      grid: { top: "15%", left: "5%", right: "3%", bottom: "12%", containLabel: true },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          rotate: 45,
          hideOverlap: true,
          fontSize: 12,
          formatter: (v) => dayjs(v).format("MMM D"),
        },
      },
      yAxis: {
        type: "value",
        name: "USD ($)",
        axisLabel: { fontSize: 12, formatter: (val) => `$${val}` },
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
        cursor: "default", // 👈 this removes the hand cursor
      })),
    };

    const chart = initChart(ref);
    chart?.setOption(option);
    chart?.resize();
    return chart;
  };

  // Main chart update
  useEffect(() => {
    if (!loading && costData) chartInstanceRef.current = updateChart(chartRef);

    const resizeObserver = new ResizeObserver(() => {
      chartInstanceRef.current?.resize();
      modalChartInstanceRef.current?.resize();
    });

    if (chartRef.current) resizeObserver.observe(chartRef.current);
    return () => resizeObserver.disconnect();
  }, [range, costData, loading]);

  if (loading) return <Spin tip="Loading..." />;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <>
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
        styles={{ body: { padding: 0 } }} // v5 fix
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


          <div style={{ display: "flex", alignItems: "center", }}>
            {/* Scaled Select */}
            <div
              style={{
                display: "flex",              // flex container
                justifyContent: "center",     // horizontal centering
                alignItems: "center",         // vertical centering
                transform: "scale(0.7)",      // scale the Select
                transformOrigin: "center right",  // keep it aligned to top-left
                paddingRight: "10px",        // space from the button
              }}
            >              <Select
              value={range}
              onChange={(v) => setRange(v)}
              size="small"
              style={{ width: 150, height: 24, textAlign: "center" }}
              dropdownRender={(menu) => (
                <div style={{ textAlign: "center", fontSize: "10px" }}>
                  {menu}
                </div>
              )}
            >
                <Option value="3M" style={{ textAlign: "center", fontSize: "8px" }}>Last 3 Months</Option>
                <Option value="6M" style={{ textAlign: "center", fontSize: "8px" }}>Last 6 Months</Option>
                <Option value="YTD" style={{ textAlign: "center", fontSize: "8px" }}>Year to Date</Option>
              </Select>
            </div>

            {/* Button */}
            <Button
              size="small"
              type="default"
              onClick={() => setShowModal(true)}
              icon={<FaExpandArrowsAlt />}
              style={{ height: 19, display: "flex", alignItems: "center", justifyContent: "center" }}
            />
          </div>



        </div>

        {/* Chart */}
        <div
          ref={chartRef}
          style={{ flexGrow: 1, width: "100%", minHeight: 475 }}
        />
      </Card>

      {/* Modal Fullscreen */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width="95%"
        style={{ top: 20 }}
        styles={{ body: { height: "80vh", padding: 0 } }}
        destroyOnHidden
        afterOpenChange={(open) => {
          if (open && costData) {
            setTimeout(() => {
              modalChartInstanceRef.current = updateChart(modalChartRef);
              modalChartInstanceRef.current?.resize();
            }, 50); // ensures modal DOM is visible
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

        <div ref={modalChartRef} style={{ width: "100%", height: "100%" }} />
      </Modal>
    </>
  );
};

export default BarChart;
