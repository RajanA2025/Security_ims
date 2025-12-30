import { Col, Row, Card, Typography, Tooltip } from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DonutChart from "../../components/dashboard/donutchart";
import Chart from "../../components/dashboard/chart";
import HalfPieChart from "../../components/dashboard/halfpiechart";
import api from "../../lib/api";
import { useObservability } from "../../Context/ObservabilityContext";
import axios from "axios";

const { Title } = Typography;

// Tooltip text
const getTooltipText = (title) => {
  const tooltips = {
    "Total Instances":
      "Total number of EC2 instances being monitored across all regions and accounts.",
    "Healthy Instances":
      "Instances with CPU, Memory, and Disk usage below 60% threshold.",
    Warning:
      "Instances with resource usage between 60-80% that require attention.",
    Critical:
      "Instances with resource usage above 80% that need immediate attention.",
  };
  return tooltips[title] || "Performance monitoring metric";
};
// get jwt_token from localStorage
const jwt_token = localStorage.getItem("jwt_token");

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const SectionTitle = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.6 }}
  >
    <Title
      level={4}
      style={{
        fontSize: "18px",
        fontWeight: 600,
        color: "#0f172a",
        margin: "0 0 0px 0",
      }}
    >
      {children}
    </Title>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "60px" }}
      transition={{ delay: delay + 0.3, duration: 0.8 }}
      style={{
        height: "3px",
        backgroundColor: "#0284c7",
        borderRadius: "2px",
        margin: "5px 0px 10px 0px",
      }}
    />
  </motion.div>
);

