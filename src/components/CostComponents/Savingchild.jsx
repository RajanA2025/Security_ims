// // File: src/pages/SavingsChild.jsx
// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Table,
//   Tabs,
//   Dropdown,
//   Button,
//   Tag,
//   Card,
//   Row,
//   Col,
//   Typography,
//   Select,
// } from "antd";
// import { createStyles } from "antd-style";
// import { DownOutlined } from "@ant-design/icons";
// import {
//   DollarOutlined,
//   DatabaseOutlined,
//   FileImageOutlined,
//   GlobalOutlined,
// } from "@ant-design/icons";
// import axios from "axios";

// const { Text } = Typography;
// const { Option } = Select;

// const useStyle = createStyles(({ css, token }) => {
//   const { antCls } = token;
//   return {
//     customTable: css`
//       ${antCls}-table {
//         ${antCls}-table-container {
//           ${antCls}-table-body,
//           ${antCls}-table-content {
//             scrollbar-width: thin;
//             scrollbar-color: #eaeaea transparent;
//             scrollbar-gutter: stable;
//           }
//         }
//       }
//     `,
//   };
// });

// const actionStatus = {
//   assigned: "Assigned",
//   unassigned: "Unassigned",
//   realized: "Realized",
// };

// const calculateTotalCost = (data) =>
//   data.reduce((sum, item) => sum + parseFloat(item.costing?.replace("$", "") || 0), 0);

// const getUniqueFilters = (data, key) => {
//   return [...new Set(data.map((item) => item[key]))].map((value) => ({
//     text: value,
//     value,
//   }));
// };

// const SavingsChild = () => {
//   const { styles } = useStyle();

//   const [orphanedDisks, setOrphanedDisks] = useState([]);
//   const [orphanedElasticIP, setOrphanedElasticIP] = useState([]);
//   const [orphanedSnapshots, setOrphanedSnapshots] = useState([]);
//   const [riSavings, setRiSavings] = useState([]);
//   const [rightsizing, setRightsizing] = useState([]);
//   const [rightsizingFilter, setRightsizingFilter] = useState("underutilized_ec2");

//   const [filter, setFilter] = useState("All");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get("http://13.212.15.14:8003/resources");
//         const data = res.data;

//         setOrphanedDisks(
//           data.orphaned_volumes.map((item, i) => ({
//             key: `disk-${i}`,
//             accountId: item.account_id,
//             region: item.region,
//             volumeId: item.volume_id,
//             volumeName: item.volume_name || "-",
//             volumeType: item.volume_type,
//             volumeSize: `${item.volume_size} GB`,
//             costing: `$${item.cost_savings}`,
//             recommendation: item.recommendations?.suggestion || "-",
//             Action: item.status,
//           }))
//         );

//         setOrphanedElasticIP(
//           data.orphaned_eips.map((item, i) => ({
//             key: `eip-${i}`,
//             accountId: item.account_id,
//             region: item.region,
//             volumeId: item.public_ip,
//             volumeName: item.allocation_id,
//             volumeType: "Elastic IP",
//             volumeSize: "-",
//             costing: `$${item.cost_savings}`,
//             recommendation: "-",
//             Action: item.status,
//           }))
//         );

//         setOrphanedSnapshots(
//           data.orphaned_snapshots.map((item, i) => ({
//             key: `snapshot-${i}`,
//             accountId: item.account_id,
//             region: item.region,
//             volumeId: item.snapshot_id,
//             volumeName: item.snapshot_name || "-",
//             volumeType: "Snapshot",
//             volumeSize: `${item.size || 0} GB`,
//             costing: `$${item.cost_savings || 0}`,
//             recommendation: "-",
//             Action: item.status,
//           }))
//         );

//         setRiSavings(
//           data.underutilized_ec2.map((item, i) => ({
//             key: `ri-${i}`,
//             accountId: item.account_id,
//             region: item.region,
//             volumeId: item.instance_id,
//             volumeName: item.instance_name || "-",
//             volumeType: item.instance_type,
//             volumeSize: "-",
//             costing: `$${item.cost_savings}`,
//             recommendation: item.recommendations?.suggestion || "-",
//             Action: item.status,
//           }))
//         );

