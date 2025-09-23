// File: AntdNestedTable.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Table, Card, Tabs, Spin } from "antd";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

// 🔹 Resizable wrapper for ECharts
const ResizableChart = ({ option, height = 300 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };

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
      option={{
        ...option,
        grid: { left: "10%", right: "10%", top: 30, bottom: "10%", containLabel: true },
      }}
      style={{ height, width: "100%" }}
    />

  );
};

// Mini Chart (sparkline)
const MiniChart = ({ data }) => {
  const options = {
    xAxis: { type: "category", data: data.map((_, i) => i + 1), show: false },
    yAxis: { type: "value", show: false },
    series: [
      {
        data,
        type: "line",
        smooth: true,
        lineStyle: { width: 2 },
        symbol: "none",
      },
    ],
    grid: { top: 2, bottom: 2, left: 2, right: 2 },
    tooltip: { show: true },
  };
  return (
    <ReactECharts
      echarts={echarts}
      option={options}
      style={{ height: 10, width: 100 }}
    />
  );
};

// Table Columns
const columns = [
  {
    title: "Deep Dive",
    dataIndex: "name",
    key: "name",
    render: (text, record) => record.service || record.container || text,
  },
  {
    title: "Cost ($)",
    dataIndex: "cost",
    key: "cost",
    render: (val) => (val ? `$${val.toFixed(2)}` : "-"),
  },
  { title: "Instance ID", dataIndex: "instance_id", key: "instance_id", align: "center" },
  { title: "Instance Family", dataIndex: "instance_type", key: "instance_type", align: "center" },
  { title: "CPU %", dataIndex: "cpu", key: "cpu", align: "center" },
  { title: "RAM GB", dataIndex: "ram", key: "ram", align: "center" },
  { title: "Volume Size GB", dataIndex: "volume_size", key: "volume_size", align: "center" },
  {
    title: "RunTime Graph",
    dataIndex: "runtimegraph",
    key: "runtimegraph",
    render: (val) => (val ? <MiniChart data={val} /> : "-"),
  },
];

// Recursive aggregation
const aggregateValues = (row) => {
  if (row.service || row.container) {
    row.cpu = row.vcpu || 0;
    row.ram = row.ram || 0;
    row.volume_size = row.volume_size || 0;
    row.instance_id = 1;
    return row;
  }

  let totalCost = 0,
    totalCpu = 0,
    totalRam = 0,
    totalVolume = 0,
    totalInstances = 0;
  const families = new Set();

  if (row.children && row.children.length) {
    row.children.forEach((child) => {
      const aggChild = aggregateValues(child);
      totalCost += aggChild.cost || 0;
      totalCpu += aggChild.cpu || 0;
      totalRam += aggChild.ram || 0;
      totalVolume += aggChild.volume_size || 0;
      totalInstances += aggChild.instance_id || 0;
      if (aggChild.instance_type) families.add(aggChild.instance_type);
    });
  }

  row.cost = totalCost;
  row.cpu = totalCpu;
  row.ram = totalRam;
  row.volume_size = totalVolume;
  row.instance_id = totalInstances;
  row.instance_type = families.size > 1 ? "Mixed" : [...families][0] || "-";

  return row;
};

// Compute graph
const computeGraphData = (data) => {
  if (!data || data.length === 0) return { labels: [], costs: [] };
  const topLevel = data[0].children?.[0]?.children || [];
  const labels = topLevel.map((item) => item.name);
  const costs = topLevel.map((item) => item.cost || 0);
  return { labels, costs };
};

