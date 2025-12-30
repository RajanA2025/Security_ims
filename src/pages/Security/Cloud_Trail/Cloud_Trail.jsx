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
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");

  // ---------- Helpers ----------
  const safeParseAccountIds = () => {
    let raw = null;
    try {
      raw = localStorage.getItem("account_ids");
    } catch (err) {
      console.error("localStorage unavailable:", err);
      return [];
    }

    if (raw == null) return [];

    const s = String(raw).trim();
    if (s === "" || s.toLowerCase() === "null") return [];

    // Try JSON parse
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v ?? "").trim()).filter(Boolean);
      if (typeof parsed === "string" || typeof parsed === "number") return [String(parsed).trim()].filter(Boolean);
      // unexpected shape -> return empty
      return [];
    } catch {
      // not JSON: maybe CSV or single string
      if (s.includes(",")) return s.split(",").map((v) => v.trim()).filter(Boolean);
      return [s];
    }
  };

  const getRecordUsername = (record) => {
    // handle many possible shapes, return empty string as fallback
    const maybe =
      record?.username ??
      record?.user_name ??
      record?.userName ??
      record?.user_identity?.userName ??
      record?.user_identity?.username ??
      record?.user?.username ??
      record?.user?.name ??
      record?.principal ??
      "";
    try {
      return String(maybe);
    } catch {
      return "";
    }
  };

  // ---------- Fetch ----------
  useEffect(() => {
    const jwt_token = localStorage.getItem("jwt_token");
    const fetchData = async () => {
      setLoading(true);
      try {
        // normalize account ids
        const accountIds = safeParseAccountIds();
        console.log("➡️ Sending POST account_ids:", accountIds);

        // safe POST body
        const postBody = { account_ids: Array.isArray(accountIds) ? accountIds : [] };

        const response = await axios.post(
          "http://47.130.218.97:8012/cloudtrail/filter",
          { account_ids: accountIds },
          { headers: { "Content-Type": "application/json",
                Authorization: `Bearer ${jwt_token}`,
           } }
        );

        const respData = response?.data;

        // Accept either array or object - backend may return array or { data: [...] }
        const rows = Array.isArray(respData) ? respData : Array.isArray(respData?.data) ? respData.data : [];

        // Ensure rows is an array of objects
        const normalized = Array.isArray(rows) ? rows.map((r = {}) => ({
          // keep original fields but ensure safe fallbacks for fields used in UI
          event_id: r.event_id ?? r.id ?? null,
          account_id: String(r.account_id ?? r.owner_id ?? r.aws_account ?? "").trim(),
          aws_region: r.aws_region ?? r.region ?? "",
          event_name: r.event_name ?? r.eventName ?? "",
          resource_type: r.resource_type ?? r.resourceType ?? "",
          source_ip: r.source_ip ?? r.sourceIp ?? r.sourceIPAddress ?? "",
          resource_name: r.resource_name ?? r.resourceName ?? "",
          event_time: r.event_time ?? r.time ?? "",
          // copy whole record for modal
          __raw: r
        })) : [];

        setData(normalized);
      } catch (error) {
        console.error("❌ Error fetching CloudTrail data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------- Filters (safe unique lists) ----------
  const makeUniqueList = (arr, mapper = (x) => x) =>
    [...new Set((Array.isArray(arr) ? arr : []).map(mapper).map((v) => String(v ?? "").trim()).filter(Boolean))];

  const accountIds = makeUniqueList(data, (d) => d.account_id);
  const regions = makeUniqueList(data, (d) => d.aws_region);
  const events = makeUniqueList(data, (d) => d.event_name);

  // ---------- Modal handlers ----------
  const handleOpenModal = (record) => {
    setSelectedData(record && typeof record === "object" ? record : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
  };

  // ---------- Search ----------
  const handleSearch = (e) => {
    setSearchText(String(e?.target?.value ?? ""));
  };

  // ---------- Table Columns ----------
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
      filters: accountIds.map((id) => ({ text: id, value: id })),
      onFilter: (value, record) => String(record?.account_id) === String(value)
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
      render: (_, record) => getRecordUsername(record.__raw ?? record)
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
      filters: events.map((ev) => ({ text: ev, value: ev })),
      onFilter: (value, record) => String(record?.event_name) === String(value)
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
      key: "resource_type",
      render: (v) => String(v ?? "")
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
      key: "source_ip",
      render: (v) => String(v ?? "-")
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
      filters: regions.map((r) => ({ text: r, value: r })),
      onFilter: (value, record) => String(record?.aws_region) === String(value)
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

  // ---------- Filtered data by username search ----------
  const filteredData = Array.isArray(data)
    ? data.filter((item) =>
        getRecordUsername(item.__raw ?? item).toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  return (
    <div className="p-3">
      {/* Search input */}
      <Row gutter={[16, 16]} style={{ marginBottom: 10 }}>
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
          record.event_id || `${getRecordUsername(record.__raw ?? record)}-${record.event_time ?? ""}`
        }
        pagination={{ pageSize: 10 }}
      />

      {/* Modal */}
      <Modal
        title={`${selectedData?.account_id || ""} - Event Details`}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={900}
      >
        {selectedData ? (
          <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={header}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">{selectedData.account_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Username">{getRecordUsername(selectedData.__raw ?? selectedData) || "-"}</Descriptions.Item>
              <Descriptions.Item label="Event ID">{selectedData.event_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Event Time">{selectedData.event_time || "-"}</Descriptions.Item>
              <Descriptions.Item label="Resource Name">{selectedData.resource_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Region">{selectedData.aws_region || "-"}</Descriptions.Item>
              <Descriptions.Item label="Event Name">{selectedData.event_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Resource Type">{selectedData.resource_type || "-"}</Descriptions.Item>
              <Descriptions.Item label="Source IP">{selectedData.source_ip || "-"}</Descriptions.Item>
              {/* raw JSON (collapsible) */}
              <Descriptions.Item label="Raw Event" span={2}>
                <pre style={{ maxHeight: 240, overflow: "auto", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(selectedData.__raw ?? selectedData, null, 2)}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : (
          <div style={{ textAlign: "center", padding: 32 }}>No event selected</div>
        )}
      </Modal>
    </div>
  );
};

export default Cloud_Trail;