//         // Set Rightsizing data for both EC2 and EBS
//         const ec2Data =
//           data.underutilized_ec2?.map((item, i) => ({
//             key: `rs-ec2-${i}`,
//             accountId: item.account_id,
//             region: item.region,
//             instanceId: item.instance_id,
//             instanceName: item.instance_name || "-",
//             instancetype: item.instance_type,
//             recommendedType: item.recommendations?.suggestion || "-",
//             Reason: item.recommendations?.reason || "-",
//             costSaving: `$${item.cost_savings}`,
//             Action: item.status,
//           })) || [];

//         const ebsData =
//           data.underutilized_ebs?.map((item, i) => ({
//             key: `rs-ebs-${i}`,
//             accountId: item.account_id,
//             region: item.region,
//             volumeId: item.volume_id,
//             volumeName: item.volume_name || "-",
//             volumeType: item.volume_type,
//             volumeSize: item.volume_size,
//             recommendedType: item.recommendations?.suggestion || "-",
//             Reason: item.recommendations?.reason || "-",
//             costSaving: `$${item.cost_savings}`,
//             Action: item.status,
//           })) || [];

//         setRightsizing({ underutilized_ec2: ec2Data, underutilized_ebs: ebsData });
//       } catch (err) {
//         console.error("Error fetching savings data:", err);
//       }
//     };

//     fetchData();
//   }, []);

//   const combinedData = useMemo(() => {
//     let allData = [
//       ...orphanedDisks.map((item) => ({ ...item, resourceType: "Disk" })),
//       ...orphanedElasticIP.map((item) => ({ ...item, resourceType: "Elastic IP" })),
//       ...orphanedSnapshots.map((item) => ({ ...item, resourceType: "Snapshot" })),
//       ...riSavings.map((item) => ({ ...item, resourceType: "RI/Savings" })),
//     ];
//     if (filter !== "All") {
//       allData = allData.filter((item) => item.resourceType === filter);
//     }
//     return allData;
//   }, [orphanedDisks, orphanedElasticIP, orphanedSnapshots, riSavings, filter]);

//   const combinedColumns = [
//     {
//       title: "Resource Type",
//       dataIndex: "resourceType",
//       width: 150,
//       filters: [
//         { text: "Disk", value: "Disk" },
//         { text: "Elastic IP", value: "Elastic IP" },
//         { text: "Snapshot", value: "Snapshot" },
//         { text: "RI/Savings", value: "RI/Savings" },
//       ],
//       onFilter: (value, record) => record.resourceType === value,
//       render: (type) => {
//         let color, icon;
//         switch (type) {
//           case "Disk":
//             color = "blue";
//             icon = <DatabaseOutlined />;
//             break;
//           case "Elastic IP":
//             color = "purple";
//             icon = <GlobalOutlined />;
//             break;
//           case "Snapshot":
//             color = "orange";
//             icon = <FileImageOutlined />;
//             break;
//           case "RI/Savings":
//             color = "green";
//             icon = <DollarOutlined />;
//             break;
//           default:
//             color = "default";
//         }
//         return <Tag color={color} icon={icon}>{type}</Tag>;
//       },
//     },
//     {
//       title: "Account ID",
//       dataIndex: "accountId",
//       width: 150,
//       filters: getUniqueFilters(combinedData, "accountId"),
//       onFilter: (value, record) => record.accountId === value,
//     },
//     {
//       title: "Region",
//       dataIndex: "region",
//       width: 120,
//       filters: getUniqueFilters(combinedData, "region"),
//       onFilter: (value, record) => record.region === value,
//     },
//     {
//       title: "Volume ID",
//       dataIndex: "volumeId",
//       width: 180,
//       filters: getUniqueFilters(combinedData, "volumeId"),
//       onFilter: (value, record) => record.volumeId === value,
//     },
//     {
//       title: "Volume Name",
//       dataIndex: "volumeName",
//       width: 180,
//       filters: getUniqueFilters(combinedData, "volumeName"),
//       onFilter: (value, record) => record.volumeName === value,
//     },
//     {
//       title: "Volume Type",
//       dataIndex: "volumeType",
//       width: 140,
//       filters: getUniqueFilters(combinedData, "volumeType"),
//       onFilter: (value, record) => record.volumeType === value,
//     },
//     {
//       title: "Volume Size",
//       dataIndex: "volumeSize",
//       width: 140,
//       filters: getUniqueFilters(combinedData, "volumeSize"),
//       onFilter: (value, record) => record.volumeSize === value,
//     },
//     {
//       title: "Costing",
//       dataIndex: "costing",
//       width: 120,
//       sorter: (a, b) =>
//         parseFloat(a.costing.replace("$", "")) - parseFloat(b.costing.replace("$", "")),
//     },
//     {
//       title: "Recommendation",
//       dataIndex: "recommendation",
//       width: 200,
//       filters: getUniqueFilters(combinedData, "recommendation"),
//       onFilter: (value, record) => record.recommendation === value,
//     },
//     {
//       title: "Status",
//       dataIndex: "action",
//       width: 150,
//       filters: [
//         { text: "Assigned", value: "Assigned" },
//         { text: "Unassigned", value: "Unassigned" },
//         { text: "Realized", value: "Realized" },
//       ],
//       onFilter: (value, record) => record.action === value,
//       render: (value) => {
//         const status = value || "Unassigned"; // default to Unassigned
//         if (status === "Assigned") return <Tag color="blue">{status}</Tag>;
//         if (status === "Unassigned") return <Tag color="orange">{status}</Tag>;
//         if (status === "Realized") return <Tag color="green">{status}</Tag>;
//         return <Tag color="default">{status}</Tag>;
//       },

