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
  Tooltip,
  Typography
} from "antd";
import {
  EyeOutlined,
  InfoCircleOutlined,
  SearchOutlined
} from "@ant-design/icons";
import axios from "axios";

const header = { backgroundColor: "#4f46e5", color: "white" };

const Amis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");

  const API_URL = "http://47.130.218.97:8012/amis";

  // Fetch data on load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Read stored account IDs
        let stored = localStorage.getItem("account_ids");

        // Convert safely into array
        try {
          stored = JSON.parse(stored);
        } catch {
          stored = [stored];
        }

        const storedIds = Array.isArray(stored) ? stored : [stored];

        // POST body
        const postBody = {
          account_ids: storedIds,
        };

        console.log("➡️ POST Body:", postBody);

        // POST request
        const response = await axios.post(
          "http://47.130.218.97:8012/amis/filter",
          postBody,
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("📌 API Response:", response.data);

        // Backend already filters by account_ids
        setData(response.data);
      } catch (error) {
        console.error("❌ Error fetching AMI data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // Extract username safely
  const getRecordUsername = (record) => {
    return (
      record?.ami_name ||
      record?.amiName ||
      record?.aminame ||

      ""
    ).toString();
  };

  // Unique values for filters
  const accountIds = [...new Set(data.map(item => item.owner_id))];
  const regions = [...new Set(data.map(item => item.region))];
  const platform = [...new Set(data.map(item => item.platform))];
  const Image = [...new Set(data.map(item => item.image_state))];
  const events = [...new Set(data.map(item => item.ami_name


  ))];

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
      dataIndex: "owner_id",
      key: "owner_id",
      filters: accountIds.map(id => ({ text: id, value: id })),
      onFilter: (value, record) => record.owner_id === value
    },
    // {
    //   title: (
    //     <span>
    //       Account Name{" "}
    //       <Tooltip title="AWS user or role that performed the action.">
    //         <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
    //       </Tooltip>
    //     </span>
    //   ),

    //   key: "account_name",
    //   render: (_, record) => getRecordUsername(record)
    // },
    {
      title: (
        <span>
          AMI Name{" "}
          <Tooltip title="The API call made in AWS (e.g., RunInstances).">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "ami_name",
      key: "ami_name",
      filters: events.map(event => ({ text: event, value: event })),
      onFilter: (value, record) => record.ami_name === value
    },
    {
      title: "Age",
      dataIndex: "age_in_days",
      key: "age_in_days",
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
      title: "Image State",
      dataIndex: "image_state",
      key: "image_state",
      width: 100,
      filters: Image.map(event => ({ text: event, value: event })),
      onFilter: (value, record) => record.image_state === value,
      render: (value) => {
        // Support both boolean and string statuses
        // if (typeof value === "boolean") {
        //   return (
        //     <Tag color={value ? "green" : "red"}>{value ? "Available" : "Deleted"}</Tag>
        //   );
        // }

        const text = String(value || "").toLowerCase();
        let color = "default";
        let label = String(value || "");

        if (text === "attached") {
          color = "blue";
          label = "Attached";
        } else if (text === "deleted") {
          color = "red";
          label = "Deleted";
        } else if (text === "available") {
          color = "green";
          label = "Available";
        }

        return <Tag color={color}>{label}</Tag>;
      }
    },
    // {
    //   title: (
    //     <span>
    //       Source IP{" "}
    //       <Tooltip title="IP address where the event originated.">
    //         <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
    //       </Tooltip>
    //     </span>
    //   ),
    //   dataIndex: "source_ip",
    //   key: "source_ip"
    // },
    {
      title: (
        <span>
          Region{" "}
          <Tooltip title="AWS region where the event occurred.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "region",
      key: "region",
      filters: regions.map(r => ({ text: r, value: r })),
      onFilter: (value, record) => record.region === value
    },
    {
      title: (
        <span>
          Platform{" "}
          <Tooltip title="AWS region where the event occurred.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "platform",
      key: "platform",
      filters: platform.map(r => ({ text: r, value: r })),
      onFilter: (value, record) => record.platform === value
    },
    {
      title: (
        <span>
          usage_count{" "}
          <Tooltip title="AWS region where the event occurred.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "usage_count",
      key: "usage_count",
      // filters: regions.map(r => ({ text: r, value: r })),
      // onFilter: (value, record) => record.region === value
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

  // Filter based on stored account IDs from localStorage
  const filteredData = data.filter(item =>
    getRecordUsername(item).toLowerCase().includes(searchText.toLowerCase())
  );



  return (
    < div className="p-3">


      {/* Search input */}
      <Row gutter={[16, 16]} style={{ marginBottom: 5, marginTop: 10 }}>
        <Col md={20}>
          <Typography.Title
            level={4}
            style={{
              fontFamily: "'Roboto', 'Segoe UI', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
              color: "#1f2937",
              margin: 0
            }}
          >
            AMI
          </Typography.Title>
        </Col>
        <Col md={4}>
          <Input
            placeholder="Seadch by AMI Name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            allowClear
          // style={{ width: 220 }}
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
              <Descriptions.Item label="Account ID">{selectedData.owner_id}</Descriptions.Item>
              {/* <Descriptions.Item label="AcoountName">{getRecordUsername(selectedData)}</Descriptions.Item> */}
              <Descriptions.Item label="AMI ID">{selectedData.ami_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="AMI Ndame">{selectedData.ami_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="AWS Account ">{selectedData.aws_account || "-"}</Descriptions.Item>
              <Descriptions.Item label="Platform">{selectedData.platform || "-"}</Descriptions.Item>
              <Descriptions.Item label="Encrypted">{selectedData.encrypted || "-"}</Descriptions.Item>
              <Descriptions.Item label="Region">{selectedData.region}</Descriptions.Item>
              <Descriptions.Item label="Iamge State">{selectedData.image_state}</Descriptions.Item>
              <Descriptions.Item label="Architecture">{selectedData.architecture || "-"}</Descriptions.Item>
              <Descriptions.Item label="Usage Count ">{selectedData.usage_count || "-"}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedData.description || "-"}</Descriptions.Item>

            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default Amis;
