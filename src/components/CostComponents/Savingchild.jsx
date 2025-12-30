// File: src/pages/SavingsChild.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Tabs,
  Dropdown,
  Button,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Select,
} from "antd";
import { createStyles } from "antd-style";
import { DownOutlined } from "@ant-design/icons";
import {
  DollarOutlined,
  DatabaseOutlined,
  FileImageOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Text } = Typography;
const { Option } = Select;

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

// ----------------------
// Constants / helpers
// ----------------------
const TAB_KEYS = {
  SUMMARY: "summary",
  ORPHANED: "all",
  RIGHTSIZING: "rightsizing",
};

const RIGHTSIZING_KEYS = {
  EC2: "underutilized_ec2",
  EBS: "underutilized_ebs",
};

const ACTION_STATUS = {
  ASSIGNED: "Assigned",
  UNASSIGNED: "Unassigned",
  REALIZED: "Realized",
};

const STATUS_FILTERS = [
  { text: ACTION_STATUS.ASSIGNED, value: ACTION_STATUS.ASSIGNED },
  { text: ACTION_STATUS.UNASSIGNED, value: ACTION_STATUS.UNASSIGNED },
  { text: ACTION_STATUS.REALIZED, value: ACTION_STATUS.REALIZED },
];

// Safe numeric parser for money-like strings
const toNumber = (raw) => {
  if (raw === null || raw === undefined) return 0;
  const cleaned = String(raw).replace(/[^0-9.-]+/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
};

const calculateTotal = (data, field = "costing") =>
  (Array.isArray(data) ? data : []).reduce(
    (sum, item) => sum + toNumber(item?.[field]),
    0
  );

// make filters safe and ignore null/undefined
const getUniqueFilters = (data, key) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const values = data
    .map((item) => item?.[key])
    .filter((value) => value !== null && value !== undefined && value !== "");
  return [...new Set(values)].map((value) => ({
    text: value,
    value,
  }));
};

const renderStatusTag = (statusRaw) => {
  const status = statusRaw || ACTION_STATUS.UNASSIGNED;
  let color = "default";
  if (status === ACTION_STATUS.ASSIGNED) color = "blue";
  else if (status === ACTION_STATUS.UNASSIGNED) color = "orange";
  else if (status === ACTION_STATUS.REALIZED) color = "green";
  return <Tag color={color}>{status}</Tag>;
};

const normalizeStatus = (raw) => {
  if (!raw) return ACTION_STATUS.UNASSIGNED;
  const val = String(raw).toLowerCase();
  if (val === "assigned") return ACTION_STATUS.ASSIGNED;
  if (val === "realized") return ACTION_STATUS.REALIZED;
  if (val === "unassigned") return ACTION_STATUS.UNASSIGNED;
  return ACTION_STATUS.UNASSIGNED;
};

const updateStatusInList = (list, key, newStatus) =>
  list.map((item) =>
    item.key === key ? { ...item, status: newStatus } : item
  );