//     },
//     {
//       title: "Action",
//       width: 150,
//       fixed: "right",
//       render: (_, record) => {
//         const handleActionClick = ({ key }) => {
//           const allSets = [
//             { data: orphanedDisks, setter: setOrphanedDisks },
//             { data: orphanedElasticIP, setter: setOrphanedElasticIP },
//             { data: orphanedSnapshots, setter: setOrphanedSnapshots },
//             { data: riSavings, setter: setRiSavings },
//           ];
//           for (let { data, setter } of allSets) {
//             if (data.find((item) => item.key === record.key)) {
//               setter(prev =>
//                 prev.map(item =>
//                   item.key === record.key ? { ...item, action: actionStatus[key] } : item
//                 )
//               );
//               break;
//             }
//           }
//         };
//         return (
//           <Dropdown
//             menu={{
//               items: [
//                 { key: "assigned", label: actionStatus.assigned },
//                 { key: "realized", label: actionStatus.realized },
//               ],
//               onClick: handleActionClick,
//             }}
//             trigger={["click"]}
//           >
//             <Button type="link">Take Action <DownOutlined /></Button>
//           </Dropdown>
//         );
//       },
//     },
//   ];
//   const getColumns = (filterType) => {
//     if (filterType === "underutilized_ec2") {
//       return [
//         { title: "Account ID", dataIndex: "accountId", width: 150 },
//         { title: "Region", dataIndex: "region", width: 120 },
//         { title: "Instance ID", dataIndex: "instanceId", width: 180 },
//         { title: "Instance Name", dataIndex: "instanceName", width: 180 },
//         { title: "Instance Type", dataIndex: "instancetype", width: 140 },
//         { title: "Recommended Type", dataIndex: "recommendedType", width: 160 },
//         { title: "Reason", dataIndex: "Reason", width: 160 },
//         {
//           title: "Cost Saving",
//           dataIndex: "costSaving",
//           width: 120,
//           sorter: (a, b) =>
//             parseFloat(a.costSaving.replace("$", "")) -
//             parseFloat(b.costSaving.replace("$", "")),
//         },
//         {
//           title: "Status",
//           dataIndex: "action",
//           width: 150,
//           render: (value) => {
//             const status = value ?? "Unassigned";
//             let color = "default";
//             if (status === "Assigned") color = "blue";
//             else if (status === "Unassigned") color = "orange";
//             else if (status === "Realized") color = "green";
//             return <Tag color={color}>{status}</Tag>;
//           },
//         },
//         {
//           title: "Action",
//           width: 150,
//           fixed: "right",
//           render: (_, record) => {
//             const handleActionClick = ({ key }) => {
//               setRightsizing((prev) => ({
//                 ...prev,
//                 [rightsizingFilter]: prev[rightsizingFilter].map((item) =>
//                   item.key === record.key
//                     ? { ...item, action: actionStatus[key] }
//                     : item
//                 ),
//               }));
//             };
//             return (
//               <Dropdown
//                 menu={{
//                   items: [
//                     { key: "assigned", label: actionStatus.assigned },
//                     { key: "realized", label: actionStatus.realized },
//                   ],
//                   onClick: handleActionClick,
//                 }}
//                 trigger={["click"]}
//               >
//                 <Button type="link">
//                   Take Action <DownOutlined />
//                 </Button>
//               </Dropdown>
//             );
//           },
//         },
//       ];
//     } else if (filterType === "underutilized_ebs") {
//       return [
//         { title: "Account ID", dataIndex: "accountId", width: 150 },
//         { title: "Region", dataIndex: "region", width: 120 },
//         { title: "Volume ID", dataIndex: "volumeId", width: 180 },
//         { title: "Volume Name", dataIndex: "volumeName", width: 180 },
//         { title: "Volume Type", dataIndex: "volumeType", width: 140 },
//         { title: "Volume Size (GB)", dataIndex: "volumeSize", width: 140 },
//         { title: "Reason", dataIndex: "Reason", width: 160 },
//         {
//           title: "Cost Saving",
//           dataIndex: "costSaving",
//           width: 120,
//           sorter: (a, b) =>
//             parseFloat(a.costSaving.replace("$", "")) -
//             parseFloat(b.costSaving.replace("$", "")),
//         },
//         {
//           title: "Status",
//           dataIndex: "action",
//           width: 150,
//           render: (value) => {
//             const status = value ?? "Unassigned";
//             let color = "default";
//             if (status === "Assigned") color = "blue";
//             else if (status === "Unassigned") color = "orange";
//             else if (status === "Realized") color = "green";
//             return <Tag color={color}>{status}</Tag>;
//           },
//         },
//         {
//           title: "Action",
//           width: 150,
//           fixed: "right",
//           render: (_, record) => {
//             const handleActionClick = ({ key }) => {
//               setRightsizing((prev) => ({
//                 ...prev,
//                 [rightsizingFilter]: prev[rightsizingFilter].map((item) =>
//                   item.key === record.key
//                     ? { ...item, action: actionStatus[key] }
//                     : item
//                 ),
//               }));
//             };
//             return (
//               <Dropdown
//                 menu={{
//                   items: [
//                     { key: "assigned", label: actionStatus.assigned },
//                     { key: "realized", label: actionStatus.realized },
//                   ],
//                   onClick: handleActionClick,
//                 }}
//                 trigger={["click"]}
//               >
//                 <Button type="link">
//                   Take Action <DownOutlined />
//                 </Button>
//               </Dropdown>
//             );
//           },
//         },
//       ];
//     }
//   };


