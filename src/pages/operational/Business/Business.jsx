import React, { useEffect, useState, useCallback, useMemo } from "react";
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

// ----- Helpers & constants -----

// centralised label/color map for orphaned volume status
const VOLUME_STATUS_MAP = {
  attached: { color: "blue", label: "Attached" },
  deleted: { color: "red", label: "Deleted" },
  available: { color: "green", label: "Available" }
};

const getOrphanedVolumeTagConfig = (rawValue) => {
  const normalized = String(rawValue ?? "").toLowerCase();
  const mapped = VOLUME_STATUS_MAP[normalized];

  if (mapped) {
    return mapped;
  }

  return {
    color: "default",
    label: rawValue
  };
};

// snapshot age → color + blink flag
const getSnapshotAgeVisual = (age) => {
  let color = "#52c41a";
  let blink = false;

  if (age > 90) {
    color = "#ff4d4f";
    blink = true;
  } else if (age > 60) {
    color = "#fa8c16";
  } else if (age > 30) {
    color = "#faad14";
  }

  return { color, blink };
};

// safe username extraction
const getRecordUsername = (record) => {
  const value =
    record?.account_name ||
    record?.accountName ||
    record?.user_identity?.accountName ||
    record?.user?.username ||
    record?.user?.name ||
    "";

  return (value ?? "").toString();
};

// safe row key generator (no UI impact)
const getRowKey = (record) => {
  if (record?.snapshot_id) return record.snapshot_id;

  const accountId = record?.account_id ?? "no-account";
  const region = record?.region ?? "no-region";
  const snapshotName = record?.snapshot_name ?? "no-snapshot";
  const username = getRecordUsername(record) || "unknown-user";

  return `${accountId}-${region}-${username}-${snapshotName}`;
};

const Business = () => {
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const jwt_token = localStorage.getItem("jwt_token");
    const fetchData = async () => {
      setLoading(true);
      try {
        let storedIds = localStorage.getItem("account_ids");

        if (storedIds) {
          try {
            const parsed = JSON.parse(storedIds);
            storedIds = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            storedIds = [storedIds];
          }
        } else {
          storedIds = [];
        }

        const postBody = { account_ids: storedIds };

        console.log("➡️ Sending POST:", postBody);

        const response = await axios.post(
          "http://47.130.218.97:8012/snapshots/filter",
          postBody,
          { headers: { "Content-Type": "application/json" , Authorization: `Bearer ${jwt_token}`,} }
        );

        console.log("📌 API Response:", response.data);
        setOriginalData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("❌ Error fetching Snapshots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleOpenModal = useCallback((record) => {
    if (!record) return;
    setSelectedData(record);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // unique filter values (memoised)
  const accountIds = useMemo(
    () => [...new Set(originalData.map((item) => item.account_id))].filter(
      (v) => v !== undefined && v !== null
    ),
    [originalData]
  );

  const regions = useMemo(
    () => [...new Set(originalData.map((item) => item.region))].filter(
      (v) => v !== undefined && v !== null
    ),
    [originalData]
  );

  const events = useMemo(
    () =>
      [...new Set(originalData.map((item) => item.snapshot_name))].filter(
        (v) => v !== undefined && v !== null
      ),
    [originalData]
  );

  // filtered data by search
  const filteredData = useMemo(() => {
    if (!searchText) return originalData;
    const lower = searchText.toLowerCase();

    return originalData.filter((item) =>
      getRecordUsername(item).toLowerCase().includes(lower)
    );
  }, [originalData, searchText]);

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
      onFilter: (value, record) =>
        String(record.account_id ?? "") === String(value ?? "")
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
      filters: events.map((event) => ({ text: event, value: event })),
      onFilter: (value, record) =>
        String(record.snapshot_name ?? "") === String(value ?? "")
    },
    {
      title: "Snapshot Age",
      dataIndex: "snapshot_age_days",
      key: "snapshot_age_days",
      width: 120,
      render: (value) => {
        if (value == null) return "-";

        const { color, blink } = getSnapshotAgeVisual(value);

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
        const { color, label } = getOrphanedVolumeTagConfig(value);
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
      filters: regions.map((r) => ({ text: r, value: r })),
      onFilter: (value, record) =>
        String(record.region ?? "") === String(value ?? "")
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
        rowKey={getRowKey}
        pagination={{ pageSize: 8 }}
      />

      {/* Modal */}
      <Modal
        title={`${selectedData?.account_name || ""} - Account Details`}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={900}
      >
        {selectedData && (
          <Card
            size="small"
            title="Information"
            style={{ marginBottom: 16 }}
            headStyle={header}
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">
                {selectedData.account_id}
              </Descriptions.Item>
              <Descriptions.Item label="Account Name">
                {getRecordUsername(selectedData)}
              </Descriptions.Item>
              <Descriptions.Item label="Instance ID">
                {selectedData.instance_id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Instance Name">
                {selectedData.instance_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Volume ID">
                {selectedData.volume_id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Volume Name">
                {selectedData.volume_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Orphaned">
                {selectedData.orphaned || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Region">
                {selectedData.region}
              </Descriptions.Item>
              <Descriptions.Item label="Snapshot ID">
                {selectedData.snapshot_id}
              </Descriptions.Item>
              <Descriptions.Item label="Snapshot Name">
                {selectedData.snapshot_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Snapshot Description">
                {selectedData.snapshot_description || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Snapshot Created On">
                {selectedData.snapshot_creation_date || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default Business;