const SavingsChild = () => {
  const { styles } = useStyle();

  const [orphanedDisks, setOrphanedDisks] = useState([]);
  const [orphanedElasticIP, setOrphanedElasticIP] = useState([]);
  const [orphanedSnapshots, setOrphanedSnapshots] = useState([]);
  const [riSavings, setRiSavings] = useState([]);
  const [rightsizing, setRightsizing] = useState({
    [RIGHTSIZING_KEYS.EC2]: [],
    [RIGHTSIZING_KEYS.EBS]: [],
  });

  const [rightsizingFilter, setRightsizingFilter] = useState(
    RIGHTSIZING_KEYS.EC2
  );
  const [filter, setFilter] = useState("All");
  const storedAccountIds = JSON.parse(localStorage.getItem("account_ids")) || [];
// get jwt_token from localStorage
const jwt_token = localStorage.getItem("jwt_token");

  // Centralized handler for status change on orphaned/RI rows
  const applyStatusChangeToResources = (recordKey, statusKey) => {
    const newStatus = ACTION_STATUS[statusKey.toUpperCase()] || ACTION_STATUS.UNASSIGNED;

    const setters = [
      setOrphanedDisks,
      setOrphanedElasticIP,
      setOrphanedSnapshots,
      setRiSavings,
    ];



useEffect(() => {
  const fetchData = async () => {
    try {
      // -----------------------------------------
      // 1️⃣ Load account IDs from localStorage
      // -----------------------------------------
      let stored = localStorage.getItem("account_ids");

      try {
        stored = JSON.parse(stored);
      } catch {
        stored = [stored];
      }

      const storedIds = Array.isArray(stored) ? stored : [stored];

      // -----------------------------------------
      // 2️⃣ Prepare POST body
      // -----------------------------------------
      const postBody = {
        account_ids: storedIds,
      };

      console.log("➡️ POST Body:", postBody);

      // -----------------------------------------
      // 3️⃣ Call NEW API (POST)
      // -----------------------------------------
      const res = await axios.post(
        "http://47.130.218.97:8003/resources/filter",
        postBody,
        { headers: { "Content-Type": "application/json",
           Authorization: `Bearer ${jwt_token}`,
          
         } }
      );
    });
  };

  // Status change for rightsizing tables
  const applyStatusChangeToRightsizing = (recordKey, statusKey) => {
    const newStatus = ACTION_STATUS[statusKey.toUpperCase()] || ACTION_STATUS.UNASSIGNED;

    setRightsizing((prev) => {
      const currentList = prev[rightsizingFilter] || [];
      if (!currentList.some((item) => item.key === recordKey)) {
        return prev;
      }
      return {
        ...prev,
        [rightsizingFilter]: updateStatusInList(
          currentList,
          recordKey,
          newStatus
        ),
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load account IDs from localStorage safely
        let stored = localStorage.getItem("account_ids");
        let storedIds = [];

        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            storedIds = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If it is not valid JSON, still send as single value
            storedIds = [stored];
          }
        }

        const postBody = {
          account_ids: storedIds,
        };

        const res = await axios.post(
          "http://47.130.218.97:8003/resources/filter",
          postBody,
          { headers: { "Content-Type": "application/json" } }
        );

        const data = res?.data || {};

        // -------- Orphaned Volumes --------
        const disks = (data.orphaned_volumes || []).map((item, i) => ({
          key: `disk-${i}`,
          accountId: item.account_id,
          region: item.region,
          volumeId: item.volume_id,
          volumeName: item.volume_name || "-",
          volumeType: item.volume_type,
          volumeSize: `${item.volume_size} GB`,
          costing: `$${item.cost_savings ?? 0}`,
          recommendation: item.recommendations?.suggestion || "-",
          status: normalizeStatus(item.status),
        }));

        // -------- Orphaned Elastic IP --------
        const eips = (data.orphaned_eips || []).map((item, i) => ({
          key: `eip-${i}`,
          accountId: item.account_id,
          region: item.region,
          volumeId: item.public_ip,
          volumeName: item.allocation_id,
          volumeType: "Elastic IP",
          volumeSize: "-",
          costing: `$${item.cost ?? 0}`,
          recommendation: "-",
          status: normalizeStatus(item.status),
        }));

        // -------- Snapshots --------
        const snaps = (data.orphaned_snapshots || []).map((item, i) => ({
          key: `snapshot-${i}`,
          accountId: item.account_id,
          region: item.region,
          volumeId: item.snapshot_id,
          volumeName: item.snapshot_name || "-",
          volumeType: "Snapshot",
          volumeSize: `${item.size || 0} GB`,
          costing: `$${item.cost_savings ?? 0}`,
          recommendation: "-",
          status: normalizeStatus(item.status),
        }));

        // -------- EC2 Savings --------
        const ri = (data.underutilized_ec2 || []).map((item, i) => ({
          key: `ri-${i}`,
          accountId: item.account_id,
          region: item.region,
          volumeId: item.instance_id,
          volumeName: item.instance_name || "-",
          volumeType: item.instance_type,
          volumeSize: "-",
          costing: `$${item.cost_savings ?? 0}`,
          recommendation: item.recommendations?.suggestion || "-",
          status: normalizeStatus(item.status),
        }));

        // -------- Rightsizing EC2 --------
        const ec2Data =
          (data.underutilized_ec2 || []).map((item, i) => ({
            key: `rs-ec2-${i}`,
            accountId: item.account_id,
            region: item.region,
            instanceId: item.instance_id,
            instanceName: item.instance_name || "-",
            instancetype: item.instance_type,
            recommendedType: item.recommendations?.suggestion || "-",
            Reason: item.recommendations?.reason || "-",
            costSaving: `$${item.cost_savings ?? 0}`,
            status: normalizeStatus(item.status),
          })) || [];

        // -------- Rightsizing EBS --------
        const ebsData =
          (data.underutilized_ebs || []).map((item, i) => ({
            key: `rs-ebs-${i}`,
            accountId: item.account_id,
            region: item.region,
            volumeId: item.volume_id,
            volumeName: item.volume_name || "-",
            volumeType: item.volume_type,
            volumeSize: item.volume_size,
            recommendedType: item.recommendations?.suggestion || "-",
            Reason: item.recommendations?.reason || "-",
            costSaving: `$${item.cost_savings ?? 0}`,
            status: normalizeStatus(item.status),
          })) || [];

        setOrphanedDisks(disks);
        setOrphanedElasticIP(eips);
        setOrphanedSnapshots(snaps);
        setRiSavings(ri);
        setRightsizing({
          [RIGHTSIZING_KEYS.EC2]: ec2Data,
          [RIGHTSIZING_KEYS.EBS]: ebsData,
        });
      } catch (err) {
        console.error("❌ Error fetching savings data:", err);
      }
    };

    fetchData();
  }, []);

  const combinedData = useMemo(() => {
    let allData = [
      ...orphanedDisks.map((item) => ({ ...item, resourceType: "Disk" })),
      ...orphanedElasticIP.map((item) => ({
        ...item,
        resourceType: "Elastic IP",
      })),
      ...orphanedSnapshots.map((item) => ({
        ...item,
        resourceType: "Snapshot",
      })),
      ...riSavings.map((item) => ({ ...item, resourceType: "RI/Savings" })),
    ];

    if (filter !== "All") {
      allData = allData.filter((item) => item.resourceType === filter);
    }
    return allData;
  }, [orphanedDisks, orphanedElasticIP, orphanedSnapshots, riSavings, filter]);

  // Extract filter and sorter functions for testability
  const statusFilter = (value, record) => record.status === value;
const recommendationFilter = (value, record) => record.recommendation === value;
const costSavingSorter = (a, b) => toNumber(a.costSaving) - toNumber(b.costSaving);

// Extract render function for testability
const renderResourceType = (type) => {
  let color;
  let icon;
  switch (type) {
    case "Disk":
      color = "blue";
      icon = <DatabaseOutlined />;
      break;
    case "Elastic IP":
      color = "purple";
      icon = <GlobalOutlined />;
      break;
    case "Snapshot":
      color = "orange";
      icon = <FileImageOutlined />;
      break;
    case "RI/Savings":
      color = "green";
      icon = <DollarOutlined />;
      break;
    default:
      color = "default";
      icon = <QuestionCircleOutlined />;
  }
  return (
    <Tag color={color} icon={icon}>
      {type}
    </Tag>
  );
};

// Extract filter functions for testability
const resourceTypeFilter = (value, record) => record.resourceType === value;
const accountIdFilter = (value, record) => record.accountId === value;
const regionFilter = (value, record) => record.region === value;
const volumeIdFilter = (value, record) => record.volumeId === value;
const volumeNameFilter = (value, record) => record.volumeName === value;
const volumeTypeFilter = (value, record) => record.volumeType === value;
const volumeSizeFilter = (value, record) => record.volumeSize === value;

// Extract action handler for testability
const createActionHandler = (applyFunction) => (record) => ({
  handleActionClick: ({ key }) => {
    applyFunction(record.key, key);
  }
});

  const combinedColumns = [
    {
      title: "Resource Type",
      dataIndex: "resourceType",
      width: 150,
      filters: [
        { text: "Disk", value: "Disk" },
        { text: "Elastic IP", value: "Elastic IP" },
        { text: "Snapshot", value: "Snapshot" },
        { text: "RI/Savings", value: "RI/Savings" },
      ],
      onFilter: resourceTypeFilter,
      render: renderResourceType,
    },
    {
      title: "Account ID",
      dataIndex: "accountId",
      width: 150,
      filters: getUniqueFilters(combinedData, "accountId"),
      onFilter: accountIdFilter,
    },
    {
      title: "Region",
      dataIndex: "region",
      width: 120,
      filters: getUniqueFilters(combinedData, "region"),
      onFilter: regionFilter,
    },
    {
      title: "Volume ID",
      dataIndex: "volumeId",
      width: 180,
      filters: getUniqueFilters(combinedData, "volumeId"),
      onFilter: volumeIdFilter,
    },
    {
      title: "Volume Name",
      dataIndex: "volumeName",
      width: 180,
      filters: getUniqueFilters(combinedData, "volumeName"),
      onFilter: volumeNameFilter,
    },
    {
      title: "Volume Type",
      dataIndex: "volumeType",
      width: 140,
      filters: getUniqueFilters(combinedData, "volumeType"),
      onFilter: volumeTypeFilter,
    },
    {
      title: "Volume Size",
      dataIndex: "volumeSize",
      width: 140,
      filters: getUniqueFilters(combinedData, "volumeSize"),
      onFilter: volumeSizeFilter,
    },
    {
      title: "Costing",
      dataIndex: "costing",
      width: 120,
      sorter: costSavingSorter,
    },
    {
      title: "Recommendation",
      dataIndex: "recommendation",
      width: 180,
      filters: getUniqueFilters(combinedData, "recommendation"),
      onFilter: recommendationFilter,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
      filters: STATUS_FILTERS,
      onFilter: statusFilter,
      render: renderStatusTag,
    },
    {
      title: "Cost Saving",
      dataIndex: "costSaving",
      width: 120,
      sorter: costSavingSorter,
    },
    {
      title: "Action",
      width: 150,
      fixed: "right",
      render: (_, record) => {
        const { handleActionClick } = createActionHandler(applyStatusChangeToResources)(record);
        return (
          <Dropdown
            menu={{
              items: [
                { key: "ASSIGNED", label: ACTION_STATUS.ASSIGNED },
                { key: "REALIZED", label: ACTION_STATUS.REALIZED },
              ],
              onClick: handleActionClick,
            }}
            trigger={["click"]}
          >
            <Button type="link">
              Take Action <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const getColumns = (filterType) => {
    if (filterType === RIGHTSIZING_KEYS.EC2) {
      return [
        { title: "Account ID", dataIndex: "accountId", width: 150 },
        { title: "Region", dataIndex: "region", width: 120 },
        { title: "Instance ID", dataIndex: "instanceId", width: 180 },
        { title: "Instance Name", dataIndex: "instanceName", width: 180 },
        { title: "Instance Type", dataIndex: "instancetype", width: 140 },
        { title: "Recommended Type", dataIndex: "recommendedType", width: 160 },
        { title: "Reason", dataIndex: "Reason", width: 160 },
        {
          title: "Cost Saving",
          dataIndex: "costSaving",
          width: 120,
          sorter: costSavingSorter,
        },
        {
          title: "Status",
          dataIndex: "status",
          width: 150,
          render: renderStatusTag,
        },
        {
          title: "Action",
          width: 150,
          fixed: "right",
          render: (_, record) => {
            const { handleActionClick } = createActionHandler(applyStatusChangeToRightsizing)(record);
            return (
              <Dropdown
                menu={{
                  items: [
                    { key: "ASSIGNED", label: ACTION_STATUS.ASSIGNED },
                    { key: "REALIZED", label: ACTION_STATUS.REALIZED },
                  ],
                  onClick: handleActionClick,
                }}
                trigger={["click"]}
              >
                <Button type="link">
                  Take Action <DownOutlined />
                </Button>
              </Dropdown>
            );
          },
        },
      ];
    }

    if (filterType === RIGHTSIZING_KEYS.EBS) {
      return [
        { title: "Account ID", dataIndex: "accountId", width: 150 },
        { title: "Region", dataIndex: "region", width: 120 },
        { title: "Volume ID", dataIndex: "volumeId", width: 180 },
        { title: "Volume Name", dataIndex: "volumeName", width: 180 },
        { title: "Volume Type", dataIndex: "volumeType", width: 140 },
        { title: "Volume Size (GB)", dataIndex: "volumeSize", width: 140 },
        { title: "Reason", dataIndex: "Reason", width: 160 },
        {
          title: "Cost Saving",
          dataIndex: "costSaving",
          width: 120,
          sorter: costSavingSorter,
        },
        {
          title: "Status",
          dataIndex: "status",
          width: 150,
          render: renderStatusTag,
        },
        {
          title: "Action",
          width: 150,
          fixed: "right",
          render: (_, record) => {
            const { handleActionClick } = createActionHandler(applyStatusChangeToRightsizing)(record);
            return (
              <Dropdown
                menu={{
                  items: [
                    { key: "ASSIGNED", label: ACTION_STATUS.ASSIGNED },
                    { key: "REALIZED", label: ACTION_STATUS.REALIZED },
                  ],
                  onClick: handleActionClick,
                }}
                trigger={["click"]}
              >
                <Button type="link">
                  Take Action <DownOutlined />
                </Button>
              </Dropdown>
            );
          },
        },
      ];
    }

    return [];
  };

  const tabs = [
    {
      key: TAB_KEYS.SUMMARY,
      label: "Summary",
      children: (
        <div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered hoverable onClick={() => setActiveTab(TAB_KEYS.ORPHANED)}>
                <h3>Orphaned Disks</h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: 8,
                  }}
                >
                  <Tag color="blue" icon={<DatabaseOutlined />}>
                    {orphanedDisks.length}
                  </Tag>
                  <Text strong style={{ color: "blue" }}>
                    Total Cost: ${calculateTotal(orphanedDisks).toFixed(2)}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered hoverable onClick={() => setActiveTab(TAB_KEYS.ORPHANED)}>
                <h3>Orphaned Elastic IPs</h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: 8,
                  }}
                >
                  <Tag color="purple" icon={<GlobalOutlined />}>
                    {orphanedElasticIP.length}
                  </Tag>
                  <Text strong style={{ color: "purple" }}>
                    Total Cost: ${calculateTotal(orphanedElasticIP).toFixed(2)}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered hoverable onClick={() => setActiveTab(TAB_KEYS.ORPHANED)}>
                <h3>Orphaned Snapshots</h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: 8,
                  }}
                >
                  <Tag color="orange" icon={<FileImageOutlined />}>
                    {orphanedSnapshots.length}
                  </Tag>
                  <Text strong style={{ color: "orange" }}>
                    Total Cost: ${calculateTotal(orphanedSnapshots).toFixed(2)}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                bordered
                hoverable
                onClick={() => setActiveTab(TAB_KEYS.RIGHTSIZING)}
              >
                <h3>Rightsizing</h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: 8,
                  }}
                >
                  <Tag color="green" icon={<DollarOutlined />}>
                    {rightsizing[rightsizingFilter]?.length || 0}
                  </Tag>
                  <Text strong style={{ color: "green" }}>
                    Total Savings: $
                    {calculateTotal(
                      rightsizing[rightsizingFilter],
                      "costSaving"
                    ).toFixed(2)}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: TAB_KEYS.ORPHANED,
      label: "Orphaned",
      children: (
        <div>
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 120, marginBottom: 16 }}
          >
            <Option value="All">All Resources</Option>
            <Option value="Disk">Disks</Option>
            <Option value="Elastic IP">Elastic IPs</Option>
            <Option value="Snapshot">Snapshots</Option>
          </Select>

          <Table
            className={styles.customTable}
            columns={combinedColumns}
            dataSource={combinedData}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1500, y: 500 }}
          />
        </div>
      ),
    },
    {
      key: TAB_KEYS.RIGHTSIZING,
      label: "Rightsizing",
      children: (
        <div>
          <Select
            value={rightsizingFilter}
            onChange={setRightsizingFilter}
            style={{ width: 180, marginBottom: 16 }}
          >
            <Option value={RIGHTSIZING_KEYS.EC2}>Underutilized EC2</Option>
            <Option value={RIGHTSIZING_KEYS.EBS}>Underutilized EBS</Option>
          </Select>

          <Table
            columns={getColumns(rightsizingFilter)}
            dataSource={rightsizing[rightsizingFilter] || []}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200, y: 500 }}
          />
        </div>
      ),
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabs}
    />
  );
};

export default SavingsChild;