//   const [activeTab, setActiveTab] = useState("summary"); // controlled tab
//   const tabs = [
//     {
//       key: "summary",
//       label: "Summary",
//       children: (
//         <div>
//           <Row gutter={[16, 16]}>
//             <Col xs={24} sm={12} md={6}>
//               <Card bordered hoverable onClick={() => setActiveTab("all")}>
//                 <h3>Orphaned Disks</h3>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: 8 }}>
//                   <Tag color="blue" icon={<DatabaseOutlined />}>{orphanedDisks.length}</Tag>
//                   <Text strong style={{ color: "blue" }}>
//                     Total Cost: ${calculateTotalCost(orphanedDisks).toFixed(2)}
//                   </Text>
//                 </div>
//               </Card>
//             </Col>
//             <Col xs={24} sm={12} md={6}>
//               <Card bordered hoverable onClick={() => setActiveTab("all")}>
//                 <h3>Orphaned Elastic IPs</h3>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: 8 }}>
//                   <Tag color="purple" icon={<GlobalOutlined />}>{orphanedElasticIP.length}</Tag>
//                   <Text strong style={{ color: "purple" }}>
//                     Total Cost: ${calculateTotalCost(orphanedElasticIP).toFixed(2)}
//                   </Text>
//                 </div>
//               </Card>
//             </Col>
//             <Col xs={24} sm={12} md={6}>
//               <Card bordered hoverable onClick={() => setActiveTab("all")}>
//                 <h3>Orphaned Snapshots</h3>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: 8 }}>
//                   <Tag color="orange" icon={<FileImageOutlined />}>{orphanedSnapshots.length}</Tag>
//                   <Text strong style={{ color: "orange" }}>
//                     Total Cost: ${calculateTotalCost(orphanedSnapshots).toFixed(2)}
//                   </Text>
//                 </div>
//               </Card>
//             </Col>
//             {/* <Col xs={24} sm={12} md={6}>
//               <Card bordered hoverable>
//                 <h3>RI / Savings</h3>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: 8 }}>
//                   <Tag color="green" icon={<DollarOutlined />}>{riSavings.length}</Tag>
//                   <Text strong style={{ color: "green" }}>
//                     Total Cost: ${calculateTotalCost(riSavings).toFixed(2)}
//                   </Text>
//                 </div>
//               </Card>
//             </Col> */}

