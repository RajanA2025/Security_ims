// src/pages/Business/Business.jsx
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
  Typography,
} from "antd";
import {
  EyeOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import axios from "axios";

// 🔹 Operator mapping with symbols & icons
const operatorMap = {
  GreaterThanOrEqualToThreshold: {
    symbol: "≥",
    icon: <ArrowUpOutlined style={{ color: "green" }} />,
  },
  GreaterThanThreshold: {
    symbol: ">",
    icon: <ArrowUpOutlined style={{ color: "green" }} />,
  },
  LessThanThreshold: {
    symbol: "<",
    icon: <ArrowDownOutlined style={{ color: "red" }} />,
  },
  LessThanOrEqualToThreshold: {
    symbol: "≤",
    icon: <ArrowDownOutlined style={{ color: "red" }} />,
  },
  EqualToThreshold: {
    symbol: "=",
    icon: <MinusOutlined style={{ color: "gray" }} />,
  },
};

const headerStyle = { backgroundColor: "#4f46e5", color: "white" };

// helper to do dev-only logs (won't spam prod)
const devLog = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
const devError = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

const Business = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");

    // 🔹 Fetch data
    // 🔹 Fetch CloudWatch data using POST filter API
    useEffect(() => {
        const jwt_token = localStorage.getItem("jwt_token");
        const fetchData = async () => {
            setLoading(true);
            try {
                // Step 1: Load account_ids from localStorage
                let storedIds = localStorage.getItem("account_ids");

                // Step 2: Convert to safe array
                try {
                    storedIds = JSON.parse(storedIds);
                } catch {
                    storedIds = [storedIds];
                }

                const finalIds = Array.isArray(storedIds)
                    ? storedIds.map(id => String(id).trim())
                    : [String(storedIds).trim()];

                // POST body
                const postBody = {
                    account_ids: finalIds
                };

                console.log("➡️ Sending POST body:", postBody);

                // Step 3: Call your new POST API
                const { data } = await axios.post(
                    "http://47.130.218.97:8012/cloudwatch/filter",
                    postBody,
                    {
                        headers: { "Content-Type": "application/json",
                            Authorization: `Bearer ${jwt_token}`,
                         }
                    }
                );

                console.log("📌 API Response:", data);

                // Step 4: No frontend filtering needed
                setData(data);

            } catch (error) {
                console.error("❌ Error fetching CloudWatch data:", error);
            } finally {
                setLoading(false);
            }
          } else {
            // simple single value stored as a plain string
            storedIds = [trimmedRaw];
          }
        }

        // Step 3: normalize to array of trimmed strings and remove falsy
        const finalIds = (Array.isArray(storedIds) ? storedIds : [storedIds])
          .map((id) => (id == null ? "" : String(id).trim()))
          .filter((s) => s !== "");

        // POST body
        const postBody = {
          account_ids: finalIds,
        };

        devLog("➡️ Sending POST body:", postBody);

        // Step 4: Call your POST API
        const response = await axios.post(
          "http://47.130.218.97:8012/cloudwatch/filter",
          postBody,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 20_000,
          }
        );

        const respData = response?.data ?? [];

        devLog("📌 API Response length:", Array.isArray(respData) ? respData.length : typeof respData);

        // Step 5: attach stable fallback keys to each record to use as rowKey if event_id missing
        const normalized = Array.isArray(respData)
          ? respData.map((item, idx) => {
              // compute a username-safe string
              const usernameSafe = getRecordUsername(item) || `unknown-${idx}`;
              const timeSafe = item?.event_time ?? item?.history_timestamp ?? `t${idx}`;
              const fallbackKey = `${usernameSafe}-${timeSafe}`;
              return {
                __rowKey: item?.event_id ?? fallbackKey,
                ...item,
              };
            })
          : [];

        if (mounted) setData(normalized);
      } catch (error) {
        // dev-only error logging
        devError("❌ Error fetching CloudWatch data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty – runs on mount

  // 🔹 Filters (stringify & trim to avoid mismatches)
  const accountIds = [
    ...new Set(
      data
        .map((item) => (item?.account_id == null ? "" : String(item.account_id).trim()))
        .filter(Boolean)
    ),
  ];
  const regions = [
    ...new Set(
      data.map((item) => (item?.region == null ? "" : String(item.region).trim())).filter(Boolean)
    ),
  ];
  const alaIMS = [
    ...new Set(
      data
        .map((item) => (item?.alarm_name == null ? "" : String(item.alarm_name).trim()))
        .filter(Boolean)
    ),
  ];

  // 🔹 Open modal
  const handleOpenModal = (record) => {
    // defensive
    setSelectedData(record ?? null);
    setIsModalOpen(true);
  };

  // 🔹 Search handler
  const handleSearch = (e) => setSearchText(e?.target?.value ?? "");

  // 🔹 Columns (onFilter coerces both sides to trimmed strings)
  const columns = [
    {
      title: (
        <span>
          Account ID{" "}
          <Tooltip title="AWS account ID associated with the event.">
            <InfoCircleOutlined style={{ color: "#1890ff" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "account_id",
      key: "account_id",
      filters: accountIds.map((id) => ({ text: id, value: id })),
      onFilter: (value, record) =>
        String(record?.account_id ?? "")
          .trim()
          .toLowerCase() === String(value ?? "").trim().toLowerCase(),
    },
    {
      title: (
        <span>
          Account Name{" "}
          <Tooltip title="AWS user or role that performed the action.">
            <InfoCircleOutlined style={{ color: "#1890ff" }} />
          </Tooltip>
        </span>
      ),
      key: "account_name",
      render: (_, record) => getRecordUsername(record),
    },
    {
      title: (
        <span>
          Alarm Name{" "}
          <Tooltip title="CloudWatch alarm that triggered.">
            <InfoCircleOutlined style={{ color: "#1890ff" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "alarm_name",
      key: "alarm_name",
      filters: alaIMS.map((a) => ({ text: a, value: a })),
      onFilter: (value, record) =>
        String(record?.alarm_name ?? "").trim().toLowerCase() === String(value ?? "").trim().toLowerCase(),
    },
    {
      title: "Metric Name",
      dataIndex: "metric_name",
      key: "metric_name",
    },
    {
      title: "Instance ID",
      dataIndex: "instance_id",
      key: "instance_id",
    },
    {
      title: "Instance Name",
      dataIndex: "instance_name",
      key: "instance_name",
      filters: [
        ...new Set(
          data
            .map((item) => (item?.instance_name == null ? "" : String(item.instance_name).trim()))
            .filter(Boolean)
        ),
      ].map((name) => ({ text: name, value: name })),
      onFilter: (value, record) =>
        String(record?.instance_name ?? "").trim().toLowerCase() === String(value ?? "").trim().toLowerCase(),
    },
    {
      title: "Threshold",
      dataIndex: "threshold",
      key: "threshold",
      render: (value, record) => {
        const operator =
          operatorMap[String(record?.comparison_operator ?? "")] || {
            symbol: "?",
            icon: null,
          };
        return (
          <Tooltip title={String(record?.comparison_operator ?? "")}>
            <span>
              {operator.icon} {operator.symbol} {value ?? "-"}
            </span>
          </Tooltip>
        );
      },
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

  // 🔹 Filtered data by search (defensive)
  const filteredData = (data || []).filter((item) =>
    getRecordUsername(item).toLowerCase().includes((searchText || "").toLowerCase())
  );

  return (
    <div className="p-3">
      {/* Header & Search */}
      <Row gutter={[16, 16]} style={{ marginBottom: 10, marginTop: 15 }}>
        <Col md={20}>
          <Typography.Title
            level={4}
            style={{
              fontFamily: "'Roboto', 'Segoe UI', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
              color: "#1f2937",
              margin: 0,
            }}
          >
            Cloud-Watch
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
        // prefer event_id if present, else use __rowKey computed on fetchData
        rowKey={(record) => record?.event_id ?? record?.__rowKey ?? JSON.stringify(record)}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={`${selectedData?.account_name || ""} - Account Details`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedData && (
          <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={headerStyle}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">{selectedData.account_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Account Name">{selectedData.account_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Region">{selectedData.region || "-"}</Descriptions.Item>
              <Descriptions.Item label="Alarm Name">{selectedData.alarm_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Alarm ARN" span={2}>
                {selectedData.alarm_arn || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Metric Name">{selectedData.metric_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Namespace">{selectedData.namespace || "-"}</Descriptions.Item>
              <Descriptions.Item label="Instance ID">{selectedData.instance_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Instance Name">{selectedData.instance_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="State Value">{selectedData.state_value || "-"}</Descriptions.Item>
              <Descriptions.Item label="State Updated">{selectedData.state_updated || "-"}</Descriptions.Item>
              <Descriptions.Item label="Threshold">{selectedData.threshold || "-"}</Descriptions.Item>
              <Descriptions.Item label="Comparison Operator">{selectedData.comparison_operator || "-"}</Descriptions.Item>
              <Descriptions.Item label="Evaluation Periods">{selectedData.evaluation_periods || "-"}</Descriptions.Item>
              <Descriptions.Item label="Period">{selectedData.period || "-"}</Descriptions.Item>
              <Descriptions.Item label="Statistic">{selectedData.statistic || "-"}</Descriptions.Item>
              <Descriptions.Item label="History Event Time">{selectedData.history_event_time || "-"}</Descriptions.Item>
              <Descriptions.Item label="History Timestamp">{selectedData.history_timestamp || "-"}</Descriptions.Item>
              <Descriptions.Item label="History Summary" span={2}>
                {selectedData.history_summary || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="History Message" span={2}>
                {selectedData.history_message || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default Business;
