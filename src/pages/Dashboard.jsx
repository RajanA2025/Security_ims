// import React, { lazy, Suspense } from 'react';
// import { Row, Col } from 'antd';

// const Chart = lazy(() => import('../components/dashboard/chart'));
// const DonutChart = lazy(() => import('../components/dashboard/donutchart'));
// const GraphChart = lazy(()=>import('../components/dashboard/graphchart'))
// function Dashboard() {
//   return (
//     <div>
//        {/* <Row gutter={16}>
//         <Col md={8}>
//           <Suspense fallback={<div>Loading Chart...</div>}>
//             <GraphChart />
//           </Suspense>
//         </Col>
//         <Col md={8}>
//           <Suspense fallback={<div>Loading Donut Chart...</div>}>
//             <GraphChart />
//           </Suspense>
//         </Col>
//         <Col md={8}>
//           <Suspense fallback={<div>Loading Donut Chart...</div>}>
//             <GraphChart />
//           </Suspense>
//         </Col>
//       </Row> */}
//       <Row gutter={16}>
//         <Col md={12}>
//           <Suspense fallback={<div>Loading Chart...</div>}>
           
//             <Chart/>
//           </Suspense>
//         </Col>
//         <Col md={12}>
//           <Suspense fallback={<div>Loading Donut Chart...</div>}>
//             <DonutChart />
//           </Suspense>
//         </Col>
//       </Row>
//     </div>
//   );
// }

// export default Dashboard;
  


import React, { useEffect, useState } from "react";
import axios from "axios"
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
  
  LockOutlined,
  SafetyCertificateOutlined,
  UserSwitchOutlined,
  SearchOutlined,
  InfoCircleOutlined ,
  DesktopOutlined,
  EyeOutlined,
  SecurityScanFilled,
} from "@ant-design/icons";
import { PortableWifiOffOutlined, SecuritySharp } from "@mui/icons-material";
const header = {
  backgroundColor: "#4f46e5",
  color: "white"
};

const Insights = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data1, setData1] = useState([]);
  const [filteredData1, setFilteredData1] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const API_URL = "http://13.212.15.14:8012/iam";
  const API_URL1 = "http://13.212.15.14:8012/security-groups";

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

    const fetchData1 = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL1);
        setData1(response.data);
        setFilteredData1(response.data); // show all initially
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData1();
  }, []);



  // const handleSearch = (e) => {
  //   const value = e.target.value;
  //   setSearchText(value);
  //   handleFilters(value, selectedAccountId);
  // };
  
  // const handleAccountChange = (value) => {
  //   setSelectedAccountId(value);
  //   handleFilters(searchText, value);
  // };

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

    //ststs
    const total1 = filteredData1.length;
  const sshCount = filteredData1.filter(
    (item) => item.from_port == 22
  ).length;
  const RDPCount = filteredData1.filter(
    (item) => item.from_port == 3389
  ).length;
  const OrphanedEnabledCount = filteredData1.filter((item) => item.is_orphaned).length;
  const IpEnabledCount = filteredData1.filter((item) => item.ip_range === "0.0.0.0/0")
    .length;

  const OrphanedPercent = total1
    ? Math.round((OrphanedEnabledCount / total1) * 100)
    : 0;
  const IpPercent = total1
    ? Math.round((IpEnabledCount / total1) * 100)
    : 0;


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
        <span style={{ color: "#888" }}>{OrphanedEnabledCount}/{total1} Security Groups</span>
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
    <Card hoverable style={{ textAlign: "center"}}>
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
