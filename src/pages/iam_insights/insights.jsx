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
  DesktopOutlined,
  KeyOutlined
} from "@ant-design/icons";
import axios from "axios";
import { KeyOffRounded } from "@mui/icons-material";

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
        item.user_name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
  
    setFilteredData(filtered);
  };
  // Open modal
  const handleOpenModal = (record) => {
    setSelectedData(record);
    setIsModalOpen(true);
  };
  const handleOpenModal1 = (record) => {
    setSelectedData1(record);
    setIsModalOpen1(true);
  };
  

  // Stats
  const total = filteredData.length;
  const mfaTrueCount = filteredData.filter(
    (item) => item.mfa_enabled === "Enabled"
  ).length;
  const passwordEnabledCount = filteredData.filter(
    (item) => item.password_enabled
  ).length;
  const AdminEnabledCount = filteredData.filter((item) => item.has_admin_access).length;
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
      dataIndex: "user_name",
      key: "name",
      width: 100
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
          <Tooltip title="Indicates whether Multi-Factor Authentication is enabled.">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        </span>
      ),

      dataIndex: "password_enabled",
      key: "password_enabled",
      width: 100,
      render: (value) => (
        <Tag color={value ? "green" : "red"}>{value ? "True" : "False"}</Tag>
      )
    },
    {
      title: "Password Age",
      dataIndex: "password_age",
      key: "password_age",
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
      title: (
        <span>
        Access Key Age{' '}
          <Tooltip title="Indicates whether Multi-Factor Authentication is enabled.">
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
    
        // function to return colored text
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
          <Tooltip title="Indicates whether Multi-Factor Authentication is enabled.">
            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        </span>
      ),

      dataIndex: "has_admin_access",
      key: "has_admin_access",
      width: 100,
      render: (value) => (
        <Tag color={value ? "green" : "red"}>{value ? "True" : "False"}</Tag>
      )
    },
   
    {
      title: "Access Key",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Tooltip title="View Details">
          <KeyOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenModal1(record)}
          />
        </Tooltip>
      )
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
  <Row gutter={[16, 16]} style={{ marginBottom: 5 }}>
  <Col md={16}>
  <h2
  style={{
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    // fontWeight: 900,
    // fontSize: "23px",
    // color: "black"
  }}
>
  IAM Insights
</h2>
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



      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="user_name"
        pagination={{ pageSize: 8 }}
      />

      {/* Modal */}
      <Modal
      
        title={`${selectedData?.user_name || ""} - Account Details`}
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
                <Descriptions.Item label="Created On">{selectedData.user_created_on}</Descriptions.Item>
                <Descriptions.Item label="Password Last Used">{selectedData.password_last_used}</Descriptions.Item>
                <Descriptions.Item label="Admin">
                  <Tag color={selectedData.has_admin_access ? "green" : "red"}>
                    {selectedData.has_admin_access ? "True" : "False"}
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
                {/* <Card size="small" title="Roles" headStyle={header}>
                  {selectedData.roles.length > 0 ? (
                    <List size="small" dataSource={selectedData.roles} renderItem={(item) => <List.Item>{item}</List.Item>} />
                  ) : <p style={{ color: "#888" }}>No Roles</p>}
                </Card> */}
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


      <Modal
      
      title={`${selectedData1?.user_name || ""} - Access Details`}
      open={isModalOpen1}
      onCancel={() => setIsModalOpen1(false)}
      footer={null}
      width={900}
    >
      {selectedData1 && (
        <>
          <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={header}>
            <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Key 1 - Id">{selectedData1.access_key_1_id}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Id">{selectedData1.access_key_2_id}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Status">{selectedData1.access_key_1_status}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Status">{selectedData1.access_key_2_status}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Age">{selectedData1.access_key_1_age || "0"}Days</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Age">{selectedData1.access_key_2_age || "0 " }Days</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Created">{selectedData1.access_key_1_created}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Created">{selectedData1.access_key_2_created}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Last Used">{selectedData1.access_key_1_last_used}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Last Used">{selectedData1.access_key_2_last_used}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Last Region">{selectedData1.access_key_1_last_region}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Last Region">{selectedData1.access_key_2_last_region}</Descriptions.Item>
              <Descriptions.Item label="Key 1 - Last Service">{selectedData1.access_key_1_last_service}</Descriptions.Item>
              <Descriptions.Item label="Key 2 - Last Service">{selectedData1.access_key_2_last_service}</Descriptions.Item>
              {/* <Descriptions.Item label="Password Last Used">{selectedData1.password_last_used}</Descriptions.Item> */}
             
            </Descriptions>
          </Card>

        </>
      )}
    </Modal>
    </>
  );
};

export default Insights;
