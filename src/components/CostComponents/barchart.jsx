// File: src/components/BarChart.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import * as echarts from "echarts";
import dayjs from "dayjs";
import { Card, Typography, Select, Button, Modal } from "antd";
import { FaExpandArrowsAlt } from "react-icons/fa";
import { CostContext } from "../Context/CostContext.jsx";  // ⬅️ import context

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

  // 👇 get data from global context
  const { costData, loading, error } = useContext(CostContext);

  const initChart = (ref) => {
    if (!ref.current) return null;
    let chart = echarts.getInstanceByDom(ref.current);
    if (!chart) chart = echarts.init(ref.current);
    return chart;
  };

  const updateChart = async (ref) => {
    if (!costData || !costData.daily_service_costs) return;

    const apiData = costData.daily_service_costs;

    const grouped = {};
    const allServices = new Set();

    apiData.forEach((item) => {
      const date = item.usage_date;
      const service = item.service_name;
      const cost = item.total_cost || 0;

      if (!grouped[date]) grouped[date] = {};
      grouped[date][service] = cost;
      allServices.add(service);
    });

    const services = Array.from(allServices).sort();

    // assign stable colors
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
        bottom: "5%",
        orient: "horizontal",
        data: services,
        textStyle: { fontSize: 8, fontWeight: 600, color: "#333" },
        padding: [5, 100, 0, 100],
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
      })),
    };

    const chart = initChart(ref);
    chart?.setOption(option);
    chart?.resize();
    return chart;
  };

  // Update main chart when data/range changes
  useEffect(() => {
    if (!loading && costData) {
      (async () => {
        chartInstanceRef.current = await updateChart(chartRef);
      })();
    }

    const resizeObserver = new ResizeObserver(() => {
      chartInstanceRef.current?.resize();
      modalChartInstanceRef.current?.resize();
    });

    if (chartRef.current) resizeObserver.observe(chartRef.current);

    return () => resizeObserver.disconnect();
  }, [range, costData, loading]);

  // Update modal chart
  useEffect(() => {
    if (showModal && costData) {
      (async () => {
        modalChartInstanceRef.current = await updateChart(modalChartRef);
      })();
    } else {
      modalChartInstanceRef.current?.dispose?.();
    }
  }, [showModal, range, costData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <>
      <Card
        style={{
          width: "100%",
          minHeight: 300,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
          borderRadius: "8px",
        }}
        bodyStyle={{ padding: "0" }}
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
          <Title level={5} style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>
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

            <Button
              size="small"
              type="default"
              onClick={() => setShowModal(true)}
              icon={<FaExpandArrowsAlt />}
            />
          </div>
        </div>

        {/* Chart */}
        <div
          ref={chartRef}
          style={{
            flexGrow: 1,
            width: "100%",
            minHeight: 465,
          }}
        />
      </Card>

      {/* Modal Fullscreen */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width="95%"
        style={{ top: 20 }}
        bodyStyle={{ height: "80vh", padding: 0 }}
        destroyOnClose
      >
        <div ref={modalChartRef} style={{ width: "100%", height: "100%" }} />
      </Modal>
    </>
  );
};

export default BarChart;