export default function AntdNestedTable() {
  const [activeTab, setActiveTab] = useState("environment");
  const [dataEnv, setDataEnv] = useState([]);
  const [dataService, setDataService] = useState([]);
  const [dataContainer, setDataContainer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://13.212.15.14:8002/instances")
      .then((res) => res.json())
      .then((res) => {
        const production = [];
        const nonProduction = [];
        const servicesMap = {};
        const containerMap = {};

        const allInstances = res.results;

        allInstances.forEach((inst) => {
          const instanceData = {
            key: inst.instance_id + "-" + inst.period,
            service: inst.instance_name,
            container: inst.container || "Unknown",
            cost: inst.cost,
            instance_id: inst.instance_id,
            instance_type: inst.instance_type,
            vcpu: inst.vcpu,
            ram: inst.ram,
            volume_size: inst.volume_size,
            runtimegraph:
              inst.cpu_history?.slice(-5) ||
              Array.from({ length: 5 }, () =>
                inst.cpu_utilization ? inst.cpu_utilization * 100 : 0
              ),
          };

          const env = inst.environment?.toLowerCase().trim() || "unknown";
          if (["production", "prod", "prd"].includes(env)) production.push(instanceData);
          else nonProduction.push(instanceData);

          if (!servicesMap[inst.instance_name]) servicesMap[inst.instance_name] = [];
          servicesMap[inst.instance_name].push(instanceData);

          const containerName = inst.container || "Unknown";
          if (!containerMap[containerName]) containerMap[containerName] = [];
          containerMap[containerName].push(instanceData);
        });

        const structuredEnv = [
          {
            key: "cloud",
            name: "Cloud",
            children: [
              {
                key: "AWS",
                name: "AWS",
                children: [
                  { key: "prod", name: "Production", children: production },
                  { key: "nonprod", name: "Non-Production", children: nonProduction },
                ],
              },
            ],
          },
        ];

        const structuredService = [
          {
            key: "cloud",
            name: "Cloud",
            children: [
              {
                key: "AWS",
                name: "AWS",
                children: Object.entries(servicesMap).map(([serviceName, instances], idx) => ({
                  key: `service-${idx}`,
                  name: serviceName,
                  children: instances,
                })),
              },
            ],
          },
        ];

        const structuredContainer = [
          {
            key: "cloud",
            name: "Cloud",
            children: [
              {
                key: "AWS",
                name: "AWS",
                children: Object.entries(containerMap).map(([containerName, instances], idx) => ({
                  key: `container-${idx}`,
                  name: containerName,
                  children: instances,
                })),
              },
            ],
          },
        ];

        structuredEnv.forEach((row) => aggregateValues(row));
        structuredService.forEach((row) => aggregateValues(row));
        structuredContainer.forEach((row) => aggregateValues(row));

        setDataEnv(structuredEnv);
        setDataService(structuredService);
        setDataContainer(structuredContainer);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const { labels, costs } = useMemo(() => {
    if (activeTab === "environment") return computeGraphData(dataEnv);
    if (activeTab === "service") return computeGraphData(dataService);
    return computeGraphData(dataContainer);
  }, [activeTab, dataEnv, dataService, dataContainer]);

  const graphOptions = {
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value", name: "Cost ($)" },
    series: [{ data: costs, type: "bar", color: "#1890ff" }],
    tooltip: { show: true, formatter: (params) => `$${params.value.toFixed(2)}` },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <ResizableChart option={graphOptions} height={250} />
      </div>
      <Card style={{ borderRadius: 8 }}>
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
          <Table
            columns={columns}
            dataSource={
              activeTab === "environment"
                ? dataEnv
                : activeTab === "service"
                  ? dataService
                  : dataContainer
            }
            pagination={false}
            bordered
            rowKey={(record) => record.key}
            expandable={{
              expandIconColumnIndex: 0,
              onExpand: (expanded, record) => {
                if (expanded) {
                  // Wait for the child row to render
                  setTimeout(() => {
                    const rowElement = document.getElementById(`row-${record.key}`);
                    if (rowElement) {
                      rowElement.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }, 100); // 100ms delay usually enough
                }
              },
            }}

            onRow={(record) => ({ id: `row-${record.key}` })}
            size="small"
            style={{ fontSize: 12 }}
          />
        )}
      </Card>
    </div>
  );
}
