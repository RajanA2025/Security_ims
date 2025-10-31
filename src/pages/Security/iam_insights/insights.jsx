import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Modal,
  Descriptions,
  List,
  Tooltip,
  Row,
  Col,
  Card,
  Input,
  Progress,
  Select,
  Flex,
  Typography,
  Divider,
  Badge,
} from "antd";
import { motion } from "framer-motion";

import {
  EyeOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserSwitchOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  DesktopOutlined,
  KeyOutlined,
  SecurityScanOutlined,
  CalendarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import axios from "axios";

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
      width={80}
    />
  </motion.div>
);

const header = {
  backgroundColor: "#4f46e5",
  color: "white"
};

const Insights = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [selectedData1, setSelectedData1] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const API_URL = "http://13.212.15.14:8012/iam";
  const { Option } = Select;
  const accountIds = [...new Set(data.map(item => item.account_id))];

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedPolicyData, setSelectedPolicyData] = useState(null);
  const [isPolicyDetailModalOpen, setIsPolicyDetailModalOpen] = useState(false);
  const [selectedPolicyDetail, setSelectedPolicyDetail] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let storedAccountId = localStorage.getItem("account_ids");

      try {
        storedAccountId = JSON.parse(storedAccountId);
        if (Array.isArray(storedAccountId)) {
          storedAccountId = storedAccountId[0]; // take first ID
        }
      } catch {
        // keep as string
      }

        // const response = await axios.get(API_URL);
        // setData(response.data);
        // setFilteredData(response.data);
         const [response1] = await Promise.all([
        axios.get(API_URL),
     
      ]);

      const normalizeId = (id) => String(id).trim().toLowerCase();
      const storedId = normalizeId(storedAccountId);

      if (response1?.data && Array.isArray(response1.data)) {
        const filteredData = response1.data.filter((item) => {
          const itemId =
            item.account_id || item.accountId || item.ACCOUNT_ID || item.Account_ID;
          return normalizeId(itemId) === storedId;
        });
        console.log("Filtered dataaaaaaaaaaaaa:", filteredData);
        setData(filteredData);
        setFilteredData(filteredData);
      }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'null') return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Helper function to get password age color
  const getPasswordAgeColor = (age) => {
    if (age == null) return "default";
    if (age > 90) return "red";
    if (age > 60) return "orange";
    if (age > 30) return "gold";
    return "green";
  };

  // Helper function to get password enabled status
  const getPasswordEnabledStatus = (data) => {
    return data.password_created_on !== null || data.password_last_used !== null || data.password_age !== null;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    handleFilters(value, selectedAccountId);
  };

  const handleAccountChange = (value) => {
    setSelectedAccountId(value);
    handleFilters(searchText, value);
  };

  const handleFilters = (searchValue, accountValue) => {
    let filtered = data;

    if (accountValue) {
      filtered = filtered.filter(item => item.account_id === accountValue);
    }

    if (searchValue.trim() !== "") {
      filtered = filtered.filter(item =>
        item.user_name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  // Open modal functions
  const handleOpenModal = (record) => {
    setSelectedData(record);
    setIsModalOpen(true);
  };

  const handleOpenModal1 = (record) => {
    setSelectedData1(record);
    setIsModalOpen1(true);
  };

  const handleOpenPolicyModal = (record) => {
    setSelectedPolicyData(record);
    setIsPolicyModalOpen(true);
  };

  // Stats calculations
  const total = filteredData.length;
  const mfaTrueCount = filteredData.filter(
    (item) => item.mfa_enabled === true
  ).length;
  const passwordEnabledCount = filteredData.filter(
    (item) => getPasswordEnabledStatus(item)
  ).length;
  const AdminEnabledCount = filteredData.filter((item) => item.has_admin_access).length;
  const ConsoleEnabledCount = filteredData.filter((item) => item.console_access).length;

  const mfaPercent = total ? Math.round((mfaTrueCount / total) * 100) : 0;
  const passwordPercent = total ? Math.round((passwordEnabledCount / total) * 100) : 0;
  const adminPercent = total ? Math.round((AdminEnabledCount / total) * 100) : 0;
  const consolePercent = total ? Math.round((ConsoleEnabledCount / total) * 100) : 0;

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "user_name",
      key: "name",
      width: 50
    },
    {
      title: (
        <span>
          MFA Status{' '}
          <Tooltip title="Indicates whether Multi-Factor Authentication is enabled.">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "mfa_enabled",
      key: "mfa_enabled",
      width: 100,
      render: (value) => (
        <Tag color={value ? "green" : "red"}>{value ? "true" : "false"}</Tag>
      )
    },
    {
      title: (
        <span>
          Password Enabled{' '}
          <Tooltip title="Indicates whether password authentication is enabled.">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "password_enabled",
      key: "password_enabled",
      width: 120,
      render: (value, record) => {
        const isEnabled = getPasswordEnabledStatus(record);
        return (
          <Tag color={isEnabled ? "green" : "red"}>{isEnabled ? "True" : "False"}</Tag>
        );
      }
    },
    {
      title: "Password Age",
      dataIndex: "password_age",
      key: "password_age",
      width: 100,
      render: (value) => {
        if (value == null) {
          return '-';
        }
        let color = "#52c41a";
        let blink = false;

        if (value > 90) {
          color = "#ff4d4f";
          blink = true;
        } else if (value > 60) {
          color = "#fa8c16";
        } else if (value > 30) {
          color = "#faad14";
        }

        return (
          <span
            style={{
              color,
              fontWeight: "bold",
              animation: blink ? "blink 1s infinite" : "none"
            }}
          >
            {value} days
          </span>
        );
      }
    },
    {
      title: (
        <span>
          Access Key Age{' '}
          <Tooltip title="Shows the age of access keys in days.">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "access_key_age",
      key: "access_key_age",
      width: 150,
      render: (_, record) => {
        const key1 = record.access_key_1_age ?? "-";
        const key2 = record.access_key_2_age ?? "-";

        const renderAge = (value) => {
          if (value === "-") return "-";

          let color = "#52c41a";
          let blink = false;

          if (value > 90) {
            color = "#ff4d4f";
            blink = true;
          } else if (value > 60) {
            color = "#fa8c16";
          } else if (value > 30) {
            color = "#faad14";
          }

          return (
            <span
              style={{
                color,
                fontWeight: "bold",
                animation: blink ? "blink 1s infinite" : "none",
                marginRight: 8
              }}
            >
              {value} days
            </span>
          );
        };

        return (
          <span>
            {renderAge(key1)} / {renderAge(key2)}
          </span>
        );
      },
    },
    {
      title: (
        <span>
          Admin{' '}
          <Tooltip title="Indicates whether user has administrator access.">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "has_admin_access",
      key: "has_admin_access",
      width: 80,
      render: (value) => (
        <Tag color={value ? "orange" : "green"}>{value ? "True" : "False"}</Tag>
      )
    },
    {
      title: "Access Key",
      key: "access_key",
      width: 80,
      render: (_, record) => (
        <Tooltip title="View Access Key Details">
          <KeyOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenModal1(record)}
          />
        </Tooltip>
      )
    },
    {
      title: "Policy",
      key: "policy",
      width: 100,
      render: (_, record) => (
        <Tooltip title="View Policies">
          <EyeOutlined
            style={{ fontSize: 18, color: "#722ed1", cursor: "pointer" }}
            onClick={() => handleOpenPolicyModal(record)}
          />
        </Tooltip>
      )
    },
    {
      title: "More Details",
      key: "more_details",
      width: 100,
      render: (_, record) => (
        <Tooltip title="View Complete Details">
          <EyeOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenModal(record)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <>
  <Row gutter={[16, 16]} style={{ marginBottom: 5 }}>
  <Col md={16}>

<Typography.Title 
  level={4}
  style={{
    fontFamily: "'Roboto', 'Segoe UI', sans-serif",
    fontSize: "20px",
    fontWeight: 500,
    color: "black",
    margin: 0
  }}
>
IAM Insights
</Typography.Title>
  </Col>
  <Col md={4} >
    <Select
      placeholder="Filter by Account ID"
      style={{ width: "100%" }}
      allowClear
      value={selectedAccountId}
      onChange={handleAccountChange}
    >
      {accountIds.map((id) => (
        <Option key={id} value={id}>
          {id}
        </Option>
      ))}
    </Select>
  </Col>
  <Col md={4}>
    <Input
      placeholder="Search by Name"
      prefix={<SearchOutlined />}
      value={searchText}
      onChange={handleSearch}
      allowClear
    />
  </Col>
</Row>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="stats-container"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
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
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                    style={{ marginBottom: '16px' }}
                  >
                    {React.cloneElement(<SafetyCertificateOutlined />, { 
                      style: { 
                        fontSize: 32, 
                        color: mfaPercent >= 75 ? "#ff4d4f" : mfaPercent > 50 ? "#fa8c16" : "#52c41a" 
                      } 
                    })}
                  </motion.div>
                  
                  <AnimatedProgress 
                    percent={mfaPercent} 
                    strokeColor={mfaPercent >= 75 ? "#ff4d4f" : mfaPercent > 50 ? "#fa8c16" : "#52c41a"}
                    delay={0.2}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ marginTop: '16px' }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      MFA Enabled
                      <Tooltip placement="top" title="Enable Multi-Factor Authentication (MFA) for all IAM users to enhance account security.">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </div>
                    <motion.span 
                      style={{ color: "#666", fontSize: '14px' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {mfaTrueCount}/{total} Users
                    </motion.span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
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
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200
                    }}
                    style={{ marginBottom: '16px' }}
                  >
                    {React.cloneElement(<LockOutlined />, { 
                      style: { 
                        fontSize: 32, 
                        color: passwordPercent > 50 ? "#52c41a" : "#ff4d4f" 
                      } 
                    })}
                  </motion.div>
                  
                  <AnimatedProgress 
                    percent={passwordPercent} 
                    strokeColor={passwordPercent > 50 ? "#52c41a" : "#ff4d4f"}
                    delay={0.3}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ marginTop: '16px' }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      Password Enabled
                      <Tooltip placement="top" title="Enforce strong password policies for all IAM users to enhance account security.">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </div>
                    <motion.span 
                      style={{ color: "#666", fontSize: '14px' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {passwordEnabledCount}/{total} Users
                    </motion.span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
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
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                    style={{ marginBottom: '16px' }}
                  >
                    {React.cloneElement(<UserSwitchOutlined />, { 
                      style: { 
                        fontSize: 32, 
                        color: adminPercent > 75 ? "#52c41a" : adminPercent > 50 ? "#fa8c16" : "#ff4d4f" 
                      } 
                    })}
                  </motion.div>
                  
                  <AnimatedProgress 
                    percent={adminPercent} 
                    strokeColor={adminPercent > 75 ? "#ff4d4f" : adminPercent > 50 ? "#fa8c16" : "#52c41a"}
                    delay={0.4}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ marginTop: '16px' }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      Admin Access
                      <Tooltip placement="top" title="Validate if each IAM user truly requires administrator access and remove unnecessary privileges.">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </div>
                    <motion.span 
                      style={{ color: "#666", fontSize: '14px' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {AdminEnabledCount}/{total} Users
                    </motion.span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
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
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.4,
                      type: "spring",
                      stiffness: 200
                    }}
                    style={{ marginBottom: '16px' }}
                  >
                    {React.cloneElement(<DesktopOutlined />, { 
                      style: { 
                        fontSize: 32, 
                        color: consolePercent > 75 ? "#52c41a" : consolePercent > 50 ? "#fa8c16" : "#ff4d4f" 
                      } 
                    })}
                  </motion.div>
                  
                  <AnimatedProgress 
                    percent={consolePercent} 
                    strokeColor={consolePercent > 75 ? "#52c41a" : consolePercent > 50 ? "#fa8c16" : "#ff4d4f"}
                    delay={0.5}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    style={{ marginTop: '16px' }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      Console Access
                      <Tooltip placement="top" title="Review console access permissions for security compliance.">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </div>
                    <motion.span 
                      style={{ color: "#666", fontSize: '14px' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      {ConsoleEnabledCount}/{total} Users
                    </motion.span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      <br />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="user_name"
        pagination={{ pageSize: 8 }}
      />

      {/* Enhanced More Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserSwitchOutlined style={{ color: '#4f46e5' }} />
            {`${selectedData?.user_name || ""} - Comprehensive Details`}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        {selectedData && (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Basic Information Card */}
            <Card 
              size="small" 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <InfoCircleOutlined />
                  Basic Information
                </div>
              } 
              style={{ marginBottom: 16 }} 
              headStyle={header}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Account ID">
                      <Badge count={selectedData.account_id} style={{ backgroundColor: '#52c41a' }} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Account Name">
                      <strong>{selectedData.account_name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="ARN">
                      <code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 4px', wordBreak: 'break-all' }}>
                        {selectedData.arn}
                      </code>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="User Created On">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CalendarOutlined />
                        {formatDate(selectedData.user_created_on)}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Console Access">
                      <Tag color={selectedData.console_access ? "green" : "red"} icon={<DesktopOutlined />}>
                        {selectedData.console_access ? "Enabled" : "Disabled"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Admin Access">
                      <Tag color={selectedData.has_admin_access ? "orange" : "green"} icon={<SecurityScanOutlined />}>
                        {selectedData.has_admin_access ? "Admin User" : "Regular User"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Security Information Card */}
            <Card 
              size="small" 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SafetyCertificateOutlined />
                  Security & Authentication
                </div>
              }
              style={{ marginBottom: 16 }} 
              headStyle={header}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="MFA Status">
                      <Tag 
                        color={selectedData.mfa_enabled ? "green" : "red"}
                        icon={<SafetyCertificateOutlined />}
                      >
                        {selectedData.mfa_enabled ? "Enabled" : "Disabled"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Password Enabled">
                      <Tag 
                        color={getPasswordEnabledStatus(selectedData) ? "green" : "red"}
                        icon={<LockOutlined />}
                      >
                        {getPasswordEnabledStatus(selectedData) ? "Yes" : "No"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={8}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Password Age">
                      {selectedData.password_age != null ? (
                        <Badge 
                          count={`${selectedData.password_age} days`}
                          style={{ 
                            backgroundColor: getPasswordAgeColor(selectedData.password_age) === 'red' ? '#ff4d4f' :
                                           getPasswordAgeColor(selectedData.password_age) === 'orange' ? '#fa8c16' :
                                           getPasswordAgeColor(selectedData.password_age) === 'gold' ? '#faad14' : '#52c41a'
                          }}
                        />
                      ) : (
                        <Tag color="default">Not Set</Tag>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Password Created">
                      {formatDate(selectedData.password_created_on)}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={8}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Password Last Used">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CalendarOutlined />
                        {formatDate(selectedData.password_last_used)}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Access Keys Information Card */}
            <Card 
              size="small" 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyOutlined />
                  Access Keys Information
                </div>
              }
              style={{ marginBottom: 16 }} 
              headStyle={header}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card 
                    size="small" 
                    title="Access Key 1" 
                    type="inner" 
                    style={{ height: '100%' }}
                  >
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Key ID">
                        {selectedData.access_key_1_id ? (
                          <code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 4px' }}>
                            {selectedData.access_key_1_id}
                          </code>
                        ) : (
                          <Tag color="default">Not Available</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        {selectedData.access_key_1_status ? (
                          <Tag color={selectedData.access_key_1_status === 'Active' ? 'green' : 'red'}>
                            {selectedData.access_key_1_status}
                          </Tag>
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created On">
                        {formatDate(selectedData.access_key_1_created)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Age">
                        {selectedData.access_key_1_age ? (
                          <Badge 
                            count={`${selectedData.access_key_1_age} days`}
                            style={{ backgroundColor: selectedData.access_key_1_age > 90 ? '#ff4d4f' : '#52c41a' }}
                          />
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Used">
                        {formatDate(selectedData.access_key_1_last_used)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Service">
                        {selectedData.access_key_1_last_service && selectedData.access_key_1_last_service !== 'N/A' ? (
                          <Tag color="blue" icon={<GlobalOutlined />}>
                            {selectedData.access_key_1_last_service}
                          </Tag>
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Region">
                        {selectedData.access_key_1_last_region && selectedData.access_key_1_last_region !== 'N/A' ? (
                          <Tag color="purple">
                            {selectedData.access_key_1_last_region}
                          </Tag>
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card 
                    size="small" 
                    title="Access Key 2" 
                    type="inner" 
                    style={{ height: '100%' }}
                  >
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Key ID">
                        {selectedData.access_key_2_id ? (
                          <code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 4px' }}>
                            {selectedData.access_key_2_id}
                          </code>
                        ) : (
                          <Tag color="default">Not Available</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        {selectedData.access_key_2_status ? (
                          <Tag color={selectedData.access_key_2_status === 'Active' ? 'green' : 'red'}>
                            {selectedData.access_key_2_status}
                          </Tag>
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created On">
                        {formatDate(selectedData.access_key_2_created)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Age">
                        {selectedData.access_key_2_age ? (
                          <Badge 
                            count={`${selectedData.access_key_2_age} days`}
                            style={{ backgroundColor: selectedData.access_key_2_age > 90 ? '#ff4d4f' : '#52c41a' }}
                          />
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Used">
                        {formatDate(selectedData.access_key_2_last_used)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Service">
                        {selectedData.access_key_2_last_service && selectedData.access_key_2_last_service !== 'N/A' ? (
                          <Tag color="blue" icon={<GlobalOutlined />}>
                            {selectedData.access_key_2_last_service}
                          </Tag>
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Region">
                        {selectedData.access_key_2_last_region && selectedData.access_key_2_last_region !== 'N/A' ? (
                          <Tag color="purple">
                            {selectedData.access_key_2_last_region}
                          </Tag>
                        ) : (
                          <Tag color="default">N/A</Tag>
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Policies Summary Card */}
            <Card 
              size="small" 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SecurityScanOutlined />
                  Policies Summary
                </div>
              }
              style={{ marginBottom: 16 }} 
              headStyle={header}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card size="small" title="Inline Policies" type="inner">
                    <div style={{ textAlign: 'center' }}>
                      <Badge 
                        count={selectedData.inline_policies?.length || 0}
                        style={{ backgroundColor: '#722ed1' }}
                      />
                      <div style={{ marginTop: '8px', color: '#666' }}>
                        {selectedData.inline_policies?.length === 0 ? 'No inline policies' : 'Click Policy tab to view'}
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" title="Group Policies" type="inner">
                    <div style={{ textAlign: 'center' }}>
                      <Badge 
                        count={selectedData.group_policies?.length || 0}
                        style={{ backgroundColor: '#fa8c16' }}
                      />
                      <div style={{ marginTop: '8px', color: '#666' }}>
                        {selectedData.group_policies?.length === 0 ? 'No group policies' : 'Click Policy tab to view'}
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" title="Managed Policies" type="inner">
                    <div style={{ textAlign: 'center' }}>
                      <Badge 
                        count={selectedData.managed_policies?.length || 0}
                        style={{ backgroundColor: '#52c41a' }}
                      />
                      <div style={{ marginTop: '8px', color: '#666' }}>
                        {selectedData.managed_policies?.length === 0 ? 'No managed policies' : 'Click Policy tab to view'}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Groups Information Card */}
            {selectedData.groups && selectedData.groups.length > 0 && (
              <Card 
                size="small" 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserSwitchOutlined />
                    User Groups
                  </div>
                }
                style={{ marginBottom: 16 }} 
                headStyle={header}
              >
                <List
                  size="small"
                  dataSource={selectedData.groups}
                  renderItem={(group, index) => (
                    <List.Item>
                      <Tag color="blue" style={{ marginRight: '8px' }}>
                        {index + 1}
                      </Tag>
                      {group}
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Access Key Modal */}
      <Modal
        title={`${selectedData1?.user_name || ""} - Access Details`}
        open={isModalOpen1}
        onCancel={() => setIsModalOpen1(false)}
        footer={null}
        width={900}
      >
        {selectedData1 && (
          <>
            <Card size="small" title="Access Key Information" style={{ marginBottom: 16 }} headStyle={header}>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Key 1 - ID">{selectedData1.access_key_1_id || 'Not Available'}</Descriptions.Item>
                <Descriptions.Item label="Key 2 - ID">{selectedData1.access_key_2_id || 'Not Available'}</Descriptions.Item>
                <Descriptions.Item label="Key 1 - Status">
                  <Tag color={selectedData1.access_key_1_status === 'Active' ? 'green' : 'red'}>
                    {selectedData1.access_key_1_status || 'N/A'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Key 2 - Status">
                  <Tag color={selectedData1.access_key_2_status === 'Active' ? 'green' : 'red'}>
                    {selectedData1.access_key_2_status || 'N/A'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Key 1 - Age">{selectedData1.access_key_1_age || "0"} Days</Descriptions.Item>
                <Descriptions.Item label="Key 2 - Age">{selectedData1.access_key_2_age || "0"} Days</Descriptions.Item>
                <Descriptions.Item label="Key 1 - Created">{formatDate(selectedData1.access_key_1_created)}</Descriptions.Item>
                <Descriptions.Item label="Key 2 - Created">{formatDate(selectedData1.access_key_2_created)}</Descriptions.Item>
                <Descriptions.Item label="Key 1 - Last Used">{formatDate(selectedData1.access_key_1_last_used)}</Descriptions.Item>
                <Descriptions.Item label="Key 2 - Last Used">{formatDate(selectedData1.access_key_2_last_used)}</Descriptions.Item>
                <Descriptions.Item label="Key 1 - Last Region">{selectedData1.access_key_1_last_region || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Key 2 - Last Region">{selectedData1.access_key_2_last_region || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Key 1 - Last Service">{selectedData1.access_key_1_last_service || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Key 2 - Last Service">{selectedData1.access_key_2_last_service || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}
      </Modal>

      {/* Policy Modal */}
      <Modal
        title={`${selectedPolicyData?.user_name || ""} - Attached Policies`}
        open={isPolicyModalOpen}
        onCancel={() => setIsPolicyModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedPolicyData && (
          <>
            <Table
              bordered
              pagination={false}
              rowKey={(record, index) => index}
              dataSource={[
                {
                  key: 1,
                  inlinePolicies: selectedPolicyData.inline_policies || [],
                  groupPolicies: selectedPolicyData.group_policies || [],
                  managedPolicies: selectedPolicyData.managed_policies || [],
                },
              ]}
              columns={[
                {
                  title: "Inline Policies",
                  dataIndex: "inlinePolicies",
                  key: "inlinePolicies",
                  width: "33.33%",
                  render: (policies) => {
                    if (!policies || policies.length === 0) {
                      return <Tag color="red">None</Tag>;
                    }

                    return (
                      <List
                        size="small"
                        dataSource={policies}
                        renderItem={(p, index) => (
                          <List.Item key={index} style={{ padding: "2px 0" }}>
                            <a
                              onClick={() => {
                                setSelectedPolicyDetail({
                                  ...p,
                                  type: "Inline Policies",
                                });
                                setIsPolicyDetailModalOpen(true);
                              }}
                              style={{
                                color: "#1890ff",
                                cursor: "pointer",
                              }}
                            >
                              {index + 1}. {p.policy_name || p}
                            </a>
                          </List.Item>
                        )}
                      />
                    );
                  },
                },
                {
                  title: "Group Policies",
                  dataIndex: "groupPolicies",
                  key: "groupPolicies",
                  width: "33.33%",
                  render: (policies) => {
                    if (!policies || policies.length === 0) {
                      return <Tag color="red">None</Tag>;
                    }

                    return (
                      <List
                        size="small"
                        dataSource={policies}
                        renderItem={(p, index) => (
                          <List.Item key={index} style={{ padding: "2px 0" }}>
                            <a
                              onClick={() => {
                                setSelectedPolicyDetail({
                                  ...p,
                                  type: "Group Policies",
                                });
                                setIsPolicyDetailModalOpen(true);
                              }}
                              style={{
                                color: "#1890ff",
                                cursor: "pointer",
                              }}
                            >
                              {index + 1}. {p.policy_name || p}
                            </a>
                          </List.Item>
                        )}
                      />
                    );
                  },
                },
                {
                  title: "Managed Policies",
                  dataIndex: "managedPolicies",
                  key: "managedPolicies",
                  width: "33.33%",
                  render: (policies) => {
                    if (!policies || policies.length === 0) {
                      return <Tag color="red">None</Tag>;
                    }

                    return (
                      <List
                        size="small"
                        dataSource={policies}
                        renderItem={(p, index) => (
                          <List.Item key={index} style={{ padding: "2px 0" }}>
                            <span
                              style={{
                                color: "black",
                                cursor: "default",
                              }}
                            >
                              {index + 1}. {p.policy_name || p}
                            </span>
                          </List.Item>
                        )}
                      />
                    );
                  },
                },
              ]}
            />
          </>
        )}
      </Modal>

      {/* Policy Details Modal */}
      <Modal
        title={`${selectedPolicyDetail?.policy_name || ""} - Details`}
        open={isPolicyDetailModalOpen}
        onCancel={() => setIsPolicyDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedPolicyDetail && (
          <Row gutter={24}>
            <Col span={12}>
              <div>
                <h4 style={{ 
                  color: "#52c41a", 
                  paddingBottom: "8px",
                  marginBottom: "16px"
                }}>
                  Allowed Services
                </h4>
                {selectedPolicyDetail.allowed_services?.length ? (
                  <List
                    size="small"
                    dataSource={selectedPolicyDetail.allowed_services}
                    renderItem={(service, index) => (
                      <List.Item style={{ padding: "4px 0" }}>
                        <span>• {service}</span>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Tag color="red">None</Tag>
                )}
              </div>
            </Col>
            
            <Col span={12}>
              <div>
                <h4 style={{ 
                  color: "#ff4d4f", 
                  paddingBottom: "8px",
                  marginBottom: "16px"
                }}>
                  Denied Services
                </h4>
                {selectedPolicyDetail.denied_services?.length ? (
                  <List
                    size="small"
                    dataSource={selectedPolicyDetail.denied_services}
                    renderItem={(service, index) => (
                      <List.Item style={{ padding: "4px 0" }}>
                        <span>• {service}</span>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Tag color="green">None</Tag>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Modal>

      {/* CSS for blinking animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
};

export default Insights;
