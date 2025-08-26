

// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Tag,
//   Modal,
//   Descriptions,
//   Row,
//   Col,
//   Input,
//   Card,
   
//   Tooltip
// } from "antd";
// import {
//   EyeOutlined,
//   InfoCircleOutlined,
//   SearchOutlined
// } from "@ant-design/icons";

// import axios from "axios";

// const header = { backgroundColor: "#4f46e5", color: "white" };

// const Cloud_Trail = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedData, setSelectedData] = useState(null);
//   const [searchText, setSearchText] = useState("");
//   const API_URL = "http://13.212.15.14:8012/cloudtrail";

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(API_URL);
//         setData(response.data);
//       } catch (error) {
//         console.error("Error fetching CloudTrail data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Helper to get username from nested structure
//   const getRecordUsername = (record) => {
//     return (
//       record?.username ||
//       record?.user_name ||
//       record?.userName ||
//       record?.user_identity?.userName ||
//       record?.user_identity?.username ||
//       record?.user?.username ||
//       record?.user?.name ||
//       ""
//     ).toString();
//   };

//   // Unique values for filters
//   const accountIds = [...new Set(data.map(item => item.account_id))];
//   const usernames = [...new Set(data.map(getRecordUsername))];
//   const regions = [...new Set(data.map(item => item.aws_region))];
//   const events = [...new Set(data.map(item => item.event_name))];
//   const statuses = [...new Set(data.map(item => item.status))];

//   const handleOpenModal = (record) => {
//     setSelectedData(record);
//     setIsModalOpen(true);
//   };

//   const columns = [
//     {
//       title: (
//         <span>
//           Account ID{" "}
//           <Tooltip title="AWS account ID associated with the event.">
//             <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
//           </Tooltip>
//         </span>
//       ),
//       dataIndex: "account_id",
//       key: "account_id",
//       filters: accountIds.map(id => ({ text: id, value: id })),
//       onFilter: (value, record) => record.account_id === value
//     },
//     {
//       title: (
//         <span>
//           User Name{" "}
//           <Tooltip title="AWS user or role that performed the action.">
//             <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
//           </Tooltip>
//         </span>
//       ),
//       key: "username",
//       dataIndex: "username",
//       // filters: usernames.map(user => ({ text: user, value: user })),
//       // onFilter: (value, record) => getRecordUsername(record) === value,
//       // render: (_, record) => getRecordUsername(record)
//     },
//     {
//       title: (
//         <span>
//           Event Name{" "}
//           <Tooltip title="The API call made in AWS (e.g., RunInstances).">
//             <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
//           </Tooltip>
//         </span>
//       ),
//       dataIndex: "event_name",
//       key: "event_name",
//       filters: events.map(event => ({ text: event, value: event })),
//       onFilter: (value, record) => record.event_name === value
//     },
//     {
//       title: (
//         <span>
//           Resource Type{" "}
//           <Tooltip title="AWS service or resource involved in the event.">
//             <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
//           </Tooltip>
//         </span>
//       ),
//       dataIndex: "resource_type",
//       key: "resource_type"
//     },
//     {
//       title: (
//         <span>
//           Source IP{" "}
//           <Tooltip title="IP address where the event originated.">
//             <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
//           </Tooltip>
//         </span>
//       ),
//       dataIndex: "source_ip",
//       key: "source_ip"
//     },
//     {
//       title: (
//         <span>
//           Region{" "}
//           <Tooltip title="AWS region where the event occurred.">
//             <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
//           </Tooltip>
//         </span>
//       ),
//       dataIndex: "aws_region",
//       key: "aws_region",
//       filters: regions.map(r => ({ text: r, value: r })),
//       onFilter: (value, record) => record.aws_region === value
//     },
//     // {
//     //   title: (
//     //     <span>
//     //       Status{" "}
//     //       <Tooltip title="Enabled or Disabled status of the resource.">
//     //         <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
//     //       </Tooltip>
//     //     </span>
//     //   ),
//     //   dataIndex: "status",
//     //   key: "status",
//     //   filters: statuses.map(s => ({ text: s, value: s })),
//     //   onFilter: (value, record) => record.status === value,
//     //   render: (value) =>
//     //     value ? (
//     //       <Tag color={value === "Enabled" ? "green" : "red"}>{value}</Tag>
//     //     ) : (
//     //       "-"
//     //     )
//     // },
//     {
//       title: "More Details",
//       key: "action",
//       render: (_, record) => (
//         <Tooltip title="View Details">
//           <EyeOutlined
//             style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
//             onClick={() => handleOpenModal(record)}
//           />
//         </Tooltip>
//       )
//     }
//   ];

//   return (
//     <>
//       <h2
//         style={{
//           fontFamily: "Roboto, Helvetica, Arial, sans-serif",
//           fontWeight: 900,
//           fontSize: "23px",
//           color: "black"
//         }}
//       >
//         Cloud Trail
//       </h2>
//       <Row gutter={[16, 16]} style={{ marginBottom: 10, justifyContent: "flex-end" }}>
//         <Col>
//           <Input
//             placeholder="Search by Name"
//             prefix={<SearchOutlined />}
//             value={searchText}
//             onChange={handleSearch}
//             allowClear
//           />
//         </Col>
//       </Row>

