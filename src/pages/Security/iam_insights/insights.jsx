// src/pages/Insights/Insights.jsx
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
  Typography,
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

const { Title, Text } = Typography;
const { Option } = Select;

// Helper functions for risk and age coloring
const riskColorMap = {
  HIGH: "#ff4d4f",
  MEDIUM: "#faad14",
  LOW: "#52c41a",
};

const riskBlink = (risk) => (risk === "HIGH" ? "blink 1s infinite" : "none");

const ageColor = (age) => {
  if (age == null) return "#52c41a";
  if (age > 90) return "#ff4d4f";
  if (age > 60) return "#fa8c16";
  if (age > 30) return "#faad14";
  return "#52c41a";
};

const ageBlink = (age) => (age > 90 ? "blink 1s infinite" : "none");

const formatDate = (dateString) => {
  if (dateString == null) return "N/A";
  const s = String(dateString).trim();
  if (s === "" || s.toLowerCase() === "null") return "N/A";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleString();
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12 } },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const AnimatedProgress = ({ percent, strokeColor, delay = 0 }) => (
  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}>
    <Progress type="circle" percent={percent} strokeColor={strokeColor} width={80} />
  </motion.div>
);

const header = { backgroundColor: "#4f46e5", color: "white" };

// Dev-only logging
const devLog = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
const devError = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
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

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedPolicyData, setSelectedPolicyData] = useState(null);
  const [isPolicyDetailModalOpen, setIsPolicyDetailModalOpen] = useState(false);
  const [selectedPolicyDetail, setSelectedPolicyDetail] = useState(null);

  // stable list of accountIds (strings)
  const accountIds = [...new Set((data || []).map((item) => String(item?.account_id ?? "").trim()).filter(Boolean))];

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        // SAFE parse of account_ids from localStorage
        let raw = null;
        try {
          raw = localStorage.getItem("account_ids");
        } catch (err) {
          devError("localStorage unavailable:", err);
          raw = null;
        }

        let storedList = [];
        if (raw == null || String(raw).trim() === "") {
          storedList = [];
        } else {
          const s = String(raw).trim();
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) storedList = parsed;
            else if (typeof parsed === "string" || typeof parsed === "number") storedList = [parsed];
            else storedList = String(parsed).split(",").map((v) => v.trim()).filter(Boolean);
          } catch {
            // not JSON: CSV or single string
            if (s.includes(",")) storedList = s.split(",").map((v) => v.trim()).filter(Boolean);
            else storedList = [s];
          }
        }

        const storedIds = (Array.isArray(storedList) ? storedList : [storedList]).map((id) => String(id ?? "").trim()).filter(Boolean);

        const postBody = { account_ids: storedIds };
        devLog("➡️ POST Body Sent:", postBody);

        const response = await axios.post("http://47.130.218.97:8012/iam/filter", postBody, { headers: { "Content-Type": "application/json" }, timeout: 20000 });

        devLog("📌 API Response:", response?.data);

        const respData = Array.isArray(response?.data) ? response.data : response?.data?.data ?? [];
        if (mounted) {
          const normalized = Array.isArray(respData) ? respData : [];
          setData(normalized);
          setFilteredData(normalized);
        }
      } catch (error) {
        devError("❌ Error fetching IAM data:", error);
        // keep data as-is on error (no wiping)
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // search + account filter
  const handleSearch = (e) => {
    const value = e?.target?.value ?? "";
    setSearchText(value);
    handleFilters(value, selectedAccountId);
  };

  const handleAccountChange = (value) => {
    setSelectedAccountId(value ?? null);
    handleFilters(searchText, value);
  };

  const handleFilters = (searchValue, accountValue) => {
    const s = String(searchValue ?? "").trim().toLowerCase();
    const a = accountValue == null ? null : String(accountValue).trim();

    let filtered = Array.isArray(data) ? data.slice() : [];

    if (a) {
      filtered = filtered.filter((item) => String(item?.account_id ?? "").trim() === a);
    }

    if (s !== "") {
      filtered = filtered.filter((item) => String(item?.user_name ?? "").toLowerCase().includes(s));
    }

    setFilteredData(filtered);
  };

  // Modal open/close helpers (safe)
  const handleOpenModal = (record) => {
    setSelectedData(record ?? null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
  };

  const handleOpenModal1 = (record) => {
    setSelectedData1(record ?? null);
    setIsModalOpen1(true);
  };
  const handleCloseModal1 = () => {
    setIsModalOpen1(false);
    setSelectedData1(null);
  };

  const handleOpenPolicyModal = (record) => {
    setSelectedPolicyData(record ?? null);
    setIsPolicyModalOpen(true);
  };
  const handleClosePolicyModal = () => {
    setIsPolicyModalOpen(false);
    setSelectedPolicyData(null);
  };

  const handleOpenPolicyDetail = (detail) => {
    setSelectedPolicyDetail(detail ?? null);
    setIsPolicyDetailModalOpen(true);
  };
  const handleClosePolicyDetail = () => {
    setIsPolicyDetailModalOpen(false);
    setSelectedPolicyDetail(null);
  };

  // stats
  const total = filteredData.length;
  const mfaTrueCount = filteredData.filter((item) => item?.mfa_enabled === true).length;
  const passwordEnabledCount = filteredData.filter((item) => {
    const p = item;
    return p?.password_created_on != null || p?.password_last_used != null || p?.password_age != null;
  }).length;
  const AdminEnabledCount = filteredData.filter((item) => item?.has_admin_access).length;
  const ConsoleEnabledCount = filteredData.filter((item) => item?.console_access).length;

  const mfaPercent = total ? Math.round((mfaTrueCount / total) * 100) : 0;
  const passwordPercent = total ? Math.round((passwordEnabledCount / total) * 100) : 0;
  const adminPercent = total ? Math.round((AdminEnabledCount / total) * 100) : 0;
  const consolePercent = total ? Math.round((ConsoleEnabledCount / total) * 100) : 0;

  const columns = [
    { title: "Name", dataIndex: "user_name", key: "name", width: 50 },
    {
      title: (
        <span>
          MFA Status{" "}
          <Tooltip title="Indicates whether Multi-Factor Authentication is enabled.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "mfa_enabled",
      key: "mfa_enabled",
      width: 100,
      render: (value) => <Tag color={value ? "green" : "red"}>{value ? "true" : "false"}</Tag>,
    },
    {
      title: (
        <span>
          Password Enabled{" "}
          <Tooltip title="Indicates whether password authentication is enabled.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "password_enabled",
      key: "password_enabled",
      width: 120,
      render: (value, record) => {
        const isEnabled = record?.password_created_on != null || record?.password_last_used != null || record?.password_age != null;
        return <Tag color={isEnabled ? "green" : "red"}>{isEnabled ? "True" : "False"}</Tag>;
      },
    },
    {
      title: "Password Age",
      dataIndex: "password_age",
      key: "password_age",
      width: 100,
      render: (value) => {
        if (value == null) return "-";
        const color = ageColor(value);
        const blink = ageBlink(value);
        return (
          <span style={{ color, fontWeight: "bold", animation: blink }}>
            {value} days
          </span>
        );
      },
    },
    {
      title: (
        <span>
          Access Key Age{" "}
          <Tooltip title="Shows the age of access keys in days.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "access_key_age",
      key: "access_key_age",
      width: 150,
      render: (_, record) => {
        const key1 = record?.access_key_1_age ?? "-";
        const key2 = record?.access_key_2_age ?? "-";
        const renderAge = (value) => {
          if (value === "-" || value == null) return "-";
          const color = ageColor(value);
          const blink = ageBlink(value);
          return (
            <span style={{ color, fontWeight: "bold", animation: blink, marginRight: 8 }}>
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
          Admin{" "}
          <Tooltip title="Indicates whether user has administrator access.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "has_admin_access",
      key: "has_admin_access",
      width: 80,
      render: (value) => <Tag color={value ? "orange" : "green"}>{value ? "True" : "False"}</Tag>,
    },
    {
      title: "Access Key",
      key: "access_key",
      width: 80,
      render: (_, record) => (
        <Tooltip title="View Access Key Details">
          <KeyOutlined style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }} onClick={() => handleOpenModal1(record)} />
        </Tooltip>
      ),
    },
    {
      title: "Security Score",
      dataIndex: "security_score",
      key: "security_score",
      width: 120,
      render: (_, record) => {
        const score = record?.security_score ?? "-";
        const risk = record?.risk_level ?? "N/A";
        const color = riskColorMap[risk] ?? "#52c41a";
        const blink = riskBlink(risk);
        return (
          <Tooltip title={`Risk Level: ${risk}`}>
            <span style={{ color, fontWeight: "bold", animation: blink, cursor: "pointer", fontSize: 14 }}>{score}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Policy",
      key: "policy",
      width: 100,
      render: (_, record) => (
        <Tooltip title="View Policies">
          <EyeOutlined style={{ fontSize: 18, color: "#722ed1", cursor: "pointer" }} onClick={() => handleOpenPolicyModal(record)} />
        </Tooltip>
      ),
    },
    {
      title: "More Details",
      key: "more_details",
      width: 100,
      render: (_, record) => (
        <Tooltip title="View Complete Details">
          <EyeOutlined style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }} onClick={() => handleOpenModal(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Row gutter={[16, 16]} style={{ marginBottom: 15 }}>
        <Col xs={24} sm={24} md={16}>
          <Title level={4} style={{ fontFamily: "'Roboto', 'Segoe UI', sans-serif", fontSize: "20px", fontWeight: 500, color: "black", margin: 0 }}>
            IAM Insights
          </Title>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Select placeholder="Filter by Account ID" style={{ width: "100%" }} allowClear value={selectedAccountId} onChange={handleAccountChange}>
            {accountIds.map((id) => (
              <Option key={id} value={id}>
                {id}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Input placeholder="Search by Name" prefix={<SearchOutlined />} value={searchText} onChange={handleSearch} allowClear />
        </Col>
      </Row>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="stats-container">
        <Row gutter={[16, 16]}>
          {/* card examples (unchanged UI logic) */}
          <Col xs={24} sm={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="stat-card">
              <Card
                hoverable={false}
                style={{
                  height: "100%",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  borderTop: `5px solid ${mfaPercent >= 75 ? "#ff4d4f" : mfaPercent > 50 ? "#fa8c16" : "#52c41a"}`,
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <div style={{ textAlign: "center" }}>
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} style={{ marginBottom: "16px" }}>
                    {React.cloneElement(<SafetyCertificateOutlined />, { style: { fontSize: 32, color: mfaPercent >= 75 ? "#ff4d4f" : mfaPercent > 50 ? "#fa8c16" : "#52c41a" } })}
                  </motion.div>

                  <AnimatedProgress percent={mfaPercent} strokeColor={mfaPercent >= 75 ? "#ff4d4f" : mfaPercent > 50 ? "#fa8c16" : "#52c41a"} delay={0.2} />

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      MFA Enabled
                      <Tooltip placement="top" title="Enable Multi-Factor Authentication (MFA) for all IAM users to enhance account security.">
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                      </Tooltip>
                    </div>
                    <motion.span style={{ color: "#666", fontSize: "14px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                      {mfaTrueCount}/{total} Users
                    </motion.span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* other cards (Password, Admin, Console) kept same structure */}
          <Col xs={24} sm={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="stat-card">
              <Card hoverable={false} style={{ height: "100%", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderTop: `5px solid ${passwordPercent >= 75 ? "#ff4d4f" : passwordPercent > 50 ? "#fa8c16" : "#52c41a"}` }} bodyStyle={{ padding: "24px" }}>
                <div style={{ textAlign: "center" }}>
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} style={{ marginBottom: "16px" }}>
                    {React.cloneElement(<LockOutlined />, { style: { fontSize: 32, color: passwordPercent > 75 ? "#52c41a" : passwordPercent > 50 ? "#fa8c16" : "#ff4d4f" } })}
                  </motion.div>

                  <AnimatedProgress percent={passwordPercent} strokeColor={passwordPercent > 75 ? "#ff4d4f" : passwordPercent > 50 ? "#fa8c16" : "#52c41a"} delay={0.3} />

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginTop: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      Password Enabled
                      <Tooltip placement="top" title="Enforce strong password policies for all IAM users to enhance account security.">
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                      </Tooltip>
                    </div>
                    <motion.span style={{ color: "#666", fontSize: "14px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                      {passwordEnabledCount}/{total} Users
                    </motion.span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="stat-card">
              <Card hoverable={false} style={{ height: "100%", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderTop: `5px solid ${adminPercent >= 75 ? "#ff4d4f" : adminPercent > 50 ? "#fa8c16" : "#52c41a"}` }} bodyStyle={{ padding: "24px" }}>
                <div style={{ textAlign: "center" }}>
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }} style={{ marginBottom: "16px" }}>
                    {React.cloneElement(<UserSwitchOutlined />, { style: { fontSize: 32, color: adminPercent > 75 ? "#52c41a" : adminPercent > 50 ? "#fa8c16" : "#ff4d4f" } })}
                  </motion.div>

                  <AnimatedProgress percent={adminPercent} strokeColor={adminPercent > 75 ? "#ff4d4f" : adminPercent > 50 ? "#fa8c16" : "#52c41a"} delay={0.4} />

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ marginTop: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      Admin Access
                      <Tooltip placement="top" title="Validate if each IAM user truly requires administrator access and remove unnecessary privileges.">
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                      </Tooltip>
                    </div>
                    <motion.span style={{ color: "#666", fontSize: "14px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                      {AdminEnabledCount}/{total} Users
                    </motion.span>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="stat-card">
              <Card hoverable={false} style={{ height: "100%", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderTop: `5px solid ${consolePercent >= 75 ? "#52c41a" : consolePercent > 50 ? "#fa8c16" : "#ff4d4f"}` }} bodyStyle={{ padding: "24px" }}>
                <div style={{ textAlign: "center" }}>
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 200 }} style={{ marginBottom: "16px" }}>
                    {React.cloneElement(<DesktopOutlined />, { style: { fontSize: 32, color: consolePercent > 75 ? "#52c41a" : consolePercent > 50 ? "#fa8c16" : "#ff4d4f" } })}
                  </motion.div>

                  <AnimatedProgress percent={consolePercent} strokeColor={consolePercent > 75 ? "#52c41a" : consolePercent > 50 ? "#fa8c16" : "#ff4d4f"} delay={0.5} />

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} style={{ marginTop: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      Console Access
                      <Tooltip placement="top" title="Review console access permissions for security compliance.">
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                      </Tooltip>
                    </div>
                    <motion.span style={{ color: "#666", fontSize: "14px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
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

      <div style={{ width: "100%", overflowX: "auto" }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey={(record, index) => (record?.user_name ? `${record.user_name}-${record.account_id ?? index}` : `row-${index}`)}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* More Details Modal */}
      <Modal title={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><UserSwitchOutlined style={{ color: "#4f46e5" }} />{`${selectedData?.user_name || ""} - Comprehensive Details`}</div>} open={isModalOpen} onCancel={handleCloseModal} footer={null} width={1200} style={{ top: 20 }}>
        {selectedData && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Basic Information Card */}
            <Card size="small" title={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><InfoCircleOutlined />Basic Information</div>} style={{ marginBottom: 16 }} headStyle={header}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Account ID">
                      <Badge count={selectedData.account_id ?? "-"} style={{ backgroundColor: "#52c41a" }} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Account Name">
                      <strong>{selectedData.account_name ?? "-"}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="ARN">
                      <code style={{ fontSize: "11px", background: "#f5f5f5", padding: "2px 4px", wordBreak: "break-all" }}>{selectedData?.arn ?? "-"}</code>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="User Created On">
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <CalendarOutlined />
                        {formatDate(selectedData?.user_created_on)}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Console Access">
                      <Tag color={selectedData?.console_access ? "green" : "red"} icon={<DesktopOutlined />}>
                        {selectedData?.console_access ? "Enabled" : "Disabled"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Admin Access">
                      <Tag color={selectedData?.has_admin_access ? "orange" : "green"} icon={<SecurityScanOutlined />}>
                        {selectedData?.has_admin_access ? "Admin User" : "Regular User"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Security Information Card */}
            <Card size="small" title={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><SafetyCertificateOutlined />Security & Authentication</div>} style={{ marginBottom: 16 }} headStyle={header}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="MFA Status">
                      <Tag color={selectedData?.mfa_enabled ? "green" : "red"} icon={<SafetyCertificateOutlined />}>{selectedData?.mfa_enabled ? "Enabled" : "Disabled"}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Password Enabled">
                      <Tag color={selectedData && (selectedData.password_created_on || selectedData.password_last_used || selectedData.password_age) ? "green" : "red"} icon={<LockOutlined />}>
                        {selectedData && (selectedData.password_created_on || selectedData.password_last_used || selectedData.password_age) ? "Yes" : "No"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                <Col span={8}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Password Age">
                      {selectedData?.password_age != null ? (
                        <Badge count={`${selectedData.password_age} days`} style={{ backgroundColor: ageColor(selectedData.password_age) }} />
                      ) : (
                        <Tag color="default">Not Set</Tag>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Password Created">{formatDate(selectedData?.password_created_on)}</Descriptions.Item>
                  </Descriptions>
                </Col>

                <Col span={8}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Password Last Used">
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <CalendarOutlined />
                        {formatDate(selectedData?.password_last_used)}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Access Keys Information */}
            <Card size="small" title={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><KeyOutlined />Access Keys Information</div>} style={{ marginBottom: 16 }} headStyle={header}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="Access Key 1" type="inner" style={{ height: "100%" }}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Key ID">{selectedData?.access_key_1_id ? <code style={{ fontSize: "11px", background: "#f5f5f5", padding: "2px 4px" }}>{selectedData.access_key_1_id}</code> : <Tag color="default">Not Available</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Status">{selectedData?.access_key_1_status ? <Tag color={selectedData.access_key_1_status === "Active" ? "green" : "red"}>{selectedData.access_key_1_status}</Tag> : <Tag color="default">N/A</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Created On">{formatDate(selectedData?.access_key_1_created)}</Descriptions.Item>
                      <Descriptions.Item label="Age">{selectedData?.access_key_1_age ? <Badge count={`${selectedData.access_key_1_age} days`} style={{ backgroundColor: selectedData.access_key_1_age > 90 ? "#ff4d4f" : "#52c41a" }} /> : <Tag color="default">N/A</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Last Used">{formatDate(selectedData?.access_key_1_last_used)}</Descriptions.Item>
                      <Descriptions.Item label="Last Service">{selectedData?.access_key_1_last_service && selectedData.access_key_1_last_service !== "N/A" ? <Tag color="blue" icon={<GlobalOutlined />}>{selectedData.access_key_1_last_service}</Tag> : <Tag color="default">N/A</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Last Region">{selectedData?.access_key_1_last_region && selectedData.access_key_1_last_region !== "N/A" ? <Tag color="purple">{selectedData.access_key_1_last_region}</Tag> : <Tag color="default">N/A</Tag>}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card size="small" title="Access Key 2" type="inner" style={{ height: "100%" }}>
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Key ID">{selectedData?.access_key_2_id ? <code style={{ fontSize: "11px", background: "#f5f5f5", padding: "2px 4px" }}>{selectedData.access_key_2_id}</code> : <Tag color="default">Not Available</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Status">{selectedData?.access_key_2_status ? <Tag color={selectedData.access_key_2_status === "Active" ? "green" : "red"}>{selectedData.access_key_2_status}</Tag> : <Tag color="default">N/A</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Created On">{formatDate(selectedData?.access_key_2_created)}</Descriptions.Item>
                      <Descriptions.Item label="Age">{selectedData?.access_key_2_age ? <Badge count={`${selectedData.access_key_2_age} days`} style={{ backgroundColor: selectedData.access_key_2_age > 90 ? "#ff4d4f" : "#52c41a" }} /> : <Tag color="default">N/A</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Last Used">{formatDate(selectedData?.access_key_2_last_used)}</Descriptions.Item>
                      <Descriptions.Item label="Last Service">{selectedData?.access_key_2_last_service && selectedData.access_key_2_last_service !== "N/A" ? <Tag color="blue" icon={<GlobalOutlined />}>{selectedData.access_key_2_last_service}</Tag> : <Tag color="default">N/A</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Last Region">{selectedData?.access_key_2_last_region && selectedData.access_key_2_last_region !== "N/A" ? <Tag color="purple">{selectedData.access_key_2_last_region}</Tag> : <Tag color="default">N/A</Tag>}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Security Summary */}
            <Card size="small" title={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><SecurityScanOutlined />Security Summary</div>} style={{ marginBottom: 16 }} headStyle={header}>
              {selectedData && (
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card size="small" title="Security Score" type="inner">
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: 28, fontWeight: "bold", color: riskColorMap[selectedData.risk_level] ?? "#52c41a", animation: riskBlink(selectedData.risk_level) }}>
                          {selectedData.security_score ?? "-"}
                        </span>
                        <div style={{ marginTop: 8, color: "#666" }}>Overall security score</div>
                      </div>
                    </Card>
                  </Col>

                  <Col span={12}>
                    <Card size="small" title="Risk Level" type="inner">
                      <div style={{ textAlign: "center" }}>
                        <Tag color={selectedData.risk_level === "HIGH" ? "red" : selectedData.risk_level === "MEDIUM" ? "orange" : "green"} style={{ fontSize: 16, padding: "6px 14px" }}>{selectedData.risk_level || "N/A"}</Tag>
                        <div style={{ marginTop: 8, color: "#666" }}>Based on IAM security evaluation</div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card>

            {/* Groups */}
            {selectedData?.groups && selectedData.groups.length > 0 && (
              <Card size="small" title={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><UserSwitchOutlined />User Groups</div>} style={{ marginBottom: 16 }} headStyle={header}>
                <List size="small" dataSource={selectedData.groups} renderItem={(group, index) => (<List.Item><Tag color="blue" style={{ marginRight: "8px" }}>{index + 1}</Tag>{group}</List.Item>)} />
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Access Key Modal */}
      <Modal title={`${selectedData1?.user_name || ""} - Access Details`} open={isModalOpen1} onCancel={handleCloseModal1} footer={null} width={900}>
        {selectedData1 && (
          <Card size="small" title="Access Key Information" style={{ marginBottom: 16 }} headStyle={header}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Key 1 - ID">{selectedData1.access_key_1_id || "Not Available"}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - ID">{selectedData1.access_key_2_id || "Not Available"}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Status"><Tag color={selectedData1.access_key_1_status === "Active" ? "green" : "red"}>{selectedData1.access_key_1_status || "N/A"}</Tag></Descriptions.Item>
              <Descriptions.Item label="Key 2 - Status"><Tag color={selectedData1.access_key_2_status === "Active" ? "green" : "red"}>{selectedData1.access_key_2_status || "N/A"}</Tag></Descriptions.Item>
              <Descriptions.Item label="Key 1 - Age">{selectedData1.access_key_1_age || "0"} Days</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Age">{selectedData1.access_key_2_age || "0"} Days</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Created">{formatDate(selectedData1.access_key_1_created)}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Created">{formatDate(selectedData1.access_key_2_created)}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Last Used">{formatDate(selectedData1.access_key_1_last_used)}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Last Used">{formatDate(selectedData1.access_key_2_last_used)}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Last Region">{selectedData1.access_key_1_last_region || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Last Region">{selectedData1.access_key_2_last_region || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Last Service">{selectedData1.access_key_1_last_service || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Last Service">{selectedData1.access_key_2_last_service || "N/A"}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>

      {/* Policy Modal */}
      <Modal title={`${selectedPolicyData?.user_name || ""} - Attached Policies`} open={isPolicyModalOpen} onCancel={handleClosePolicyModal} footer={null} width={900}>
        {selectedPolicyData && (
          <>
            <Table
              bordered
              pagination={false}
              rowKey={(record, index) => index}
              dataSource={[
                {
                  key: 1,
                  inlinePolicies: selectedPolicyData?.inline_policies ?? [],
                  groupPolicies: selectedPolicyData?.group_policies ?? [],
                  managedPolicies: selectedPolicyData?.managed_policies ?? [],
                },
              ]}
              columns={[
                {
                  title: "Inline Policies",
                  dataIndex: "inlinePolicies",
                  key: "inlinePolicies",
                  width: "33.33%",
                  render: (policies) => {
                    const list = Array.isArray(policies) ? policies : [];
                    if (list.length === 0) return <Tag color="red">None</Tag>;
                    return <List size="small" dataSource={list} renderItem={(p, index) => (
                      <List.Item key={index} style={{ padding: "2px 0" }}>
                        <a onClick={() => handleOpenPolicyDetail({ ...(typeof p === "object" ? p : { policy_name: p }), type: "Inline Policies" })} style={{ color: "#1890ff", cursor: "pointer" }}>
                          {index + 1}. {p?.policy_name ?? p}
                        </a>
                      </List.Item>
                    )} />;
                  },
                },
                {
                  title: "Group Policies",
                  dataIndex: "groupPolicies",
                  key: "groupPolicies",
                  width: "33.33%",
                  render: (policies) => {
                    const list = Array.isArray(policies) ? policies : [];
                    if (list.length === 0) return <Tag color="red">None</Tag>;
                    return <List size="small" dataSource={list} renderItem={(p, index) => (
                      <List.Item key={index} style={{ padding: "2px 0" }}>
                        <a onClick={() => handleOpenPolicyDetail({ ...(typeof p === "object" ? p : { policy_name: p }), type: "Group Policies" })} style={{ color: "#1890ff", cursor: "pointer" }}>
                          {index + 1}. {p?.policy_name ?? p}
                        </a>
                      </List.Item>
                    )} />;
                  },
                },
                {
                  title: "Managed Policies",
                  dataIndex: "managedPolicies",
                  key: "managedPolicies",
                  width: "33.33%",
                  render: (policies) => {
                    const list = Array.isArray(policies) ? policies : [];
                    if (list.length === 0) return <Tag color="red">None</Tag>;
                    return <List size="small" dataSource={list} renderItem={(p, index) => (
                      <List.Item key={index} style={{ padding: "2px 0" }}>
                        <span style={{ color: "black", cursor: "default" }}>{index + 1}. {p?.policy_name ?? p}</span>
                      </List.Item>
                    )} />;
                  },
                },
              ]}
            />
          </>
        )}
      </Modal>

      {/* Policy Details Modal */}
      <Modal title={`${selectedPolicyDetail?.policy_name || ""} - Details`} open={isPolicyDetailModalOpen} onCancel={handleClosePolicyDetail} footer={null} width={800}>
        {selectedPolicyDetail && (
          <Row gutter={24}>
            <Col span={12}>
              <div>
                <h4 style={{ color: "#52c41a", paddingBottom: "8px", marginBottom: "16px" }}>Allowed Services</h4>
                {Array.isArray(selectedPolicyDetail.allowed_services) && selectedPolicyDetail.allowed_services.length ? (
                  <List size="small" dataSource={selectedPolicyDetail.allowed_services} renderItem={(service, index) => <List.Item style={{ padding: "4px 0" }} key={index}><span>• {service}</span></List.Item>} />
                ) : (
                  <Tag color="red">None</Tag>
                )}
              </div>
            </Col>

            <Col span={12}>
              <div>
                <h4 style={{ color: "#ff4d4f", paddingBottom: "8px", marginBottom: "16px" }}>Denied Services</h4>
                {Array.isArray(selectedPolicyDetail.denied_services) && selectedPolicyDetail.denied_services.length ? (
                  <List size="small" dataSource={selectedPolicyDetail.denied_services} renderItem={(service, index) => <List.Item style={{ padding: "4px 0" }} key={index}><span>• {service}</span></List.Item>} />
                ) : (
                  <Tag color="green">None</Tag>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Modal>

      {/* central blink keyframe */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Insights;
