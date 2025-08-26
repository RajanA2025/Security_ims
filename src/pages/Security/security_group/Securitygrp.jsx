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
} from "antd";


import {
  EyeOutlined,
  InfoCircleOutlined ,
  SearchOutlined,
  DesktopOutlined,
  SecurityScanFilled,
  SecurityScanTwoTone
} from "@ant-design/icons";
import axios from "axios";
import { PortableWifiOffOutlined, PortraitOutlined, SecuritySharp } from "@mui/icons-material";

const header = {
  backgroundColor: "#4f46e5",
  color: "white"
};

const Securitygrp = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const API_URL = "http://13.212.15.14:8012/security-groups";
  const { Option } = Select;
  const accountIds = [...new Set(data.map(item => item.account_id))];
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL);
        setData(response.data);
        setFilteredData(response.data); // show all initially
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
  
    // Filter by account_id if selected
    if (accountValue) {
      filtered = filtered.filter(item => item.account_id === accountValue);
    }
  
    // Filter by username if search text is entered
    if (searchValue.trim() !== "") {
      filtered = filtered.filter(item =>
        item.sg_name.toLowerCase().includes(searchValue.toLowerCase())
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
  const sshCount = filteredData.filter(
    (item) => item.from_port == 22
  ).length;
  const RDPCount = filteredData.filter(
    (item) => item.from_port == 3389
  ).length;
  const OrphanedEnabledCount = filteredData.filter((item) => item.is_orphaned).length;
  const IpEnabledCount = filteredData.filter((item) => item.ip_range === "0.0.0.0/0")
    .length;

//   const mfaPercent = total ? Math.round((mfaTrueCount / total) * 100) : 0;
//   const passwordPercent = total
//     ? Math.round((passwordEnabledCount / total) * 100)
//     : 0;
  const OrphanedPercent = total
    ? Math.round((OrphanedEnabledCount / total) * 100)
    : 0;
  const IpPercent = total
    ? Math.round((IpEnabledCount / total) * 100)
    : 0;

  // Table columns
  const columns = [
    {
      title: "Account Name",
      dataIndex: "account_name",
      key: "account_name",
      width: 100
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 100
    },
    {
        title: "Secuirty Name",
        dataIndex: "sg_name",
        key: "sg_name",
        width: 100
      },
    {
      title: "Orphaned",
      dataIndex: "is_orphaned",
      key: "is_orphaned",
      width: 100,
      render: (value) => (
        <Tag color={value ? "green" : "red"}>{value ? "True" : "False"}</Tag>
      )
    },
   
    
    {
      title: "IP Range",
      dataIndex: "ip_range",
      key: "ip_range",
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
    
<Row gutter={[16, 16]} style={{ marginBottom: 5 }}>
  <Col md={16}>
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
      placeholder="Security Name"
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
              <SecurityScanFilled style={{ fontSize: 28, color: "#722ed1" }} />
              <Progress type="circle" percent={OrphanedPercent} strokeColor={OrphanedPercent > 75 ? "#52c41a" : OrphanedPercent > 50 ? "#fa8c16" : "#ff4d4f"} />
              <span style={{ fontWeight: "bold" }}>Is Orphaned  &nbsp;
               <Tooltip placement="rightBottom" title="Remove orphaned security groups that are not associated with any resources and are no longer needed.">
    <InfoCircleOutlined
   
    />
  </Tooltip>
              </span>
              <span style={{ color: "#888" }}>{OrphanedEnabledCount}/{total} Security Groups</span>
            </Flex>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center" }}>
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
          <Card hoverable style={{ textAlign: "center" }}>
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
          <Card hoverable style={{ textAlign: "center" }}>
            <Flex vertical align="center" gap="small">
              <PortableWifiOffOutlined style={{ fontSize: 28, color: "#722ed1" }} />
              <Progress type="circle" percent={IpPercent} strokeColor={IpPercent < 75 ? "#52c41a" : IpPercent < 50 ? "#fa8c16" : "#ff4d4f"} />
              <span style={{ fontWeight: "bold" }}>All Traffic  &nbsp;
              <Tooltip placement="rightBottom" title="Restrict “All Traffic” rules in security groups to only trusted sources and required ports.">
    <InfoCircleOutlined
   
    />
  </Tooltip>
              </span>
              <span style={{ color: "#888" }}>{IpEnabledCount}/{total} Open Port</span>
            </Flex>
          </Card>
        </Col>
       

        {/* <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center" }}>
            <Flex vertical align="center" gap="small">
              <LockOutlined style={{ fontSize: 28, color: "#722ed1" }} />
              <Progress type="circle" percent={passwordPercent} strokeColor={passwordPercent > 50 ? "#52c41a" : "#ff4d4f"} />
              <span style={{ fontWeight: "bold" }}>Password Enabled</span>
              <span style={{ color: "#888" }}>{passwordEnabledCount}/{total} Users</span>
            </Flex>
          </Card>
        </Col> */}
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
        rowKey="username"
        pagination={{ pageSize: 8 }}
      />

      {/* Modal */}
      <Modal
      
        title={`${selectedData?.account_name || ""} - Account Details`}
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
                 <Descriptions.Item label="From Port">{selectedData.from_port}</Descriptions.Item>
                <Descriptions.Item label="To Port">{selectedData.to_port}</Descriptions.Item>
                <Descriptions.Item label="SecurityGroup Id">{selectedData.sg_id}</Descriptions.Item>
                <Descriptions.Item label="SecurityGroup Name">{selectedData.sg_name}</Descriptions.Item>
                <Descriptions.Item label="Instance Id">{selectedData.instance_id || "-"}</Descriptions.Item>
                <Descriptions.Item label="Instance Name">{selectedData.instance_name || "-"}</Descriptions.Item>
                {/* <Descriptions.Item label="Password Last Used">{selectedData.password_last_used}</Descriptions.Item> */}
                <Descriptions.Item label="Orphaned">
                  <Tag color={selectedData.is_orphaned ? "green" : "red"}>
                    {selectedData.is_orphaned ? "True" : "False"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Policies */}
            {/* <Row gutter={16}>
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
            </Row> */}

            {/* Roles & Groups */}
            {/* <Row gutter={16} style={{ marginTop: 16 }}>
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
            </Row> */}
          </>
        )}
      </Modal>
    </>
  );
};

export default Securitygrp;


