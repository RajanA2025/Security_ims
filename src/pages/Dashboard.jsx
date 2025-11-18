import React, { useEffect, useState } from "react";
import api from "../lib/api";
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderTop: `5px solid ${strokeColor}`,
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
        fontFamily: "'Roboto', 'Segoe UI', sans-serif",
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
  const API_URL = "http://47.130.218.97:8012/iam";
  const API_URL1 = "http://47.130.218.97:8012/security-groups";
  const storedAccountId = localStorage.getItem("account_ids");

  // useEffect(() => {
  //   const fetchAllData = async () => {
  //     setLoading(true);
  //     try {
  //       let storedAccountId = localStorage.getItem("account_ids");

  //       try {
  //         storedAccountId = JSON.parse(storedAccountId);
  //         if (Array.isArray(storedAccountId)) {
  //           storedAccountId = storedAccountId[0]; // take first ID
  //         }
  //       } catch {
  //         // keep as string
  //       }


  //       const [response1, response2] = await Promise.all([
  //         axios.get(API_URL),
  //         axios.get(API_URL1),
  //       ]);

  //       const normalizeId = (id) => String(id).trim().toLowerCase();
  //       const storedId = normalizeId(storedAccountId);

  //       if (response1?.data && Array.isArray(response1.data)) {
  //         const filteredData = response1.data.filter((item) => {
  //           const itemId =
  //             item.account_id || item.accountId || item.ACCOUNT_ID || item.Account_ID;
  //           return normalizeId(itemId) === storedId;
  //         });
  //         setData(filteredData);
  //       }

  //       if (response2?.data && Array.isArray(response2.data)) {
  //         const filtered2 = response2.data.filter((item) => {
  //           const itemId =
  //             item.account_id || item.accountId || item.ACCOUNT_ID || item.Account_ID;
  //           return normalizeId(itemId) === storedId;
  //         });
  //         setData1(filtered2);
  //       }

  //       setError(null);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setError("Failed to load data. Please try again later.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAllData();
  // }, [storedAccountId]);



  // Calculate statistics

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        let storedAccountId = localStorage.getItem("account_ids");

        try {
          storedAccountId = JSON.parse(storedAccountId);
        } catch {
          // keep as string
        }

        // ✅ Convert to array safely
        const storedIds = Array.isArray(storedAccountId)
          ? storedAccountId
          : [storedAccountId];

        const normalizeId = (id) => String(id).trim().toLowerCase();
        const normalizedIds = storedIds.map(normalizeId);


        // ✅ Fetch all API data
        const [response1, response2] = await Promise.all([
          api.get(API_URL),
          api.get(API_URL1),
        ]);

        // ✅ Filter response1
        if (response1?.data && Array.isArray(response1.data)) {
          const filteredData = response1.data.filter((item) => {
            const itemId =
              item.account_id ||
              item.accountId ||
              item.ACCOUNT_ID ||
              item.Account_ID;
            return normalizedIds.includes(normalizeId(itemId));
          });
          setData(filteredData);
        }

        // ✅ Filter response2
        if (response2?.data && Array.isArray(response2.data)) {
          const filtered2 = response2.data.filter((item) => {
            const itemId =
              item.account_id ||
              item.accountId ||
              item.ACCOUNT_ID ||
              item.Account_ID;
            return normalizedIds.includes(normalizeId(itemId));
          });
          setData1(filtered2);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [storedAccountId]);

  const calculateStats = () => {
    const total = data.length;
    const mfaEnabled = data.filter(item => item.mfa_enabled === true).length;
    const passwordEnabled = data.filter(item => item.password_created_on !== null || item.password_last_used !== null || item.password_age !== null).length;
    const adminUsers = data.filter(item => item.has_admin_access).length;
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
    <div className="p-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ padding: '10px', minHeight: '100vh' }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState key="loading" />
          ) : (
            <motion.div key="content">
              {/* IAM Insights Section */}
              <SectionTitle delay={0} >IAM Insights</SectionTitle>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  marginBottom: '48px'
                }}
              >
                <StatCard
                  icon={<SafetyCertificateOutlined />}
                  title="MFA Enabled"
                  tooltip="Enable Multi-Factor Authentication (MFA) for all IAM users to enhance account security."
                  percent={stats.iam.mfa.percent}
                  count={stats.iam.mfa.count}
                  total={stats.iam.mfa.total}
                  strokeColor={stats.iam.mfa.percent >= 75 ? "#ff4d4f" : stats.iam.mfa.percent > 50 ? "#fa8c16" : "#52c41a"}
                  index={0}
                />

                <StatCard
                  icon={<LockOutlined />}
                  title="Password Enabled"
                  tooltip="Enforce strong password policies for all IAM users to enhance account security."
                  percent={stats.iam.password.percent}
                  count={stats.iam.password.count}
                  total={stats.iam.password.total}
                  strokeColor={stats.iam.password.percent > 50 ? "#52c41a" : "#ff4d4f"}
                  index={1}
                />

                <StatCard
                  icon={<UserSwitchOutlined />}
                  title="Admin Access"
                  tooltip="Validate if each IAM user truly requires administrator access and remove unnecessary privileges."
                  percent={stats.iam.admin.percent}
                  count={stats.iam.admin.count}
                  total={stats.iam.admin.total}
                  strokeColor={stats.iam.admin.percent > 75 ? "#52c41a" : stats.iam.admin.percent > 50 ? "#fa8c16" : "#ff4d4f"}
                  index={2}
                />

                <StatCard
                  icon={<DesktopOutlined />}
                  title="Console Access"
                  tooltip="Review console access permissions and ensure they align with user responsibilities."
                  percent={stats.iam.console.percent}
                  count={stats.iam.console.count}
                  total={stats.iam.console.total}
                  strokeColor={stats.iam.console.percent > 75 ? "#52c41a" : stats.iam.console.percent > 50 ? "#fa8c16" : "#ff4d4f"}
                  index={3}
                />
              </motion.div>

              {/* Security Groups Section */}
              <SectionTitle delay={0.5}>Security Groups</SectionTitle>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px'
                }}
              >
                <StatCard
                  icon={<SecurityScanFilled />}
                  title="Orphaned Groups"
                  tooltip="Remove orphaned security groups that are not associated with any resources and are no longer needed."
                  percent={stats.security.orphaned.percent}
                  count={stats.security.orphaned.count}
                  total={stats.security.orphaned.total}
                  strokeColor={stats.security.orphaned.percent > 75 ? "#52c41a" : stats.security.orphaned.percent > 50 ? "#fa8c16" : "#ff4d4f"}
                  index={0}
                />

                <StatCard
                  icon={<SecuritySharp />}
                  title="Open SSH"
                  tooltip="Restrict open SSH access by limiting inbound traffic to trusted IP addresses only."
                  count={stats.security.ssh.count}
                  strokeColor="#ff4d4f"
                  index={1}
                  isNumeric={true}
                />

                <StatCard
                  icon={<SecuritySharp />}
                  title="Open RDP"
                  tooltip="Restrict RDP (port 3389) access to Windows instances by allowing only trusted IP addresses."
                  count={stats.security.rdp.count}
                  strokeColor="#fa8c16"
                  index={2}
                  isNumeric={true}
                />

                <StatCard
                  icon={<PortableWifiOffOutlined />}
                  title="All Traffic Open"
                  tooltip="Restrict 'All Traffic' rules in security groups to only trusted sources and required ports."
                  percent={stats.security.openIp.percent}
                  count={stats.security.openIp.count}
                  total={stats.security.openIp.total}
                  strokeColor={stats.security.openIp.percent < 75 ? "#52c41a" : stats.security.openIp.percent < 50 ? "#fa8c16" : "#ff4d4f"}
                  index={3}
                />
              </motion.div>
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
    </div>
  );
};

export default Insights;
