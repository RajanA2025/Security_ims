import React, { useState, useEffect, useMemo, useRef } from "react";
import { Table, Card, Tabs, Spin } from "antd";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import * as echarts from "echarts";

// 🔹 Resizable Chart Wrapper
const ResizableChart = ({ option, height = 300 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => chartRef.current?.getEchartsInstance().resize();
    window.addEventListener("resize", handleResize);
    const observer = new ResizeObserver(handleResize);
    if (chartRef.current?.ele) observer.observe(chartRef.current.ele);
    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <ReactECharts
      ref={chartRef}
      echarts={echarts}
      option={{ ...option, grid: { left: "10%", right: "10%", top: 30, bottom: "10%", containLabel: true } }}
      style={{ height, width: "100%" }}
    />
  );
};

// 🔹 Mini Sparkline Chart
const MiniChart = ({ data }) => {
  const options = {
    xAxis: { type: "category", data: data.map((_, i) => i + 1), show: false },
    yAxis: { type: "value", show: false },
    series: [{ data, type: "line", smooth: true, lineStyle: { width: 2 }, symbol: "none" }],
    grid: { top: 2, bottom: 2, left: 2, right: 2 },
    tooltip: { show: true },
  };
  return <ReactECharts echarts={echarts} option={options} style={{ height: 10, width: 100 }} />;
};

// 🔹 Table Columns
const columns = [
  { title: "Deep Dive", dataIndex: "name", key: "name", render: (_, record) => record.service || record.container || record.name },
  { title: "Cost ($)", dataIndex: "cost", key: "cost", render: (val) => (val ? `$${val.toFixed(2)}` : "-") },
  { title: "Instance ID", dataIndex: "instance_id", key: "instance_id", align: "center" },
  { title: "Instance Family", dataIndex: "instance_type", key: "instance_type", align: "center" },
  { title: "CPU", dataIndex: "cpu", key: "cpu", align: "center" },
  { title: "RAM GB", dataIndex: "ram", key: "ram", align: "center" },
  { title: "Volume Size GB", dataIndex: "volume_size", key: "volume_size", align: "center" },
  { title: "RunTime Graph", dataIndex: "runtimegraph", key: "runtimegraph", render: (val) => (val ? <MiniChart data={val} /> : "-") },
];

// 🔹 Aggregate recursive values
const aggregateValues = (row) => {
  if (!row.children?.length) {
    row.cpu = row.vcpu || 0;
    row.ram = row.ram || 0;
    row.volume_size = row.volume_size || 0;
    row.instance_id = 1;
    return row;
  }

  let totalCost = 0, totalCpu = 0, totalRam = 0, totalVolume = 0, totalInstances = 0;
  const families = new Set();

  row.children.forEach((child) => {
    const agg = aggregateValues(child);
    totalCost += agg.cost || 0;
    totalCpu += agg.cpu || 0;
    totalRam += agg.ram || 0;
    totalVolume += agg.volume_size || 0;
    totalInstances += agg.instance_id || 0;
    if (agg.instance_type) families.add(agg.instance_type);
  });

  row.cost = totalCost;
  row.cpu = totalCpu;
  row.ram = totalRam;
  row.volume_size = totalVolume;
  row.instance_id = totalInstances;
  row.instance_type = families.size > 1 ? "Mixed" : [...families][0] || "-";

  return row;
};

// 🔹 Filter by selected account recursively
const filterByAccount = (rows, accountId) => {
  if (!accountId) return rows;
  return rows
    .map((row) => {
      if (row.children?.length) {
        const filteredChildren = filterByAccount(row.children, accountId);
        return filteredChildren.length ? { ...row, children: filteredChildren } : null;
      } else return row.account_id === accountId ? row : null;
    })
    .filter(Boolean);
};

// 🔹 Compute chart data
const computeGraphData = (data) => {
  const topLevel = data?.[0]?.children?.[0]?.children || [];
  return { labels: topLevel.map((i) => i.name), costs: topLevel.map((i) => i.cost || 0) };
};

