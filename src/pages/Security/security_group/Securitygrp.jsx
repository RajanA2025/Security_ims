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
  Spin,
  Alert
} from "antd";
import { useSecurityContext } from "../../../Context/SecurityContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  DesktopOutlined,
  SecurityScanFilled,
  SecurityScanTwoTone
} from "@ant-design/icons";
import axios from "axios";
import { PortableWifiOffOutlined, PortraitOutlined, SecuritySharp } from "@mui/icons-material";

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

const Securitygrp = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const { endpoints } = useSecurityContext();
  const { Option } = Select;
  const accountIds = [...new Set(data.map(item => item.account_id))];
  // Fetch data on mount
  const API_URL = "http://13.212.15.14:8012/security-groups";
   let storedAccountId = localStorage.getItem("account_ids");

  useEffect(() => {
    // const fetchData = async () => {
    //   setLoading(true);
    //   try {

    //   try {
    //     storedAccountId = JSON.parse(storedAccountId);
    //     if (Array.isArray(storedAccountId)) {
    //       storedAccountId = storedAccountId[0]; // take first ID
    //     }
    //   } catch {
    //     // keep as string
    //   }

    //     // const response = await axios.get(API_URL);
    //     // setData(response.data);
    //     // setFilteredData(response.data); // show all initially
        
    //   const [response] = await Promise.all([
    //     axios.get(API_URL),
       
    //   ]);

    //   const normalizeId = (id) => String(id).trim().toLowerCase();
    //   const storedId = normalizeId(storedAccountId);

    //   if (response?.data && Array.isArray(response.data)) {
    //     const filtered2 = response.data.filter((item) => {
    //       const itemId =
    //         item.account_id || item.accountId || item.ACCOUNT_ID || item.Account_ID;
    //       return normalizeId(itemId) === storedId;
    //     });
    //     console.log("Filtered Data 2:", filtered2);
    //     setData(filtered2);
    //     setFilteredData(filtered2);
    //   }

      
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchData = async () => {
      setLoading(true);
      try {
        let storedAccountId = localStorage.getItem("account_ids");
    
        // Parse storedAccountId safely
        try {
          storedAccountId = JSON.parse(storedAccountId);
        } catch {
          storedAccountId = [storedAccountId]; // wrap single ID into array
        }
    
        // Normalize all IDs
        const normalizeId = (id) => String(id).trim().toLowerCase();
        const storedIds = Array.isArray(storedAccountId)
          ? storedAccountId.map(normalizeId)
          : [normalizeId(storedAccountId)];
    
        const [response] = await Promise.all([axios.get(API_URL)]);
    
        if (response?.data && Array.isArray(response.data)) {
    
          const filteredData = response.data.filter((item) => {
            const itemId =
              item.account_id ||
              item.accountId ||
              item.ACCOUNT_ID ||
              item.Account_ID;
    
            return storedIds.includes(normalizeId(itemId));
          });
    
          console.log("Filtered Data 2:", filteredData);
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
  }, [storedAccountId]);

 

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
        title: "Security Name",
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
    <div className="p-5">
    
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="stats-container"
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          {/* Orphaned Groups Card */}
          <Col xs={24} sm={12} md={6}>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              style={{ height: '100%' }}
            >
              <Card 
                hoverable={false}
                style={{ 
                  height: '100%',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
                bodyStyle={{ 
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between'
                }}
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
                    style={{ marginBottom: 16 }}
                  >
                    <SecurityScanFilled style={{ fontSize: 32, color: "#722ed1" }} />
                  </motion.div>
                  <AnimatedProgress 
                    percent={OrphanedPercent} 
                    strokeColor={OrphanedPercent > 75 ? "#52c41a" : OrphanedPercent > 50 ? "#fa8c16" : "#ff4d4f"} 
                    delay={0.2}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginTop: 16 }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      Orphaned Groups
                      <Tooltip 
                        placement="top" 
                        title="Remove orphaned security groups that are not associated with any resources and are no longer needed."
                      >
                        <InfoCircleOutlined style={{ marginLeft: 6, color: "#8c8c8c" }} />
                      </Tooltip>
                    </div>
                    <div style={{ color: "#8c8c8c", fontSize: 14 }}>
                      {OrphanedEnabledCount} of {total} groups
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Open SSH Card */}
          <Col xs={24} sm={12} md={6}>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              style={{ height: '100%' }}
            >
              <Card 
                hoverable={false}
                style={{ 
                  height: '100%',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
                bodyStyle={{ 
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between'
                }}
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
                    style={{ marginBottom: 8 }}
                  >
                    <SecuritySharp style={{ fontSize: 32, color: "#1890ff" }} />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <motion.div
                      style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        margin: '8px 0',
                        color: sshCount > 0 ? "#ff4d4f" : "#52c41a",
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {sshCount}
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      Open SSH
                      <Tooltip 
                        placement="top" 
                        title="Restrict open SSH access by limiting inbound traffic to trusted IP addresses only."
                      >
                        <InfoCircleOutlined style={{ marginLeft: 6, color: "#ff4d4f" }} />
                      </Tooltip>
                    </div>
                    <div style={{ 
                      color: sshCount > 0 ? "#ff4d4f" : "#52c41a", 
                      fontWeight: 500,
                      fontSize: 14 
                    }}>
                      {sshCount > 0 ? "Needs attention" : "Secure"}
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Open RDP Card */}
          <Col xs={24} sm={12} md={6}>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              style={{ height: '100%' }}
            >
              <Card 
                hoverable={false}
                style={{ 
                  height: '100%',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
                bodyStyle={{ 
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between'
                }}
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
                    style={{ marginBottom: 8 }}
                  >
                    <DesktopOutlined style={{ fontSize: 32, color: "#722ed1" }} />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <motion.div
                      style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        margin: '8px 0',
                        color: RDPCount > 0 ? "#ff4d4f" : "#52c41a",
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {RDPCount}
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      Open RDP
                      <Tooltip 
                        placement="top" 
                        title="Restrict RDP (port 3389) access to Windows instances by allowing only trusted IP addresses"
                      >
                        <InfoCircleOutlined style={{ marginLeft: 6, color: "#8c8c8c" }} />
                      </Tooltip>
                    </div>
                    <div style={{ 
                      color: RDPCount > 0 ? "#ff4d4f" : "#52c41a", 
                      fontWeight: 500,
                      fontSize: 14 
                    }}>
                      {RDPCount > 0 ? "Needs attention" : "Secure"}
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* All Traffic Open Card */}
          <Col xs={24} sm={12} md={6}>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              style={{ height: '100%' }}
            >
              <Card 
                hoverable={false}
                style={{ 
                  height: '100%',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
                bodyStyle={{ 
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between'
                }}
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
                    style={{ marginBottom: 16 }}
                  >
                    <PortableWifiOffOutlined style={{ fontSize: 32, color: "#fa8c16" }} />
                  </motion.div>
                  <AnimatedProgress 
                    percent={IpPercent} 
                    strokeColor={IpPercent > 75 ? "#ff4d4f" : IpPercent > 50 ? "#fa8c16" : "#52c41a"}
                    delay={0.5}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ marginTop: 16 }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      All Traffic Open
                      <Tooltip 
                        placement="top" 
                        title="Restrict 'All Traffic' rules in security groups to only trusted sources and required ports."
                      >
                        <InfoCircleOutlined style={{ marginLeft: 6, color: "#8c8c8c" }} />
                      </Tooltip>
                    </div>
                    <div style={{ color: "#8c8c8c", fontSize: 14 }}>
                      {IpEnabledCount} of {total} ports
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

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
    </div>
  );
};

export default Securitygrp;