//             {/* Rightsizing summary card */}
//             <Col xs={24} sm={12} md={6}>
//               <Card bordered hoverable onClick={() => setActiveTab("rightsizing")}>
//                 <h3>Rightsizing</h3>
//                 <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: 8 }}>
//                   <Tag color="cyan">{rightsizing[rightsizingFilter]?.length || 0}</Tag>
//                   <Text strong style={{ color: "cyan" }}>
//                     Total Savings: ${calculateTotalCost(rightsizing[rightsizingFilter] || []).toFixed(2)}
//                   </Text>
//                 </div>
//               </Card>
//             </Col>
//           </Row>
//         </div>
//       ),
//     },
//     {
//       key: "all",
//       label: "Orphaned",
//       children: (
//         <div>
//           <Select
//             value={filter}
//             onChange={(value) => setFilter(value)}
//             style={{ width: 120, marginBottom: 16 }}
//           >
//             <Option value="All">All Resources</Option>
//             <Option value="Disk">Disks</Option>
//             <Option value="Elastic IP">Elastic IPs</Option>
//             <Option value="Snapshot">Snapshots</Option>
//             {/* <Option value="RI/Savings">RI/Savings</Option> */}
//           </Select>

//           <Table
//             className={styles.customTable}
//             columns={combinedColumns}
//             dataSource={combinedData}
//             pagination={{ pageSize: 10 }}
//             scroll={{ x: 1500, y: 500 }}
//           />
//         </div>
//       ),
//     },
//     {
//       key: "rightsizing",
//       label: "Rightsizing",
//       children: (
//         <div>
//           {/* Filter dropdown for EC2 / EBS */}
//           <Select
//             value={rightsizingFilter}
//             onChange={(value) => setRightsizingFilter(value)}
//             style={{ width: 180, marginBottom: 16 }}
//           >
//             <Option value="underutilized_ec2">Underutilized EC2</Option>
//             <Option value="underutilized_ebs">Underutilized EBS</Option>
//           </Select>

//           <Table
//             columns={getColumns(rightsizingFilter)}
//             dataSource={rightsizing[rightsizingFilter] || []}
//             pagination={{ pageSize: 10 }}
//             scroll={{ x: 1200, y: 500 }}
//           />

//         </div>
//       ),
//     },


//   ];

//   return <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} items={tabs} />;
// };

// // export default SavingsChild;


import React from 'react'

function Savingchild() {
  return (
    <div>Savingchild</div>
  )
}

export default Savingchild