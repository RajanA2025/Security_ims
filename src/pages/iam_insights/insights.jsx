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
} from "antd";


import {
  EyeOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserSwitchOutlined,
  SearchOutlined,InfoCircleOutlined ,
  DesktopOutlined
} from "@ant-design/icons";
import axios from "axios";

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
  const [searchText, setSearchText] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const API_URL = "http://13.212.15.14:8001/iam";
  const { Option } = Select;
  const accountIds = [...new Set(data.map(item => item.account_id))];
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL);
        setData(response.data);
        setFilteredData(response.data); 
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



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
        item.username.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
  
    setFilteredData(filtered);
  };
  // Open modal
  const handleOpenModal = (record) => {
    setSelectedData(record);
    setIsModalOpen(true);
  };

  // Stats
  const total = filteredData.length;
  const mfaTrueCount = filteredData.filter(
    (item) => item.mfa_status === "Enabled"
  ).length;
  const passwordEnabledCount = filteredData.filter(
    (item) => item.password_enabled
  ).length;
  const AdminEnabledCount = filteredData.filter((item) => item.is_admin).length;
  const ConsoleEnabledCount = filteredData.filter((item) => item.console_access)
    .length;

  const mfaPercent = total ? Math.round((mfaTrueCount / total) * 100) : 0;
  const passwordPercent = total
    ? Math.round((passwordEnabledCount / total) * 100)
    : 0;
  const adminPercent = total
    ? Math.round((AdminEnabledCount / total) * 100)
    : 0;
  const consolePercent = total
    ? Math.round((ConsoleEnabledCount / total) * 100)
    : 0;

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "username",
      key: "name",
      width: 100
    },
    {
      title: "MFA Status",
      dataIndex: "mfa_status",
      key: "mfa_status",
      width: 100
    },
    {
      title: "Password Enabled",
      dataIndex: "password_enabled",
      key: "password_enabled",
      width: 100,
      render: (value) => (
        <Tag color={value ? "green" : "red"}>{value ? "True" : "False"}</Tag>
      )
    },
    {
      title: "Password Age",
      dataIndex: "password_age_days",
      key: "password_age_days",
      width: 100,
      render: (value) => {
        if (value == null) {
          return '-'; // 
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
      title: "Admin",
      dataIndex: "is_admin",
      key: "is_admin",
      width: 100,
      render: (value) => (
        <Tag color={value ? "green" : "red"}>{value ? "True" : "False"}</Tag>
      )
    },
    {
      title: "Created On",
      dataIndex: "created_on",
      key: "created_on",
      width: 100
    },
    {
      title: "More Details",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Tooltip title="View Details">
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
      <h2>IAM Insights</h2>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center" }}>
         
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
          <Card hoverable style={{ textAlign: "center" }}>
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
          <Card hoverable style={{ textAlign: "center" }}>
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
          <Card hoverable style={{ textAlign: "center" }}>
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

      {/* Search */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: 10 }}>
      <Col md={18}>
          
        </Col>
        <Col md={6}>
          <Input
            placeholder="Search by First Name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
        </Col>
      </Row> */}

<Row gutter={[16, 16]} style={{ marginBottom: 10 }}>
  <Col md={16}>
  </Col>
  <Col md={4}>
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

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="username"
        pagination={{ pageSize: 8 }}
      />

      {/* Modal */}
      <Modal
      
        title={`${selectedData?.username || ""} - Account Details`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedData && (
          <>
            <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={header}>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Account ID">{selectedData.account_id}</Descriptions.Item>
                <Descriptions.Item label="Account Name">{selectedData.account_name}</Descriptions.Item>
                <Descriptions.Item label="ARN">{selectedData.arn}</Descriptions.Item>
                <Descriptions.Item label="Created On">{selectedData.created_on}</Descriptions.Item>
                <Descriptions.Item label="Password Last Used">{selectedData.password_last_used}</Descriptions.Item>
                <Descriptions.Item label="Admin">
                  <Tag color={selectedData.is_admin ? "green" : "red"}>
                    {selectedData.is_admin ? "True" : "False"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Policies */}
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="Inline Policies" headStyle={header}>
                  {selectedData.inline_policies.length > 0 ? (
                    <List size="small" dataSource={selectedData.inline_policies} renderItem={(item) => <List.Item>{item}</List.Item>} />
                  ) : <p style={{ color: "#888" }}>No Inline Policies</p>}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Group Policies" headStyle={header}>
                  {selectedData.group_policies.length > 0 ? (
                    <List size="small" dataSource={selectedData.group_policies} renderItem={(item) => <List.Item>{item}</List.Item>} />
                  ) : <p style={{ color: "#888" }}>No Group Policies</p>}
                </Card>
              </Col>
            </Row>

            {/* Roles & Groups */}
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card size="small" title="Roles" headStyle={header}>
                  {selectedData.roles.length > 0 ? (
                    <List size="small" dataSource={selectedData.roles} renderItem={(item) => <List.Item>{item}</List.Item>} />
                  ) : <p style={{ color: "#888" }}>No Roles</p>}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Groups" headStyle={header}>
                  {selectedData.groups.length > 0 ? (
                    <List size="small" dataSource={selectedData.groups} renderItem={(item) => <List.Item>{item}</List.Item>} />
                  ) : <p style={{ color: "#888" }}>No Groups</p>}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </>
  );
};

export default Insights;