const AnimatedStatCard = ({ icon, title, value, color, index = 0 }) => (
  <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
    <Card
      hoverable={false}
      style={{
        borderRadius: "10px",
        border: "none",
        background: "#fff",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        height: "100%",
        borderTop: `4px solid ${color}`,
      }}
      bodyStyle={{ padding: "20px" }}
    >
      <div style={{ textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          style={{ marginBottom: "12px" }}
        >
          {React.cloneElement(icon, { style: { fontSize: 36, color: color } })}
        </motion.div>

        <motion.h1
          style={{
            fontSize: "38px",
            fontWeight: "700",
            margin: "0",
            background: `linear-gradient(135deg, ${color}, #0284c7)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          {value}
        </motion.h1>

        <div
          style={{
            fontWeight: 600,
            fontSize: "15px",
            color: "#334155",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
          }}
        >
          {title}
          <Tooltip placement="top" title={getTooltipText(title)}>
            <InfoCircleOutlined style={{ color: "#0284c7", cursor: "pointer" }} />
          </Tooltip>
        </div>
      </div>
    </Card>
  </motion.div>
);

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        width: "40px",
        height: "40px",
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #0284c7",
        borderRadius: "50%",
      }}
    />
    <motion.p
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ color: "#475569" }}
    >
      Loading dashboard data...
    </motion.p>
  </motion.div>
);

function Dashboard() {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Defensive defaults: useObservability might return undefined keys
  const {
    securityData = [],
    eipData = [],
    volumeData = [],
    s3Data = [],
    ec2Data = [],
  } = useObservability() || {};

  // Robust fetch + parsing
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);

      // Read raw value from localStorage safely
      let raw = null;
      try {
        raw = localStorage.getItem("account_ids");
      } catch (err) {
        console.error("localStorage unavailable:", err);
        raw = null;
      }

      // Normalize to string, then try to parse JSON, CSV or single value
      let storedAccountIds = [];
      if (raw == null) {
        storedAccountIds = [];
      } else {
        const s = String(raw).trim();

        if (s === "" || s.toLowerCase() === "null") {
          storedAccountIds = [];
        } else {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
              storedAccountIds = parsed.map((v) => String(v ?? "").trim()).filter(Boolean);
            } else if (typeof parsed === "string" || typeof parsed === "number") {
              storedAccountIds = [String(parsed).trim()].filter(Boolean);
            } else {
              storedAccountIds = [];
            }
          } catch {
            // not JSON
            if (s.includes(",")) {
              storedAccountIds = s.split(",").map((v) => v.trim()).filter(Boolean);
            } else {
              storedAccountIds = [s];
            }
          }
        }
      }

      if (!Array.isArray(storedAccountIds)) storedAccountIds = [];

      const postBody = { account_ids: storedAccountIds };
      console.log("➡️ POST Body:", postBody);

      const resp = await axios.post(
        "http://47.130.218.97:8005/performance/filter",
        postBody,
        {
          headers: { "Content-Type": "application/json",
            Authorization: `Bearer ${jwt_token}`
           },
        }
      );

      const payload = resp?.data ?? {};
      const rows = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];

      // map safely to numeric fields (keep numbers)
      const result = rows.map((item = {}) => {
        const cpuRaw = Number(item.cpu_utilization ?? item.cpu ?? 0);
        const memRaw = Number(item.memory_utilization ?? item.memory ?? 0);
        const diskRaw = Number(item.disk_utilization ?? item.disk ?? 0);

        return {
          id: item.id ?? String(Math.random()).slice(2),
          accountId: String(item.account_id ?? item.accountId ?? "").trim(),
          cpuUsage: Number.isFinite(cpuRaw) ? cpuRaw : 0,
          memoryUsage: Number.isFinite(memRaw) ? memRaw : 0,
          diskUsage: Number.isFinite(diskRaw) ? diskRaw : 0,
        };
      });

      setPerformanceData(result);
    } catch (err) {
      console.error("❌ Error fetching performance data:", err);
      setPerformanceData([]); // fail-safe
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Counts now operate on numbers (safe)
  const totalInstances = performanceData.length;
  const healthyInstances = performanceData.filter(
    (d) => d.cpuUsage < 60 && d.memoryUsage < 60 && d.diskUsage < 60
  ).length;
  const warningInstances = performanceData.filter(
    (d) =>
      (d.cpuUsage >= 60 && d.cpuUsage < 80) ||
      (d.memoryUsage >= 60 && d.memoryUsage < 80) ||
      (d.diskUsage >= 60 && d.diskUsage < 80)
  ).length;
  const criticalInstances = performanceData.filter(
    (d) => d.cpuUsage >= 80 || d.memoryUsage >= 80 || d.diskUsage >= 80
  ).length;

  // Observability counts: use defaults above to avoid crashes
  const orphaned = (securityData || []).filter((inst) => String(inst?.status) === "Orphaned").length;
  const data = [
    orphaned,
    (eipData && eipData.length) || 0,
    (volumeData && volumeData.length) || 0,
    (s3Data && s3Data.length) || 0,
    (ec2Data && ec2Data.length) || 0,
  ];
  const labels = ["Orphaned KeyPair", "Orphaned EIP", "Volume", "S3", "EC2"];

  const runningCount = (ec2Data || []).filter((inst) => inst?.state === "running").length;
  const stoppedCount = (ec2Data || []).filter((inst) => inst?.state === "stopped").length;
  const labels1 = ["Running", "Stopped"];
  const data1 = [runningCount, stoppedCount];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: "24px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <SectionTitle>Performance Overview</SectionTitle>

      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingState key="loading" />
        ) : (
          <motion.div key="content">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "40px",
              }}
            >
              <AnimatedStatCard
                icon={<BarChartOutlined />}
                title="Total Instances"
                value={totalInstances}
                color="#0284c7"
                index={0}
              />
              <AnimatedStatCard
                icon={<CheckCircleOutlined />}
                title="Healthy Instances"
                value={healthyInstances}
                color="#22c55e"
                index={1}
              />
              <AnimatedStatCard
                icon={<ExclamationCircleOutlined />}
                title="Warning"
                value={warningInstances}
                color="#facc15"
                index={2}
              />
              <AnimatedStatCard
                icon={<CloseCircleOutlined />}
                title="Critical"
                value={criticalInstances}
                color="#ef4444"
                index={3}
              />
            </div>

            <SectionTitle delay={0.4}>Observability</SectionTitle>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={15} lg={15} xl={15}>
                <Card
                  bodyStyle={{ padding: 0 }}
                  style={{
                    borderRadius: "10px",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                    background: "#fff",
                  }}
                >
                  <Chart labels={labels} data={data} title="Overall Observability" />
                </Card>
              </Col>

              <Col xs={24} sm={24} md={9} lg={9} xl={9}>
                <Card
                  bodyStyle={{ padding: 0 }}
                  style={{
                    borderRadius: "10px",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                    background: "#fff",
                  }}
                >
                  <HalfPieChart labels={labels1} data={data1} />
                </Card>
              </Col>
            </Row>

            <br />
            <SectionTitle delay={0.6}>Snapshot</SectionTitle>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={9}>
                <Card
                  bodyStyle={{ padding: 0 }}
                  style={{
                    borderRadius: "10px",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                    background: "#fff",
                  }}
                >
                  <DonutChart />
                </Card>
              </Col>
            </Row>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Dashboard;