// 🔹 Main Component
export default function AntdNestedTable({ selectedAccount }) {
  const [activeTab, setActiveTab] = useState("environment");
  const [dataEnv, setDataEnv] = useState([]);
  const [dataService, setDataService] = useState([]);
  const [dataContainer, setDataContainer] = useState([]);
  const [loading, setLoading] = useState(true);

  const tableContainerRef = useRef(null);

  // Fetch & structure data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = selectedAccount
          ? `http://13.212.15.14:8002/instances?account_id=${selectedAccount}`
          : "http://13.212.15.14:8002/instances";

        const { data } = await axios.get(url);
        const results = data.results || [];

        const production = [], nonProduction = [], servicesMap = {}, containerMap = {};

        results.forEach((inst) => {
          const row = {
            key: `${inst.instance_id}-${inst.period}`,
            service: inst.instance_name,
            container: inst.container || "Unknown",
            cost: inst.cost,
            instance_id: inst.instance_id,
            account_id: inst.account_id,
            instance_type: inst.instance_type,
            vcpu: inst.vcpu,
            ram: inst.ram,
            volume_size: inst.volume_size,
            runtimegraph:
              inst.cpu_history?.slice(-5) ||
              Array.from({ length: 5 }, () => (inst.cpu_utilization ? inst.cpu_utilization * 100 : 0)),
          };

          const env = inst.environment?.toLowerCase().trim() || "unknown";
          (["production", "prod", "prd"].includes(env) ? production : nonProduction).push(row);
          (servicesMap[inst.instance_name] ||= []).push(row);
          (containerMap[inst.container || "Unknown"] ||= []).push(row);
        });

        const buildTree = (map) => [
          {
            key: "cloud",
            name: "Cloud",
            children: [
              {
                key: "AWS",
                name: "AWS/EC2",
                children: Object.entries(map).map(([name, rows], idx) => ({ key: `node-${idx}`, name, children: rows })),
              },
            ],
          },
        ];

        const structuredEnv = [
          {
            key: "cloud",
            name: "Cloud",
            children: [
              { key: "AWS", name: "AWS", children: [{ key: "prod", name: "Production", children: production }, { key: "nonprod", name: "Non-Production", children: nonProduction }] },
            ],
          },
        ];

        structuredEnv.forEach(aggregateValues);
        buildTree(servicesMap).forEach(aggregateValues);
        buildTree(containerMap).forEach(aggregateValues);

        setDataEnv(structuredEnv);
        setDataService(buildTree(servicesMap));
        setDataContainer(buildTree(containerMap));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedAccount]);

  // Scroll on expand
const handleExpand = (expanded, record) => {
  if (!expanded) return;

  // Wait for the DOM to update
  setTimeout(() => {
    const rowElement = document.querySelector(`[data-row-key='${record.key}']`);
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 50); // 50ms delay to allow child rows to render
};

  // Filtered data for table
  const filteredData = useMemo(() => {
    const data = activeTab === "environment" ? dataEnv : activeTab === "service" ? dataService : dataContainer;
    return filterByAccount(data, selectedAccount);
  }, [activeTab, dataEnv, dataService, dataContainer, selectedAccount]);

  // Chart options
  const { labels, costs } = useMemo(() => computeGraphData(filteredData), [filteredData]);
  const graphOptions = useMemo(
    () => ({
      xAxis: { type: "category", data: labels },
      yAxis: { type: "value", name: "Cost ($)" },
      series: [{ data: costs, type: "bar", color: "#1890ff" }],
      tooltip: { formatter: (p) => `$${p.value.toFixed(2)}` },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
    }),
    [labels, costs]
  );

  return (
    <div>
      <ResizableChart option={graphOptions} height={250} />
      <Card style={{ borderRadius: 8, marginTop: 20 ,boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    
        background: "#fff", }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="By Environment" key="environment" />
          <Tabs.TabPane tab="By Service" key="service" />
          <Tabs.TabPane tab="By Container" key="container" />
        </Tabs>

        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : (
          <div ref={tableContainerRef}>
            <Table
              key={selectedAccount || "all"}
              columns={columns}
              dataSource={filteredData}
              pagination={false}
              rowKey={(record) => record.key}
              expandable={{
                expandIconColumnIndex: 0,
                childrenColumnName: "children",
                onExpand: handleExpand,
              }}
              size="small"
              style={{ fontSize: 12 }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
