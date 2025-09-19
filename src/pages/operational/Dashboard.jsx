import { Col, Row, Card, Space, Typography, Statistic, Tooltip } from 'antd'
import CpuAvg from '../../components/cpuavg';
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
import Graph from "../../components/dashboard/graphchart"
import axios from 'axios'
// import ResourceBarChart from '../../components/dashboard/resourceBarChart'
// Add this function before the Dashboard component
const getTooltipText = (title) => {
  const tooltips = {
    "Total Instances": "Total number of EC2 instances being monitored across all regions and accounts.",
    "Healthy Instances": "Instances with CPU, Memory, and Disk usage below 60% threshold.",
    "Warning": "Instances with resource usage between 60-80% that require attention.",
    "Critical": "Instances with resource usage above 80% that need immediate attention."
  }
  return tooltips[title] || "Performance monitoring metric"
}
// const [resourceCounts, setResourceCounts] = useState({
//   keyPairs: 0,
//   elasticIPs: 0,
//   volumes: 0,
// });
//testing code 
// const fetchResourceCounts = async () => {
//   try {
//     const [keyPairRes, eipRes, volRes] = await Promise.all([
//       axios.get("http://13.212.15.14:8016/keypairs2"),
//       axios.get("http://13.212.15.14:8016/orphaned-eip"),
//       axios.get("http://13.212.15.14:8016/orphaned-volumes"),
//     ]);

//     setResourceCounts({
//       keyPairs: keyPairRes.data.filter(item => item.status === "Disabled").length, // orphaned count
//       elasticIPs: eipRes.data.length,
//       volumes: volRes.data.length,
//     });
//   } catch (err) {
//     console.error("Error fetching resource counts:", err);
//     // fallback mock
//     setResourceCounts({
//       keyPairs: 2,
//       elasticIPs: 5,
//       volumes: 3,

//     });
//   }
// };//test code end 

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

const titleVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

// Animated Statistic Card Component
const AnimatedStatCard = ({
  icon,
  title,
  value,
  color,
  index = 0,
  loading = false
}) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
  // className="stat-card"
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
          transition={{
            delay: index * 0.1,
            type: "spring",
            stiffness: 200
          }}
          style={{ marginBottom: '16px' }}
        >
          {React.cloneElement(icon, {
            style: { fontSize: 32, color: color }
          })}
        </motion.div>

        {/* Custom animated value display */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: index * 0.1 + 0.3,
            type: "spring",
            stiffness: 300
          }}
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
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: index * 0.2
            }}
          >
            {value}
          </motion.h1>
        </motion.div>

        {/* Title */}
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

// Section title component
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
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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

// Loading component
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
      animate={{
        rotate: 360,
        scale: [1, 1.2, 1]
      }}
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
  const [resourceCounts, setResourceCounts] = useState({
    keyPairs: 0,
    elasticIPs: 0,
    volumes: 0,
  });
  const fetchResourceCounts = async () => {
    try {
      const [keyPairRes, eipRes, volRes] = await Promise.all([
        axios.get("http://13.212.15.14:8016/keypairs2"),
        axios.get("http://13.212.15.14:8016/orphaned-eip"),
        axios.get("http://13.212.15.14:8016/orphaned-volumes"),
      ]);

      setResourceCounts({
        keyPairs: keyPairRes.data.filter(item => item.status === "Disabled").length, // orphaned count
        elasticIPs: eipRes.data.length,
        volumes: volRes.data.length,
      });
    } catch (err) {
      console.error("Error fetching resource counts:", err);
      // fallback mock
      setResourceCounts({
        keyPairs: 2,
        elasticIPs: 5,
        volumes: 3,

      });
    }
  };
  useEffect(() => {
    fetchPerformanceData()
    fetchResourceCounts()
  }, [])
  // Fetch performance data for statistics
  const fetchPerformanceData = async () => {
    try {
      setLoading(true)

      const apiUrl = 'http://13.212.15.14:8008/performance'
      const response = await axios({
        method: 'get',
        url: apiUrl,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })

      const responseData = response.data.data || []

      if (responseData && responseData.length > 0) {
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

      // Mock data for testing when API fails
      const mockData = [
        {
          id: 'mock-1',
          accountId: 'ACC-001',
          accountName: 'Production Account',
          region: 'us-east-1',
          instanceId: 'i-1234567890abcdef0',
          cpuUsage: '45.00',
          memoryUsage: '67.00',
          diskUsage: '23.00'
        },
        {
          id: 'mock-2',
          accountId: 'ACC-002',
          accountName: 'Development Account',
          region: 'us-west-2',
          instanceId: 'i-0987654321fedcba0',
          cpuUsage: '78.00',
          memoryUsage: '56.00',
          diskUsage: '89.00'
        },
        {
          id: 'mock-3',
          accountId: 'ACC-003',
          accountName: 'Testing Account',
          region: 'ap-south-1',
          instanceId: 'i-fedcba0987654321',
          cpuUsage: '92.00',
          memoryUsage: '87.00',
          diskUsage: '76.00'
        }
      ]

      setPerformanceData(mockData)

    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchPerformanceData()
  }, [])

  // Calculate statistics
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
            {/* Performance Statistics Cards */}
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
              <AnimatedStatCard
                icon={<BarChartOutlined />}
                title="Total Instances"
                value={totalInstances}
                color="#1890ff"
                index={0}
              />

              <AnimatedStatCard
                icon={<CheckCircleOutlined />}
                title="Healthy Instances"
                value={healthyInstances}
                color="#52c41a"
                index={1}
              />

              <AnimatedStatCard
                icon={<ExclamationCircleOutlined />}
                title="Warning"
                value={warningInstances}
                color="#faad14"
                index={2}
              />

              <AnimatedStatCard
                icon={<CloseCircleOutlined />}
                title="Critical"
                value={criticalInstances}
                color="#ff4d4f"
                index={3}
              />
            </motion.div>

            {/* Original Dashboard Content */}
            <SectionTitle delay={0.5}>Snapshot </SectionTitle>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Row gutter={[16, 16]}>
                <Col md={9}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card style={{ borderRadius: '12px' }}>
                      <DonutChart />
                    </Card>
                  </motion.div>
                </Col>
                <Col md={15}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card style={{ borderRadius: '12px' }}>
                      <Chart />
                    </Card>
                  </motion.div>
                </Col>
              </Row>
            </motion.div>
            {/* <SectionTitle delay={1}>Resource Overview</SectionTitle>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <ResourceBarChart data={resourceCounts} />
            </motion.div> */}


          </motion.div>

        )}
      </AnimatePresence>

      <style jsx>{`
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
        }
        
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default Dashboard
