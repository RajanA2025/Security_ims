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

const { Title } = Typography;
const header = { backgroundColor: "#4f46e5", color: "white" };

const Amis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Robust helper to parse account_ids from localStorage
  const parseStoredAccountIds = () => {
    let raw = null;
    try {
      raw = localStorage.getItem("account_ids");
    } catch (err) {
      // localStorage not available (SSR or restricted), return empty
      // eslint-disable-next-line no-console
      console.warn("localStorage unavailable:", err);
      return [];
    }

    if (raw == null) return [];

    // Attempt JSON parse
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v ?? "").trim()).filter(Boolean);
      }
      if (typeof parsed === "string" || typeof parsed === "number") {
        const s = String(parsed).trim();
        if (s === "") return [];
        // If comma-separated string inside JSON, split
        if (s.includes(",")) return s.split(",").map((v) => v.trim()).filter(Boolean);
        return [s];
      }
      // Fallback: try to coerce to string
      return [String(parsed ?? "").trim()].filter(Boolean);
    } catch {
      // Not JSON — treat as CSV or single string
      const s = String(raw);
      if (s.includes(",")) return s.split(",").map((v) => v.trim()).filter(Boolean);
      if (s.trim() === "") return [];
      return [s.trim()];
    }
  };

  // Fetch data on load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const storedIds = parseStoredAccountIds();

        // If no account ids — short-circuit
        if (storedIds.length === 0) {
          setData([]);
          return;
        }

        const postBody = {
          account_ids: storedIds,
        };

        // POST request with response normalization
        const response = await axios.post(
          "http://47.130.218.97:8012/amis/filter",
          postBody,
          { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );

        // Normalize response shapes:
        // Accept: response.data (array) OR response.data.results OR response.data.data
        const resp = response?.data;
        let normalized = [];
        if (Array.isArray(resp)) {
          normalized = resp;
        } else if (Array.isArray(resp?.results)) {
          normalized = resp.results;
        } else if (Array.isArray(resp?.data)) {
          normalized = resp.data;
        } else if (resp && typeof resp === "object") {
          // maybe backend returned single object -> wrap into array
          // or it returned { items: [...] } style -> attempt to find first array
          const maybeArray = Object.values(resp).find((v) => Array.isArray(v));
          normalized = maybeArray || [];
        } else {
          normalized = [];
        }

        // Ensure each item is an object
        normalized = normalized.map((it) => (it && typeof it === "object" ? it : {}));

        setData(normalized);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("❌ Error fetching AMI data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Extract readable name from a record (safe)
  const getRecordUsername = (record) => {
    const name =
      record?.ami_name ??
      record?.amiName ??
      record?.aminame ??
      record?.name ??
      "";
    return String(name).trim();
  };

  // Unique values for filters (safe, trimmed)
  const accountIds = [...new Set(data.map((item) => String(item?.owner_id ?? "").trim()).filter(Boolean))];
  const regions = [...new Set(data.map((item) => String(item?.region ?? "").trim()).filter(Boolean))];
  const platform = [...new Set(data.map((item) => String(item?.platform ?? "").trim()).filter(Boolean))];
  const Image = [...new Set(data.map((item) => String(item?.image_state ?? "").trim()).filter(Boolean))];
  const events = [...new Set(data.map((item) => String(item?.ami_name ?? "").trim()).filter(Boolean))];

  // Modal open
  const handleOpenModal = (record) => {
    setSelectedData(record ?? null);
    setIsModalOpen(true);
  };

  // Safe close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchText(e?.target?.value ?? "");
  };

  // Age rendering with blink keyframes (blink CSS added below)
  const renderAge = (value) => {
    if (value == null || value === "" || Number.isNaN(Number(value))) {
      return "-";
    }
    const num = Number(value);
    let color = "#52c41a";
    let doBlink = false;

    if (num > 90) {
      color = "#ff4d4f";
      doBlink = true;
    } else if (num > 60) {
      color = "#fa8c16";
    } else if (num > 30) {
      color = "#faad14";
    }

    return (
      <span
        style={{
          color,
          fontWeight: "bold",
          animation: doBlink ? "blink 1s infinite" : "none",
        }}
      >
        {num} days
      </span>
    );
  };

  // Image state renderer (supports boolean and strings)
  const renderImageStateTag = (value) => {
    const v = (value === true || value === false) ? (value ? "available" : "deleted") : String(value ?? "").trim().toLowerCase();
    let color = "default";
    let label = String(value ?? "");

    if (v === "attached") {
      color = "blue";
      label = "Attached";
    } else if (v === "deleted" || v === "deregistered") {
      color = "red";
      label = "Deleted";
    } else if (v === "available" || v === "true") {
      color = "green";
      label = "Available";
    } else if (v === "") {
      color = "default";
      label = "Unknown";
    } else {
      // any other custom state
      color = "default";
      label = String(value);
    }

    return <Tag color={color}>{label}</Tag>;
  };

  // Table Columns
  const columns = [
    {
      title: (
        <span>
          Account ID{" "}
          <Tooltip title="AWS account ID associated with this AMI.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "owner_id",
      key: "owner_id",
      filters: accountIds.map((id) => ({ text: id, value: id })),
      onFilter: (value, record) => String(record?.owner_id ?? "") === String(value),
    },
    {
      title: (
        <span>
          AMI Name{" "}
          <Tooltip title="AMI name from AWS resources">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "ami_name",
      key: "ami_name",
      filters: events.map((ev) => ({ text: ev, value: ev })),
      onFilter: (value, record) => String(record?.ami_name ?? "").trim() === String(value).trim(),
      render: (_, record) => getRecordUsername(record),
    },
    {
      title: "Age",
      dataIndex: "age_in_days",
      key: "age_in_days",
      width: 100,
      render: (value) => renderAge(value),
    },
    {
      title: "Image State",
      dataIndex: "image_state",
      key: "image_state",
      width: 120,
      filters: Image.map((ev) => ({ text: ev, value: ev })),
      onFilter: (value, record) => String(record?.image_state ?? "").trim() === String(value).trim(),
      render: (value) => renderImageStateTag(value),
    },
    {
      title: (
        <span>
          Region{" "}
          <Tooltip title="AWS region where the AMI is located.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "region",
      key: "region",
      filters: regions.map((r) => ({ text: r, value: r })),
      onFilter: (value, record) => String(record?.region ?? "") === String(value),
    },
    {
      title: (
        <span>
          Platform{" "}
          <Tooltip title="OS platform of the AMI.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "platform",
      key: "platform",
      filters: platform.map((r) => ({ text: r, value: r })),
      onFilter: (value, record) => String(record?.platform ?? "") === String(value),
    },
    {
      title: "Usage Count",
      dataIndex: "usage_count",
      key: "usage_count",
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
      ),
    },
  ];

  // Filter based on stored account IDs and search text
  const filteredData = data
    .filter((item) => {
      // if search text present, filter by ami name (safe)
      if (searchText && String(searchText).trim() !== "") {
        return getRecordUsername(item).toLowerCase().includes(searchText.toLowerCase());
      }
      return true;
    });

  return (
    <div className="p-3">
      {/* Search input */}
      <Row gutter={[16, 16]} style={{ marginBottom: 5, marginTop: 10 }}>
        <Col md={20}>
          <Title
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
          </Title>
        </Col>
        <Col md={4}>
          <Input
            placeholder="Search by AMI Name"
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
          record.event_id || `${getRecordUsername(record)}-${record.event_time ?? ""}`
        }
        pagination={{ pageSize: 8 }}
      />

      {/* Modal */}
      <Modal
        title={`${selectedData?.ami_name ? selectedData.ami_name : selectedData?.owner_id ?? "AMI Details"}`}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={900}
      >
        {selectedData ? (
          <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={header}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">{selectedData.owner_id ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="AMI ID">{selectedData.ami_id ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="AMI Name">{selectedData.ami_name ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="AWS Account">{selectedData.aws_account ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Platform">{selectedData.platform ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Encrypted">{selectedData.encrypted ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Region">{selectedData.region ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Image State">{selectedData.image_state ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Architecture">{selectedData.architecture ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Usage Count">{selectedData.usage_count ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedData.description ?? "-"}</Descriptions.Item>
            </Descriptions>
          </Card>
        ) : (
          <div> No details available </div>
        )}
      </Modal>

      {/* blink keyframes — required for blinking age */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Amis;