//       <Table
//         columns={columns}
//         dataSource={data}
//         loading={loading}
//         rowKey={(record) =>
//           record.event_id || `${getRecordUsername(record)}-${record.event_time}`
//         }
//         pagination={{ pageSize: 8 }}
//       />

//       <Modal
//         title={`${selectedData?.account_name || ""} - Account Details`}
//         open={isModalOpen}
//         onCancel={() => setIsModalOpen(false)}
//         footer={null}
//         width={900}
//       >
//         {selectedData && (
//           <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={header}>
//             <Descriptions bordered column={2} size="small">
//               <Descriptions.Item label="Account ID">{selectedData.account_id}</Descriptions.Item>
//               <Descriptions.Item label="Username">{getRecordUsername(selectedData)}</Descriptions.Item>
//               <Descriptions.Item label="Event ID">{selectedData.event_id}</Descriptions.Item>
//               <Descriptions.Item label="Event Time">{selectedData.event_time}</Descriptions.Item>
//               <Descriptions.Item label="Resource Name">{selectedData.resource_name}</Descriptions.Item>
//               <Descriptions.Item label="Region">{selectedData.aws_region}</Descriptions.Item>
//             </Descriptions>
//           </Card>
//         )}
//       </Modal>
//     </>
//   );
// };

// export default Cloud_Trail;

import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Modal,
  Descriptions,
  Row,
  Col,
  Input,
  Card,
  Tooltip
} from "antd";
import {
  EyeOutlined,
  InfoCircleOutlined,
  SearchOutlined
} from "@ant-design/icons";
import axios from "axios";

const header = { backgroundColor: "#4f46e5", color: "white" };

const Cloud_Trail = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");

  const API_URL = "http://13.212.15.14:8012/cloudtrail";

  // Fetch data on load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching CloudTrail data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extract username safely
  const getRecordUsername = (record) => {
    return (
      record?.username ||
      record?.user_name ||
      record?.userName ||
      record?.user_identity?.userName ||
      record?.user_identity?.username ||
      record?.user?.username ||
      record?.user?.name ||
      ""
    ).toString();
  };

  // Unique values for filters
  const accountIds = [...new Set(data.map(item => item.account_id))];
  const regions = [...new Set(data.map(item => item.aws_region))];
  const events = [...new Set(data.map(item => item.event_name))];

  // Modal open
  const handleOpenModal = (record) => {
    setSelectedData(record);
    setIsModalOpen(true);
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Table Columns
  const columns = [
    {
      title: (
        <span>
          Account ID{" "}
          <Tooltip title="AWS account ID associated with the event.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "account_id",
      key: "account_id",
      filters: accountIds.map(id => ({ text: id, value: id })),
      onFilter: (value, record) => record.account_id === value
    },
    {
      title: (
        <span>
          User Name{" "}
          <Tooltip title="AWS user or role that performed the action.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      key: "username",
      render: (_, record) => getRecordUsername(record)
    },
    {
      title: (
        <span>
          Event Name{" "}
          <Tooltip title="The API call made in AWS (e.g., RunInstances).">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "event_name",
      key: "event_name",
      filters: events.map(event => ({ text: event, value: event })),
      onFilter: (value, record) => record.event_name === value
    },
    {
      title: (
        <span>
          Resource Type{" "}
          <Tooltip title="AWS service or resource involved in the event.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "resource_type",
      key: "resource_type"
    },
    {
      title: (
        <span>
          Source IP{" "}
          <Tooltip title="IP address where the event originated.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "source_ip",
      key: "source_ip"
    },
    {
      title: (
        <span>
          Region{" "}
          <Tooltip title="AWS region where the event occurred.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "aws_region",
      key: "aws_region",
      filters: regions.map(r => ({ text: r, value: r })),
      onFilter: (value, record) => record.aws_region === value
    },
    {
      title: "More Details",
      key: "action",
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

  // Filtered data by username search
  const filteredData = data.filter(item =>
    getRecordUsername(item).toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
     

      {/* Search input */}
      <Row gutter={[16, 16]} style={{ marginBottom: 5}}>
      <Col md={20}>
      <h2
        style={{
          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
          // fontWeight: 900,
          // fontSize: "23px",
          // color: "black"
        }}
      >
        Cloud Trail
      </h2>
  </Col>
  <Col md={4}>
          <Input
            placeholder="Search by Username"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            allowClear
            style={{ width: 220 }}
          />
        </Col>
      </Row>

      {/* Data Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey={(record) =>
          record.event_id || `${getRecordUsername(record)}-${record.event_time}`
        }
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
          <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={header}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">{selectedData.account_id}</Descriptions.Item>
              <Descriptions.Item label="Username">{getRecordUsername(selectedData)}</Descriptions.Item>
              <Descriptions.Item label="Event ID">{selectedData.event_id}</Descriptions.Item>
              <Descriptions.Item label="Event Time">{selectedData.event_time}</Descriptions.Item>
              <Descriptions.Item label="Resource Name">{selectedData.resource_name}</Descriptions.Item>
              <Descriptions.Item label="Region">{selectedData.aws_region}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>
    </>
  );
};

export default Cloud_Trail;
