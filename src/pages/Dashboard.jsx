import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Progress,
  Tooltip,
  Typography,
  Spin,
  Alert
} from "antd";
import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserSwitchOutlined,
  DesktopOutlined,
  InfoCircleOutlined,
  SecurityScanFilled,
} from "@ant-design/icons";
import { PortableWifiOffOutlined, SecuritySharp } from "@mui/icons-material";

const { Title } = Typography;

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
};

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
};

const progressVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: "easeOut" },
      opacity: { duration: 0.5 }
    }
  }
};

const titleVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Custom animated progress component
const AnimatedProgress = ({ percent, strokeColor, delay = 0 }) => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ 
      delay,
      type: "spring",
      stiffness: 200,
      damping: 15
    }}
  >
    <Progress 
      type="circle" 
      percent={percent} 
      strokeColor={strokeColor}
      trailColor="#f0f0f0"
      strokeWidth={8}
      size={80}
    />
  </motion.div>
);

// Reusable StatCard component
const StatCard = ({ 
  icon, 
  title, 
  tooltip, 
  percent, 
  count, 
  total, 
  strokeColor,
  index = 0,
  isNumeric = false
}) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    className="stat-card"
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
            style: { fontSize: 32, color: strokeColor || "#1890ff" }
          })}
        </motion.div>

        {isNumeric ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: index * 0.1 + 0.3,
              type: "spring",
              stiffness: 300
            }}
          >
            <motion.h1 
              style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                margin: '16px 0',
                background: `linear-gradient(135deg, ${strokeColor}, #1890ff)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {count}
            </motion.h1>
          </motion.div>
        ) : (
          <AnimatedProgress 
            percent={percent} 
            strokeColor={strokeColor}
            delay={index * 0.1 + 0.2}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          style={{ marginTop: '16px' }}
        >
          <div style={{ 
            fontWeight: "600", 
            fontSize: '16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {title}
            <Tooltip placement="top" title={tooltip}>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </div>
          
          {!isNumeric && (
            <motion.span 
              style={{ color: "#666", fontSize: '14px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              {count}/{total} {title.includes('Security') ? 'Groups' : 'Users'}
            </motion.span>
          )}
        </motion.div>
      </div>
    </Card>
  </motion.div>
);

// Section title component
const SectionTitle = ({ children, delay = 0 }) => (
  <motion.div
    variants={titleVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
  >
    <Title 
      level={3}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "24px",
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
    </Title>
  </motion.div>
);

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
      height: '400px',
      flexDirection: 'column',
      gap: '16px'
    }}
  >
    <Spin size="large" />
    <motion.p
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Loading security insights...
    </motion.p>
  </motion.div>
);

const Insights = () => {
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://13.212.15.14:8012/iam";
  const API_URL1 = "http://13.212.15.14:8012/security-groups";

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [response1, response2] = await Promise.all([
          axios.get(API_URL),
          axios.get(API_URL1)
        ]);
        
        setData(response1.data);
        setData1(response2.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const total = data.length;
    const mfaEnabled = data.filter(item => item.mfa_status === "Enabled").length;
    const passwordEnabled = data.filter(item => item.password_enabled).length;
    const adminUsers = data.filter(item => item.is_admin).length;
    const consoleUsers = data.filter(item => item.console_access).length;

    const total1 = data1.length;
    const sshCount = data1.filter(item => item.from_port == 22).length;
    const rdpCount = data1.filter(item => item.from_port == 3389).length;
    const orphanedCount = data1.filter(item => item.is_orphaned).length;
    const openIpCount = data1.filter(item => item.ip_range === "0.0.0.0/0").length;

    return {
      iam: {
        mfa: { count: mfaEnabled, total, percent: Math.round((mfaEnabled / total) * 100) || 0 },
        password: { count: passwordEnabled, total, percent: Math.round((passwordEnabled / total) * 100) || 0 },
        admin: { count: adminUsers, total, percent: Math.round((adminUsers / total) * 100) || 0 },
        console: { count: consoleUsers, total, percent: Math.round((consoleUsers / total) * 100) || 0 }
      },
      security: {
        orphaned: { count: orphanedCount, total: total1, percent: Math.round((orphanedCount / total1) * 100) || 0 },
        ssh: { count: sshCount },
        rdp: { count: rdpCount },
        openIp: { count: openIpCount, total: total1, percent: Math.round((openIpCount / total1) * 100) || 0 }
      }
    };
  };

  const stats = calculateStats();

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </motion.div>
    );
  }

  return (
    <>
           <Typography.Title 
  level={4}
  style={{
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    fontSize: "20px",
    fontWeight: 500,
    color: "black",
    margin: 0
  }}
>
IAM Insights
</Typography.Title>
    
<hr/>
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center",boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", }}>
         
            <Flex vertical align="center" gap="small">
              <SafetyCertificateOutlined style={{ fontSize: 28, color: "#1890ff" }} />
              {/* <Progress type="circle" percent={mfaPercent} strokeColor={mfaPercent > 50 ? "#52c41a" : "#ff4d4f"} /> */}
              <Progress
  type="circle"
  percent={mfaPercent}
  strokeColor={
    mfaPercent >= 75
      ? "red"
      : mfaPercent > 50
      ? "orange"
      : "green"
  }
/>
              <span style={{ fontWeight: "bold" }}>MFA Enabled <Tooltip placement="rightBottom" title="Enable Multi-Factor Authentication (MFA) for all IAM users to enhance account security.">
    <InfoCircleOutlined
    
    />
  </Tooltip>
  </span>
              <span style={{ color: "#888" }}>{mfaTrueCount}/{total} Users</span>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center",boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", }}>
            <Flex vertical align="center" gap="small">
              <LockOutlined style={{ fontSize: 28, color: "#722ed1" }} />
              <Progress type="circle" percent={passwordPercent} strokeColor={passwordPercent > 50 ? "#52c41a" : "#ff4d4f"} />
              <span style={{ fontWeight: "bold" }}>Password Enabled <Tooltip placement="rightBottom" title="Enforce strong password policies for all IAM users to enhance account security.">
    <InfoCircleOutlined
     
    />
  </Tooltip></span>
              <span style={{ color: "#888" }}>{passwordEnabledCount}/{total} Users</span>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center",boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", }}>
            <Flex vertical align="center" gap="small">
              <UserSwitchOutlined style={{ fontSize: 28, color: "#722ed1" }} />
              <Progress type="circle" percent={adminPercent} strokeColor={adminPercent > 75 ? "#52c41a" : adminPercent > 50 ? "#fa8c16" : "#ff4d4f"} />
              <span style={{ fontWeight: "bold" }}>Is Admin <Tooltip placement="rightBottom" title="Validate if each IAM user truly requires administrator access and remove unnecessary privileges.">
    <InfoCircleOutlined
     
    />
  </Tooltip></span>
              <span style={{ color: "#888" }}>{AdminEnabledCount}/{total} Users</span>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center",boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", }}>
            <Flex vertical align="center" gap="small">
              <DesktopOutlined style={{ fontSize: 28, color: "#722ed1" }} />
              <Progress type="circle" percent={consolePercent} strokeColor={consolePercent > 75 ? "#52c41a" : consolePercent > 50 ? "#fa8c16" : "#ff4d4f"} />
              <span style={{ fontWeight: "bold" }}>Console  <Tooltip placement="rightBottom" title="Validate if each IAM user truly requires administrator access and remove unnecessary privileges.">
    <InfoCircleOutlined
     
    />
  </Tooltip></span>
              <span style={{ color: "#888" }}>{ConsoleEnabledCount}/{total} Users</span>
            </Flex>
          </Card>
        </Col>
      </Row>

      <br />

      <Typography.Title 
  level={4}
  style={{
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    fontSize: "20px",
    fontWeight: 500,
    color: "black",
    margin: 0
  }}
>
Security Group
</Typography.Title>
<hr/>
{/* Stats Cards */}
<Row gutter={[16, 16]}>
 

  <Col xs={24} sm={12} md={6}>
    <Card hoverable style={{ textAlign: "center",boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", }} >
      <Flex vertical align="center" gap="small">
        <SecurityScanFilled style={{ fontSize: 28, color: "#722ed1" }} />
        <Progress type="circle" percent={OrphanedPercent} strokeColor={OrphanedPercent > 75 ? "#52c41a" : OrphanedPercent > 50 ? "#fa8c16" : "#ff4d4f"} />
        <span style={{ fontWeight: "bold" }}>Is Orphaned  &nbsp;
         <Tooltip placement="rightBottom" title="Remove orphaned security groups that are not associated with any resources and are no longer needed.">
<InfoCircleOutlined

/>
</Tooltip>
        </span>
        <span style={{ color: "#888" }}>{OrphanedEnabledCount}/{total1} Security Groups</span>
      </Flex>
    </Card>
  </Col>
  <Col xs={24} sm={12} md={6}>
    <Card hoverable style={{ textAlign: "center",boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", }}>
      <Flex vertical align="center" gap="small">
        <SecuritySharp style={{ fontSize: 28, color: "#1890ff" }} />
        {/* <Progress type="circle" percent={mfaPercent} strokeColor={mfaPercent > 50 ? "#52c41a" : "#ff4d4f"} /> */}
        <h1 className="m-5" style={{ fontWeight: "bold", padding:"8% 5% "}}>{sshCount}</h1>
        <Tooltip placement="rightBottom" title="Restrict open SSH access by limiting inbound traffic to trusted IP addresses only.">
<InfoCircleOutlined

/>
</Tooltip>
        <span style={{ fontWeight: "bold" ,color: "#888" }}>Open SSH</span>
        {/* <span style={{ color: "#888" }}>{mfaTrueCount}/{total} Users</span> */}
        {/* <span style={{ color: "#888" }}> 5</span> */}
      </Flex>
    </Card>
  </Col>
  <Col xs={24} sm={12} md={6}>
    <Card hoverable style={{ textAlign: "center",boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", }}>
      <Flex vertical align="center" gap="small">
        <SecuritySharp style={{ fontSize: 28, color: "#1890ff" }} />
        {/* <Progress type="circle" percent={mfaPercent} strokeColor={mfaPercent > 50 ? "#52c41a" : "#ff4d4f"} /> */}
        <h1 className="m-5" style={{ fontWeight: "bold", padding:"8% 5% "}}>{RDPCount}</h1>
        <Tooltip placement="rightBottom" title="Restrict RDP (port 3389) access to Windows instances by allowing only trusted IP addresses">
<InfoCircleOutlined

/>
</Tooltip>
        <span style={{ fontWeight: "bold",color: "#888"  }}>Open RDP</span>
        {/* <span style={{ color: "#888" }}>{mfaTrueCount}/{total} Users</span> */}
        {/* <span style={{ color: "#888" }}> 5</span> */}
      </Flex>
    </Card>
  </Col>

  <Col xs={24} sm={12} md={6}>
    <Card hoverable style={{ textAlign: "center",boxShadow: "0px 2px 6px rgba(0,0,0,0.2)", }}>
      <Flex vertical align="center" gap="small">
        <PortableWifiOffOutlined style={{ fontSize: 28, color: "#722ed1" }} />
        <Progress type="circle" percent={IpPercent} strokeColor={IpPercent < 75 ? "#52c41a" : IpPercent < 50 ? "#fa8c16" : "#ff4d4f"} />
        <span style={{ fontWeight: "bold" }}>All Traffic  &nbsp;
        <Tooltip placement="rightBottom" title="Restrict “All Traffic” rules in security groups to only trusted sources and required ports.">
<InfoCircleOutlined

/>
</Tooltip>
        </span>
        <span style={{ color: "#888" }}>{IpEnabledCount}/{total1} Open Port</span>
      </Flex>
    </Card>
  </Col>
 
</Row>


      
     
    </>
  );
};

export default Insights;
