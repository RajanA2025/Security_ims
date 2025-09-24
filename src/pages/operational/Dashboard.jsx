import { Col, Row, Card, Typography, Tooltip } from 'antd'
import {
  BarChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DonutChart from '../../components/dashboard/donutchart'
import Chart from "../../components/dashboard/chart"
import HalfPieChart from "../../components/dashboard/halfpiechart"
import Linechart from "../../components/dashboard/linechart"
import axios from 'axios'
import { useObservability } from "../../Context/ObservabilityContext";
// Tooltip helper
const getTooltipText = (title) => {
  const tooltips = {
    "Total Instances": "Total number of EC2 instances being monitored across all regions and accounts.",
    "Healthy Instances": "Instances with CPU, Memory, and Disk usage below 60% threshold.",
    "Warning": "Instances with resource usage between 60-80% that require attention.",
    "Critical": "Instances with resource usage above 80% that need immediate attention."
  }
  return tooltips[title] || "Performance monitoring metric"
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  },
  hover: {
    y: -8, scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
}

const titleVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

// Animated Statistic Card Component
const AnimatedStatCard = ({ icon, title, value, color, index = 0 }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
  >
    <Card
      hoverable={false}
      style={{
        height: '100%',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <div style={{ textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
          style={{ marginBottom: '16px' }}
        >
          {React.cloneElement(icon, { style: { fontSize: 32, color: color } })}
        </motion.div>

        {/* Animated value */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 300 }}
          style={{ marginBottom: '16px' }}
        >
          <motion.h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              margin: '0',
              background: `linear-gradient(135deg, ${color}, #1890ff)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textAlign: 'center'
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: index * 0.2 }}
          >
            {value}
          </motion.h1>
        </motion.div>

        {/* Title with tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.4 }}
        >
          <div style={{
            fontWeight: "600",
            fontSize: '16px',
            color: '#666',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {title}
            <Tooltip placement="top" title={getTooltipText(title)}>
              <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
            </Tooltip>
          </div>
        </motion.div>
      </div>
    </Card>
  </motion.div>
)

// Section title
const SectionTitle = ({ children, delay = 0 }) => (
  <motion.div
    variants={titleVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
  >
    <Typography.Title
      level={4}
      style={{
        fontFamily: " Roboto, sans-serif",
        fontSize: "20px",
        fontWeight: 600,
        color: "#1a1a1a",
        margin: "0 0 24px 0",
        position: 'relative'
      }}
    >
      {children}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '60px' }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
        style={{
          height: '3px',
          backgroundColor: '#1890ff',
          borderRadius: '2px',
          marginTop: '8px'
        }}
      />
    </Typography.Title>
  </motion.div>
)

// Loading state
const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      flexDirection: 'column',
      gap: '16px'
    }}
  >
    <motion.div
      animate={{ rotate: 360, scale: [1, 1.2, 1] }}
      transition={{
        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
        scale: { duration: 1, repeat: Infinity }
      }}
      style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1890ff',
        borderRadius: '50%'
      }}
    />
    <motion.p
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Loading dashboard data...
    </motion.p>
  </motion.div>
)

function Dashboard() {
  const [performanceData, setPerformanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const { securityData,
    eipData,
    volumeData,
    s3Data,
    ec2Data, } = useObservability();
    const labelss = ['OrphanedkeyPair','OrphanedEIP', 'Volume', 'S3', 'EC2']
    const orphaned = securityData.filter(inst => inst.status =="Orphaned").length;

    const data = [
      orphaned,
      eipData?.length || 0,
      volumeData?.length || 0,
      s3Data?.length || 0,
      ec2Data?.length || 0,
    ];

    const runningCount = ec2Data.filter(inst => inst.state === "running").length;
    const stoppedCount = ec2Data.filter(inst => inst.state === "stopped").length;
  
    const labels1 = ["Running", "Stopped"];
    const data1 = [runningCount, stoppedCount];
    const labels2 = ec2Data.map((inst, index) => inst.instance_name || `Instance ${index + 1}`);
    const data2 = ec2Data.map(inst => inst.cpu_avg_7d || 0);
  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const apiUrl = 'http://13.212.15.14:8008/performance'
      const response = await axios.get(apiUrl, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      })
      const responseData = response.data.data || []

      if (responseData.length > 0) {
        const formattedData = responseData.map((item) => ({
          id: item.id,
          accountId: String(item.account_id).trim(),
          accountName: String(item.account_name).trim(),
          region: String(item.region).trim(),
          instanceId: String(item.instance_id).trim(),
          cpuUsage: Number(item.cpu_utilization).toFixed(2),
          memoryUsage: Number(item.memory_utilization).toFixed(2),
          diskUsage: Number(item.disk_utilization).toFixed(2),
        }))
        setPerformanceData(formattedData)
      }
    } catch (err) {
      console.error('Error fetching performance data:', err)
      // fallback mock data
      setPerformanceData([
        { id: 'mock-1', accountId: 'ACC-001', accountName: 'Production', region: 'us-east-1', instanceId: 'i-123', cpuUsage: '45.00', memoryUsage: '67.00', diskUsage: '23.00' },
        { id: 'mock-2', accountId: 'ACC-002', accountName: 'Development', region: 'us-west-2', instanceId: 'i-456', cpuUsage: '78.00', memoryUsage: '56.00', diskUsage: '89.00' },
        { id: 'mock-3', accountId: 'ACC-003', accountName: 'Testing', region: 'ap-south-1', instanceId: 'i-789', cpuUsage: '92.00', memoryUsage: '87.00', diskUsage: '76.00' }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPerformanceData() }, [])

  // Stats
  const totalInstances = performanceData.length
  const healthyInstances = performanceData.filter(d =>
    parseFloat(d.cpuUsage) < 60 &&
    parseFloat(d.memoryUsage) < 60 &&
    parseFloat(d.diskUsage) < 60
  ).length
  const warningInstances = performanceData.filter(d =>
    (parseFloat(d.cpuUsage) >= 60 && parseFloat(d.cpuUsage) < 80) ||
    (parseFloat(d.memoryUsage) >= 60 && parseFloat(d.memoryUsage) < 80) ||
    (parseFloat(d.diskUsage) >= 60 && parseFloat(d.diskUsage) < 80)
  ).length
  const criticalInstances = performanceData.filter(d =>
    parseFloat(d.cpuUsage) >= 80 ||
    parseFloat(d.memoryUsage) >= 80 ||
    parseFloat(d.diskUsage) >= 80
  ).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '10px', background: '#f8faff', minHeight: '100vh' }}
    >
      <SectionTitle delay={0}>Performance Overview</SectionTitle>

      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingState key="loading" />
        ) : (
          <motion.div key="content">
            {/* Top Animated Stat Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '48px'
              }}
            >
              <AnimatedStatCard icon={<BarChartOutlined />} title="Total Instances" value={totalInstances} color="#1890ff" index={0} />
              <AnimatedStatCard icon={<CheckCircleOutlined />} title="Healthy Instances" value={healthyInstances} color="#52c41a" index={1} />
              <AnimatedStatCard icon={<ExclamationCircleOutlined />} title="Warning" value={warningInstances} color="#faad14" index={2} />
              <AnimatedStatCard icon={<CloseCircleOutlined />} title="Critical" value={criticalInstances} color="#ff4d4f" index={3} />
            </motion.div>
            <SectionTitle delay={0.5}>Observability</SectionTitle>
            {/* Charts (no animation) */}
            <Row gutter={[16, 16]}>
              <Col md={15}>
                <Card style={{ borderRadius: '12px' }}>
                  <Chart labels={labelss} data={data} title="overall Observability" />
                </Card>
              </Col>
              <Col md={9}>
                <Card style={{ borderRadius: '12px' }}>
                <HalfPieChart labels={labels1} data={data1} />
                </Card>
              </Col>
              {/* <Col md={15}>
                <Card style={{ borderRadius: '12px' }}>
                <Linechart labels={labels2} data={data2}  title="EC2 CPU Avg (7 Days)" />
             
                </Card>
              </Col> */}
            </Row>
            <br/>
            <SectionTitle delay={0.5}>Snapshot</SectionTitle>

            <Row gutter={[16, 16]}>
              <Col md={9}>
                <Card style={{ borderRadius: '12px', padding:"10px" }}>
                  <DonutChart />
                </Card>
              </Col>
             
            </Row>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Dashboard
