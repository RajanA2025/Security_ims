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

const Business = () => {
  const [originalData, setOriginalData] = useState([]); // full dataset
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");

  const API_URL = "http://47.130.218.97:8012/snapshots";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL);

        // Get stored Account IDs from localStorage
        const storedIds = JSON.parse(localStorage.getItem("account_ids")) || [];

        // If "ALL" → show everything
        const filtered = storedIds.includes("ALL")
          ? response.data
          : response.data.filter(item => storedIds.includes(item.account_id));

        // Store full dataset
        setOriginalData(filtered);

      } catch (error) {
        console.error("Error fetching CloudTrail data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Get Username Helper
  const getRecordUsername = (record) => {
    return (
      record?.account_name ||
      record?.accountName ||
      record?.user_identity?.accountName ||
      record?.user?.username ||
      record?.user?.name ||
      ""
    ).toString();
  };

  // Unique filter values
  const accountIds = [...new Set(originalData.map(item => item.account_id))];
  const regions = [...new Set(originalData.map(item => item.region))];
  const events = [...new Set(originalData.map(item => item.snapshot_name))];

  // Open Modal
  const handleOpenModal = (record) => {
    setSelectedData(record);
    setIsModalOpen(true);
  };

  // Search filters entire dataset
  const filteredData = searchText
    ? originalData.filter(item =>
        getRecordUsername(item)
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : originalData;

  // Table columns
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
      key: "account_name",
      render: (_, record) => getRecordUsername(record)
    },
    {
      title: (
        <span>
          Snapshot Name{" "}
          <Tooltip title="The snapshot name.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "snapshot_name",
      key: "snapshot_name",
      width: 200,
      filters: events.map(event => ({ text: event, value: event })),
      onFilter: (value, record) => record.snapshot_name === value
    },
    {
      title: "Snapshot Age",
      dataIndex: "snapshot_age_days",
      key: "snapshot_age_days",
      width: 120,
      render: (value) => {
        if (value == null) return "-";
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
      title: "Orphaned Volume",
      dataIndex: "orphaned_volume_or_attached",
      key: "orphaned_volume_or_attached",
      render: (value) => {
        const text = String(value || "").toLowerCase();
        let color = "default";
        let label = value;

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

  return (
    <div className="p-3">
      {/* Search */}
      <Row gutter={[16, 16]} style={{ marginBottom: 10, marginTop: 10 }}>
        <Col md={20}>
          <Typography.Title
            level={4}
            style={{
              fontFamily: "Roboto, Segoe UI, sans-serif",
              fontSize: "20px",
               fontWeight: 600,
                          color: "#1f2937",
              margin: 0
            }}
          >
            SnapShots
          </Typography.Title>
        </Col>
        <Col md={4}>
          <Input
            placeholder="Search by Account Name"
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
        rowKey={(record) =>
          record.snapshot_id || `${getRecordUsername(record)}-${record.snapshot_name}`
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
              <Descriptions.Item label="Account Name">{getRecordUsername(selectedData)}</Descriptions.Item>
              <Descriptions.Item label="Instance ID">{selectedData.instance_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Instance Name">{selectedData.instance_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Volume ID">{selectedData.volume_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Volume Name">{selectedData.volume_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Orphaned">{selectedData.orphaned || "-"}</Descriptions.Item>
              <Descriptions.Item label="Region">{selectedData.region}</Descriptions.Item>
              <Descriptions.Item label="Snapshot ID">{selectedData.snapshot_id}</Descriptions.Item>
              <Descriptions.Item label="Snapshot Name">{selectedData.snapshot_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Snapshot Description">{selectedData.snapshot_description || "-"}</Descriptions.Item>
              <Descriptions.Item label="Snapshot Created On">{selectedData.snapshot_creation_date || "-"}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default Business;
