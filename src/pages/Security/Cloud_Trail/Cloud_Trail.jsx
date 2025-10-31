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

const Cloud_Trail = () => {
  const [data, setData] = useState([]);
  console.log('data', data)
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");

  const API_URL = "http://13.212.15.14:8012/cloudtrail";
   let storedAccountId = localStorage.getItem("account_ids");

  // Fetch data on load
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);

    try {
      // ✅ Step 1: Normalize storedAccountId
      let storedIdValue = storedAccountId;
      try {
        const parsed = JSON.parse(storedAccountId);
        if (Array.isArray(parsed)) {
          storedIdValue = parsed[0]; // take first if it's an array
        } else {
          storedIdValue = parsed;
        }
      } catch {
        // if it's a normal string, ignore
      }

      const normalizeId = (id) => String(id).trim().toLowerCase();
      const storedId = normalizeId(storedIdValue);

      console.log("Normalized storedAccountId:", storedId);

      // ✅ Step 2: Fetch API
      const [response] = await Promise.all([axios.get(API_URL)]);

      // ✅ Step 3: Filter Data safely
      if (response?.data && Array.isArray(response.data)) {
        const filteredData = response.data.filter((item) => {
          const itemId =
            item.account_id ||
            item.accountId ||
            item.ACCOUNT_ID ||
            item.Account_ID;
          return normalizeId(itemId) === storedId;
        });

        console.log("Filtered Data 2222:", filteredData);
        setData(filteredData);

        if (filteredData.length === 0) {
          console.warn(`⚠️ No matching account found for ID: ${storedId}`);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching CloudTrail data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [storedAccountId]);


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
          Account Name{" "}
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
    <div className="p-6">
     

      {/* Search input */}
      <Row gutter={[16, 16]} style={{ marginBottom: 5}}>
      <Col md={19}>
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
Cloud Trail
</Typography.Title>
  </Col>
  <Col md={5}>
          <Input
            placeholder="Search by Username"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            allowClear
          
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
    </div>
  );
};

export default Cloud_Trail;
