import React, { useState } from "react";
import {
  Table,
  Tag,
  Modal,
  Descriptions,
  Row,
  Col,
  Card,
  Input,
  Select,
  Tabs,
  Tooltip,
  Typography,
  Space
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

const header = { backgroundColor: "#4f46e5", color: "white" };

import { useObservability } from "../../../Context/ObservabilityContext";

// ---------- Constants & Helpers ----------

const TAG_COLORS = {
  success: "green",
  error: "red",
  warning: "orange",
  orphaned: "volcano",
  default: "default",
};

const BOOLEAN_TRUE_ICON = "✅";
const BOOLEAN_FALSE_ICON = "❌";

const renderBooleanIcon = (value) =>
  value ? BOOLEAN_TRUE_ICON : BOOLEAN_FALSE_ICON;

const createEqualityFilter = (field) => (value, record) => {
  const recordValue = record[field];
  if (typeof recordValue === "boolean") {
    return recordValue === value;
  }
  return String(recordValue ?? "") === String(value ?? "");
};

const createNumericSorter = (field) => (a, b) =>
  (a[field] || 0) - (b[field] || 0);

const getUniqueOptions = (data, key) => {
  const unique = [...new Set(data.map((item) => item[key]))].filter(
    (v) => v !== undefined && v !== null
  );
  return unique.map((value) => ({ text: String(value), value }));
};

// rowKey helpers (safer fallbacks)
const getKeyPairRowKey = (record) =>
  record.key_pair_id ||
  record.key_name ||
  record.account_id ||
  `keypair-${record.region || "unknown"}`;

const getEipRowKey = (record) =>
  record.allocation_id ||
  `${record.account_id || "no-account"}-${record.public_ip || "no-ip"}`;

const getVolumeRowKey = (record) =>
  record.volume_id ||
  `${record.account_id || "no-account"}-${record.region || "no-region"}-${
    record.size || "no-size"
  }`;

const getS3RowKey = (record) =>
  record.bucket_name ||
  record.bucket_arn ||
  `${record.account_id || "no-account"}-${record.region || "no-region"}`;

const getEc2RowKey = (record) =>
  record.instance_id ||
  `${record.account_id || "no-account"}-${record.region || "no-region"}-${
    record.instance_name || "no-name"
  }`;

const Observability = () => {
  const { Option } = Select;

  const [tabKey, setTabKey] = useState("1");
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");

  // Modal states
  const [isModalOpenKeyPair, setIsModalOpenKeyPair] = useState(false);
  const [selectedKeyPair, setSelectedKeyPair] = useState(null);

  const [isModalOpenEIP, setIsModalOpenEIP] = useState(false);
  const [selectedEIP, setSelectedEIP] = useState(null);

  const [isModalOpenVolume, setIsModalOpenVolume] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState(null);

  const [isModalOpenS3, setIsModalOpenS3] = useState(false);
  const [selectedS3, setSelectedS3] = useState(null);

  const [isModalOpenEC2, setIsModalOpenEC2] = useState(false);
  const [selectedEC2, setSelectedEC2] = useState(null);

  const {
    loading,
    securityData,
    eipData,
    volumeData,
    s3Data,
    ec2Data,
  } = useObservability();

  // --- Modal handlers (open/close) ---

  const handleOpenKeyPair = (record) => {
    setSelectedKeyPair(record);
    setIsModalOpenKeyPair(true);
  };
  const handleCloseKeyPair = () => setIsModalOpenKeyPair(false);

  const handleOpenEIP = (record) => {
    setSelectedEIP(record);
    setIsModalOpenEIP(true);
  };
  const handleCloseEIP = () => setIsModalOpenEIP(false);

  const handleOpenVolume = (record) => {
    setSelectedVolume(record);
    setIsModalOpenVolume(true);
  };
  const handleCloseVolume = () => setIsModalOpenVolume(false);

  const handleOpenS3 = (record) => {
    setSelectedS3(record);
    setIsModalOpenS3(true);
  };
  const handleCloseS3 = () => setIsModalOpenS3(false);

  const handleOpenEC2 = (record) => {
    setSelectedEC2(record);
    setIsModalOpenEC2(true);
  };
  const handleCloseEC2 = () => setIsModalOpenEC2(false);

  const accountIds = [...new Set(securityData.map((item) => item.account_id))];
  const statusIds = [...new Set(securityData.map((item) => item.status))];

  // ---------- Columns ----------

  // Key Pair Tab Columns
  const columns = [
    {
      title: (
        <span>
          Account Id{" "}
          <Tooltip title="The AWS account's ID.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "account_id",
      key: "account_id",
      filters: accountIds.map((id) => ({ text: id, value: id })),
      onFilter: createEqualityFilter("account_id"),
    },
    {
      title: (
        <span>
          Account Name{" "}
          <Tooltip title="The AWS account's name.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "account_name",
      key: "account_name",
    },
    {
      title: (
        <span>
          Region{" "}
          <Tooltip title="AWS region where the service is running.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "region",
      key: "region",
      filters: getUniqueOptions(securityData, "region"),
      onFilter: createEqualityFilter("region"),
    },
    {
      title: (
        <span>
          Key Pair Name{" "}
          <Tooltip title="The name of the EC2 Key Pair.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "key_name",
      key: "key_name",
      filters: getUniqueOptions(securityData, "key_name"),
      onFilter: createEqualityFilter("key_name"),
    },
    {
      title: (
        <span>
          Status{" "}
          <Tooltip title="Indicates if the key is active, orphaned, or disabled.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "status",
      key: "status",
      filters: statusIds.map((id) => ({ text: id, value: id })),
      onFilter: createEqualityFilter("status"),
      render: (value) => {
        const color =
          value === "Disabled"
            ? TAG_COLORS.error
            : value === "Orphaned"
            ? TAG_COLORS.orphaned
            : TAG_COLORS.success;
        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: "More Details",
      key: "action",
      render: (_, record) => (
        <Tooltip title="View Details">
          <EyeOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenKeyPair(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // EIP Tab Columns
  const eipColumns = [
    {
      title: "Account ID",
      dataIndex: "account_id",
      key: "account_id",
      filters: accountIds.map((id) => ({ text: id, value: id })),
      onFilter: createEqualityFilter("account_id"),
      filterSearch: true,
    },
    {
      title: "Account Name",
      dataIndex: "account_name",
      key: "account_name",
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      filters: getUniqueOptions(eipData, "region"),
      onFilter: createEqualityFilter("region"),
      filterSearch: true,
    },
    {
      title: "Allocation ID",
      dataIndex: "allocation_id",
      key: "allocation_id",
    },
    {
      title: "Public IP",
      dataIndex: "public_ip",
      key: "public_ip",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "in-use", value: "in-use" },
        { text: "available", value: "available" },
      ],
      onFilter: createEqualityFilter("status"),
      render: (status) => (
        <Tag color={status === "in-use" ? TAG_COLORS.success : TAG_COLORS.error}>
          {"Orphaned"}
        </Tag>
      ),
    },
    {
      title: "More Details",
      key: "action",
      render: (_, record) => (
        <Tooltip title="View Details">
          <EyeOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenEIP(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // Volume Tab Columns
  const volumeColumns = [
    {
      title: "Account ID",
      dataIndex: "account_id",
      key: "account_id",
      filters: accountIds.map((id) => ({ text: id, value: id })),
      onFilter: createEqualityFilter("account_id"),
    },
    {
      title: "Account Name",
      dataIndex: "account_name",
      key: "account_name",
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      filters: getUniqueOptions(volumeData, "region"),
      onFilter: createEqualityFilter("region"),
    },
    {
      title: "Volume ID",
      dataIndex: "volume_id",
      key: "volume_id",
    },
    {
      title: "Size (GB)",
      dataIndex: "size",
      key: "size",
      sorter: createNumericSorter("size"),
    },
    {
      title: "More Details",
      key: "action",
      render: (_, record) => (
        <Tooltip title="View Details">
          <EyeOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenVolume(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // S3 Tab Columns
  const s3Columns = [
    {
      title: "Account ID",
      dataIndex: "account_id",
      key: "account_id",
      filters: accountIds.map((id) => ({ text: id, value: id })),
      onFilter: createEqualityFilter("account_id"),
    },
    { title: "Account Name", dataIndex: "account_name", key: "account_name" },
    { title: "Bucket Name", dataIndex: "bucket_name", key: "bucket_name" },
    {
      title: "Versioning",
      dataIndex: "versioning_status",
      key: "versioning_status",
      filters: [
        { text: "Enabled", value: "Enabled" },
        { text: "Suspended", value: "Suspended" },
        { text: "Unversioned", value: "" },
      ],
      onFilter: createEqualityFilter("versioning_status"),
      render: (value) => {
        if (!value) return <Tag color={TAG_COLORS.default}>Unversioned</Tag>;
        if (value.toLowerCase() === "enabled")
          return <Tag color={TAG_COLORS.success}>Enabled</Tag>;
        if (value.toLowerCase() === "suspended")
          return <Tag color={TAG_COLORS.warning}>Suspended</Tag>;
        return <Tag color={TAG_COLORS.default}>{value}</Tag>;
      },
    },
    {
      title: "Public Access Block",
      dataIndex: "public_access_block",
      key: "public_access_block",
      filters: [
        { text: "Enabled", value: true },
        { text: "Disabled", value: false },
      ],
      onFilter: createEqualityFilter("public_access_block"),
      render: (value) => {
        const color = value ? TAG_COLORS.success : TAG_COLORS.error;
        const text = value ? "Enabled" : "Disabled";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    { title: "Region", dataIndex: "region", key: "region" },
    {
      title: "Replication Status",
      dataIndex: "replication_status",
      key: "replication_status",
      filters: [
        { text: "Enabled", value: true },
        { text: "Disabled", value: false },
      ],
      onFilter: createEqualityFilter("replication_status"),
      render: (value) => {
        const color = value ? TAG_COLORS.success : TAG_COLORS.error;
        const text = value ? "Enabled" : "Disabled";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "MFA Delete",
      dataIndex: "mfa_delete",
      key: "mfa_delete",
      filters: [
        { text: "Enabled", value: true },
        { text: "Disabled", value: false },
      ],
      onFilter: createEqualityFilter("mfa_delete"),
      render: (value) => renderBooleanIcon(value),
    },
    { title: "Object Count", dataIndex: "object_count", key: "object_count" },
    {
      title: "Bucket Size (GB)",
      dataIndex: "bucket_size_gb",
      key: "bucket_size_gb",
    },
    {
      title: "More Details",
      key: "action",
      render: (_, record) => (
        <Tooltip title="View Details">
          <EyeOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenS3(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // EC2 Tab Columns
  const ec2Columns = [
    {
      title: "Account ID",
      dataIndex: "account_id",
      key: "account_id",
      filters: accountIds.map((id) => ({ text: id, value: id })),
      onFilter: createEqualityFilter("account_id"),
    },
    { title: "Account Name", dataIndex: "account_name", key: "account_name" },
    { title: "Instance ID", dataIndex: "instance_id", key: "instance_id" },
    { title: "Instance Name", dataIndex: "instance_name", key: "instance_name" },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      filters: getUniqueOptions(ec2Data, "region"),
      onFilter: createEqualityFilter("region"),
    },
    { title: "CPU Avg (7d)", dataIndex: "cpu_avg_7d", key: "cpu_avg_7d" },
    {
      title: "Status Checks OK",
      dataIndex: "status_checks_ok",
      key: "status_checks_ok",
      filters: [
        { text: "OK", value: true },
        { text: "Failed", value: false },
      ],
      onFilter: createEqualityFilter("status_checks_ok"),
      render: (value) => renderBooleanIcon(value),
    },
    {
      title: "Underutilized",
      dataIndex: "underutilized",
      key: "underutilized",
      filters: [
        { text: "True", value: true },
        { text: "False", value: false },
      ],
      onFilter: createEqualityFilter("underutilized"),
      render: (value) => (
        <Tag color={value ? TAG_COLORS.success : TAG_COLORS.error}>
          {value ? "true" : "false"}
        </Tag>
      ),
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      filters: [
        { text: "running", value: "running" },
        { text: "stopped", value: "stopped" },
      ],
      onFilter: createEqualityFilter("state"),
      render: (value) => (
        <Tag
          color={value === "running" ? TAG_COLORS.success : TAG_COLORS.error}
        >
          {value}
        </Tag>
      ),
    },
    {
      title: "More Details",
      key: "action",
      render: (_, record) => (
        <Tooltip title="View Details">
          <EyeOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenEC2(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-3">
      <Row
        gutter={[16, 8]}
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          marginTop: 10,
        }}
      >
        <Col xs={24} md={12}>
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
            Observability
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Search by Account Name"
              prefix={<SearchOutlined />}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              allowClear
            />
          </Space>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="1"
        onChange={(key) => setTabKey(key)}
        style={{ marginTop: "0px", padding: "0px" }}
      >
        <Tabs.TabPane tab="Key Pair" key="1">
          <Table
            columns={columns}
            dataSource={securityData.filter(
              (item) =>
                item.account_name
                  ?.toLowerCase()
                  .includes(searchName.toLowerCase()) &&
                item.account_id
                  ?.toLowerCase()
                  .includes(searchId.toLowerCase())
            )}
            loading={loading}
            rowKey={getKeyPairRowKey}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Unassociated Elastic IP" key="2">
          <Table
            columns={eipColumns}
            dataSource={eipData.filter(
              (item) =>
                item.account_name
                  ?.toLowerCase()
                  .includes(searchName.toLowerCase()) &&
                item.account_id
                  ?.toLowerCase()
                  .includes(searchId.toLowerCase())
            )}
            loading={loading}
            rowKey={getEipRowKey}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Orphaned volume" key="3">
          <Table
            columns={volumeColumns}
            dataSource={volumeData.filter(
              (item) =>
                item.account_name
                  ?.toLowerCase()
                  .includes(searchName.toLowerCase()) &&
                item.account_id
                  ?.toLowerCase()
                  .includes(searchId.toLowerCase())
            )}
            loading={loading}
            rowKey={getVolumeRowKey}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="S3 Details" key="4">
          <Table
            columns={s3Columns}
            dataSource={s3Data.filter(
              (item) =>
                item.account_name
                  ?.toLowerCase()
                  .includes(searchName.toLowerCase()) &&
                item.account_id
                  ?.toLowerCase()
                  .includes(searchId.toLowerCase())
            )}
            loading={loading}
            rowKey={getS3RowKey}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="EC2 Details" key="5">
          <Table
            columns={ec2Columns}
            dataSource={ec2Data.filter(
              (item) =>
                item.account_name
                  ?.toLowerCase()
                  .includes(searchName.toLowerCase()) &&
                item.account_id
                  ?.toLowerCase()
                  .includes(searchId.toLowerCase())
            )}
            loading={loading}
            rowKey={getEc2RowKey}
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* Key Pair Modal */}
      <Modal
        title={`${
          selectedKeyPair?.account_name || selectedKeyPair?.account_id || ""
        } - Key Pair Details`}
        open={isModalOpenKeyPair}
        onCancel={handleCloseKeyPair}
        footer={null}
        width={900}
      >
        {selectedKeyPair && (
          <Card
            size="small"
            title="Information"
            style={{ marginBottom: 16 }}
            headStyle={header}
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">
                {selectedKeyPair.account_id}
              </Descriptions.Item>
              <Descriptions.Item label="Account Name">
                {selectedKeyPair.account_name}
              </Descriptions.Item>
              <Descriptions.Item label="Region">
                {selectedKeyPair.region}
              </Descriptions.Item>
              <Descriptions.Item label="Key Name">
                {selectedKeyPair.key_name}
              </Descriptions.Item>
              <Descriptions.Item label="Key Pair ID">
                {selectedKeyPair.key_pair_id}
              </Descriptions.Item>
              <Descriptions.Item label="Key Type">
                {selectedKeyPair.key_type}
              </Descriptions.Item>
              <Descriptions.Item label="Key Fingerprint">
                {selectedKeyPair.key_fingerprint}
              </Descriptions.Item>
              <Descriptions.Item label="Created On">
                {selectedKeyPair.create_time}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedKeyPair.status}
              </Descriptions.Item>
              <Descriptions.Item label="Instance Name">
                {selectedKeyPair.instance_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Instance ID">
                {selectedKeyPair.instance_id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tags">
                {Object.keys(selectedKeyPair.tags || {}).length > 0
                  ? JSON.stringify(selectedKeyPair.tags)
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>

      {/* EIP Modal */}
      <Modal
        title={`${
          selectedEIP?.account_name || selectedEIP?.account_id || ""
        } - Elastic IP Details`}
        open={isModalOpenEIP}
        onCancel={handleCloseEIP}
        footer={null}
        width={900}
      >
        {selectedEIP && (
          <Card
            size="small"
            title="Information"
            style={{ marginBottom: 16 }}
            headStyle={header}
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">
                {selectedEIP.account_id}
              </Descriptions.Item>
              <Descriptions.Item label="Account Name">
                {selectedEIP.account_name}
              </Descriptions.Item>
              <Descriptions.Item label="Region">
                {selectedEIP.region}
              </Descriptions.Item>
              <Descriptions.Item label="Public IP">
                {selectedEIP.public_ip}
              </Descriptions.Item>
              <Descriptions.Item label="Allocation ID">
                {selectedEIP.allocation_id}
              </Descriptions.Item>
              <Descriptions.Item label="Public Ip">
                {selectedEIP.public_ip}
              </Descriptions.Item>
              <Descriptions.Item label="Domain">
                {selectedEIP.domain || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Public ipv4 Pool">
                {selectedEIP.public_ipv4_pool}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>

      {/* Volume Modal */}
      <Modal
        title={`${
          selectedVolume?.account_name || selectedVolume?.account_id || ""
        } - Orphaned Volume Details`}
        open={isModalOpenVolume}
        onCancel={handleCloseVolume}
        footer={null}
        width={900}
      >
        {selectedVolume && (
          <Card
            size="small"
            title="Information"
            style={{ marginBottom: 16 }}
            headStyle={header}
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">
                {selectedVolume.account_id}
              </Descriptions.Item>
              <Descriptions.Item label="Account Name">
                {selectedVolume.account_name}
              </Descriptions.Item>
              <Descriptions.Item label="Region">
                {selectedVolume.region}
              </Descriptions.Item>
              <Descriptions.Item label="Availability Zone">
                {selectedVolume.availability_zone}
              </Descriptions.Item>
              <Descriptions.Item label="Volume ID">
                {selectedVolume.volume_id}
              </Descriptions.Item>
              <Descriptions.Item label="Volume Name">
                {selectedVolume.volume_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Size (GB)">
                {selectedVolume.size}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                {selectedVolume.state}
              </Descriptions.Item>
              <Descriptions.Item label="Throughput">
                {selectedVolume.throughput || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="IOPS">
                {selectedVolume.iops || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Snapshot ID">
                {selectedVolume.snapshot_id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Create Time">
                {selectedVolume.create_time}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {selectedVolume.created_at}
              </Descriptions.Item>
              <Descriptions.Item label="Tags">
                {Array.isArray(selectedVolume.tags) &&
                selectedVolume.tags.length > 0
                  ? selectedVolume.tags
                      .map((tag) => `${tag.Key}: ${tag.Value}`)
                      .join(", ")
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>

      {/* S3 Modal */}
      <Modal
        title={`${
          selectedS3?.account_name || selectedS3?.account_id || ""
        } - S3 Bucket Details`}
        open={isModalOpenS3}
        onCancel={handleCloseS3}
        footer={null}
        width={1000}
      >
        {selectedS3 && (
          <>
            <Card
              size="small"
              title="Bucket Information"
              style={{ marginBottom: 16 }}
              headStyle={header}
            >
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Account ID">
                  {selectedS3.account_id}
                </Descriptions.Item>
                <Descriptions.Item label="Account Name">
                  {selectedS3.account_name}
                </Descriptions.Item>
                <Descriptions.Item label="Region">
                  {selectedS3.region}
                </Descriptions.Item>
                <Descriptions.Item label="Bucket Name">
                  {selectedS3.bucket_name}
                </Descriptions.Item>
                <Descriptions.Item label="Bucket ARN">
                  {selectedS3.bucket_arn}
                </Descriptions.Item>
                <Descriptions.Item label="Owner">
                  {selectedS3.owner}
                </Descriptions.Item>
                <Descriptions.Item label="Created On">
                  {selectedS3.creation_date}
                </Descriptions.Item>
                <Descriptions.Item label="Last Modified">
                  {selectedS3.last_modified_date}
                </Descriptions.Item>
                <Descriptions.Item label="Versioning Status">
                  {selectedS3.versioning_status ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Encryption">
                  {selectedS3.encryption || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="KMS Key ID">
                  {selectedS3.kms_key_id || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="MFA Delete">
                  {renderBooleanIcon(selectedS3.mfa_delete)}
                </Descriptions.Item>
                <Descriptions.Item label="Public Access Block">
                  {renderBooleanIcon(selectedS3.public_access_block)}
                </Descriptions.Item>
                <Descriptions.Item label="Replication Status">
                  {selectedS3.replication_status || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Logging Status">
                  {selectedS3.logging_status || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Object Count">
                  {selectedS3.object_count}
                </Descriptions.Item>
                <Descriptions.Item label="Bucket Size (GB)">
                  {selectedS3.bucket_size_gb}
                </Descriptions.Item>
                <Descriptions.Item label="Tags">
                  {selectedS3.tags ? JSON.stringify(selectedS3.tags) : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Checked On">
                  {selectedS3.checked_on}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              size="small"
              title="Risk Indicators"
              style={{ marginBottom: 16 }}
              headStyle={header}
            >
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Public">
                  {selectedS3.risk_indicators?.public
                    ? "⚠️ Yes"
                    : "✅ No"}
                </Descriptions.Item>
                <Descriptions.Item label="Unencrypted">
                  {selectedS3.risk_indicators?.unencrypted
                    ? "⚠️ Yes"
                    : "✅ No"}
                </Descriptions.Item>
                <Descriptions.Item label="No Versioning">
                  {selectedS3.risk_indicators?.no_versioning
                    ? "⚠️ Yes"
                    : "✅ No"}
                </Descriptions.Item>
                <Descriptions.Item label="Replication Disabled">
                  {selectedS3.risk_indicators?.replication_disabled
                    ? "⚠️ Yes"
                    : "✅ No"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {Array.isArray(selectedS3.cors_configuration) &&
              selectedS3.cors_configuration.length > 0 && (
                <Card
                  size="small"
                  title="CORS Configuration"
                  style={{ marginBottom: 16 }}
                  headStyle={header}
                >
                  <Table
                    bordered
                    size="small"
                    rowKey={(_, idx) => idx}
                    pagination={false}
                    columns={[
                      {
                        title: "Max Age Seconds",
                        dataIndex: "MaxAgeSeconds",
                        key: "MaxAgeSeconds",
                      },
                      {
                        title: "Allowed Headers",
                        dataIndex: "AllowedHeaders",
                        key: "AllowedHeaders",
                        render: (v) => v.join(", "),
                      },
                      {
                        title: "Allowed Methods",
                        dataIndex: "AllowedMethods",
                        key: "AllowedMethods",
                        render: (v) => v.join(", "),
                      },
                      {
                        title: "Allowed Origins",
                        dataIndex: "AllowedOrigins",
                        key: "AllowedOrigins",
                        render: (v) => v.join(", "),
                      },
                    ]}
                    dataSource={selectedS3.cors_configuration}
                  />
                </Card>
              )}

            {Array.isArray(selectedS3.lifecycle_rules) &&
              selectedS3.lifecycle_rules.length > 0 && (
                <Card size="small" title="Lifecycle Rules" headStyle={header}>
                  <Table
                    bordered
                    size="small"
                    rowKey={(_, idx) => idx}
                    pagination={false}
                    columns={[
                      {
                        title: "Rule ID",
                        dataIndex: "ID",
                        key: "ID",
                      },
                      {
                        title: "Prefix",
                        dataIndex: ["Filter", "Prefix"],
                        key: "Prefix",
                      },
                      {
                        title: "Status",
                        dataIndex: "Status",
                        key: "Status",
                      },
                      {
                        title: "Expiration (Days)",
                        dataIndex: ["Expiration", "Days"],
                        key: "Days",
                      },
                    ]}
                    dataSource={selectedS3.lifecycle_rules}
                  />
                </Card>
              )}
          </>
        )}
      </Modal>

      {/* EC2 Modal */}
      <Modal
        title={`${
          selectedEC2?.account_name || selectedEC2?.account_id || ""
        } - EC2 Instance Details`}
        open={isModalOpenEC2}
        onCancel={handleCloseEC2}
        footer={null}
        width={900}
      >
        {selectedEC2 && (
          <Card
            size="small"
            title="Information"
            style={{ marginBottom: 16 }}
            headStyle={header}
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">
                {selectedEC2.account_id}
              </Descriptions.Item>
              <Descriptions.Item label="Account Name">
                {selectedEC2.account_name}
              </Descriptions.Item>
              <Descriptions.Item label="Instance ID">
                {selectedEC2.instance_id}
              </Descriptions.Item>
              <Descriptions.Item label="Instance Name">
                {selectedEC2.instance_name}
              </Descriptions.Item>
              <Descriptions.Item label="Instance Type">
                {selectedEC2.instance_type}
              </Descriptions.Item>
              <Descriptions.Item label="Region">
                {selectedEC2.region}
              </Descriptions.Item>
              <Descriptions.Item label="CPU Average (7d)">
                {selectedEC2.cpu_avg_7d}%
              </Descriptions.Item>
              <Descriptions.Item label="Status Checks OK">
                {renderBooleanIcon(selectedEC2.status_checks_ok)}
              </Descriptions.Item>
              <Descriptions.Item label="Underutilized">
                {selectedEC2.underutilized ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                {selectedEC2.state}
              </Descriptions.Item>
              <Descriptions.Item label="Launch Time">
                {selectedEC2.launch_time || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Private IP">
                {selectedEC2.private_ip || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Public IP">
                {selectedEC2.public_ip || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Security Groups">
                {selectedEC2.security_groups || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Key Name">
                {selectedEC2.key_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tags">
                {selectedEC2.tags ? JSON.stringify(selectedEC2.tags) : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default Observability;

