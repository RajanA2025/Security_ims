import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Alert,
  Tag,
  Skeleton,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * RightSizing — Updated
 * - Computes numeric cpuUsageNumeric once and uses it for sorting / status
 * - Extracted threshold constants
 * - Centralized status/color logic
 * - Top-level Selects control filtering (removed duplicated Table header filters)
 * - Defensive response parsing & mock fallback
 */

const THRESHOLD_CRITICAL = 80;
const THRESHOLD_WARNING = 60;

const mockData = [
  // small sample fallback if API fails
  {
    key: "mock-1",
    id: "mock-1",
    accountId: "000000000001",
    accountName: "Mock Account A",
    region: "us-east-1",
    instanceId: "i-mock1",
    cpuUsageNumeric: 12.34,
    cpuUsage: "12.34%",
    recommended: "No recommendation",
  },
  {
    key: "mock-2",
    id: "mock-2",
    accountId: "000000000002",
    accountName: "Mock Account B",
    region: "us-west-2",
    instanceId: "i-mock2",
    cpuUsageNumeric: 72.5,
    cpuUsage: "72.50%",
    recommended: "Downsize: t3.small → t3.micro",
  },
];

function RightSizing() {
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // controlled filters (top-level selects)
  const [filters, setFilters] = useState({
    accountId: "",
    accountName: "",
    region: "",
  });

  const [uniqueRegions, setUniqueRegions] = useState([]);
  const [uniqueAccountIds, setUniqueAccountIds] = useState([]);
  const [uniqueAccountNames, setUniqueAccountNames] = useState([]);

  // Format usage value to "NN.NN%"
  const formatUsageValue = (value) => {
    if (value === null || value === undefined) return "0.00%";

    // accept numbers or strings like "12.34" or "12.34%"
    const raw =
      typeof value === "number" ? value : String(value).replace("%", "").trim();
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      return `${num.toFixed(2)}%`;
    }
    return "0.00%";
  };

  // derive status label from numeric CPU
  const getStatus = (cpuNumeric) => {
    const percentage = Number(cpuNumeric) || 0;
    if (percentage >= THRESHOLD_CRITICAL) return "Critical";
    if (percentage >= THRESHOLD_WARNING) return "Warning";
    return "Normal";
  };

  // status -> ant color map
  const STATUS_COLOR_MAP = {
    Critical: "red",
    Warning: "orange",
    Normal: "green",
  };
  const getStatusColor = (status) => STATUS_COLOR_MAP[status] || "blue";

  // Data fetch (POST with account_ids from localStorage)
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = "http://47.130.218.97:8005/performance/filter";

      // load & normalize account_ids from localStorage
      let storedAccountId = localStorage.getItem("account_ids");
      try {
        storedAccountId = JSON.parse(storedAccountId);
      } catch {
        // keep as raw value (string) if parsing fails
      }

      const normalizeId = (id) => String(id ?? "").trim();
      const accountIds = Array.isArray(storedAccountId)
        ? storedAccountId.map(normalizeId).filter(Boolean)
        : [normalizeId(storedAccountId)].filter(Boolean);

      const requestBody = { account_ids: accountIds };
      // debug
      // console.log("➡️ POST Body:", requestBody);

      // POST (with timeout)
      const response = await axios.post(apiUrl, requestBody, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });

      // Accept both data.data (common) or data (if already the array)
      const responseData = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      if (!Array.isArray(responseData) || responseData.length === 0) {
        // No data returned — surface info but keep UI usable
        setError({
          title: "No Data",
          message: "No performance data returned from API.",
          type: "info",
        });
        setPerformanceData([]);
        setFilteredData([]);
        return;
      }

      // Map backend rows to a stable shape (defensively)
      const formattedData = responseData.map((item, index) => {
        const cpuNumeric = Number(
          item?.cpu_utilization ?? item?.cpuUsage ?? item?.cpu ?? 0
        );
        const accountId = String(item?.account_id ?? item?.accountId ?? "").trim();
        const accountName = String(item?.account_name ?? item?.accountName ?? "N/A").trim();
        const region = String(item?.region ?? item?.aws_region ?? "N/A").trim();
        const instanceId = String(item?.instance_id ?? item?.instanceId ?? item?.id ?? `inst-${index}`);

        return {
          key: item?.id ?? `item-${index}`,
          id: item?.id ?? `item-${index}`,
          accountId,
          accountName,
          region,
          instanceId,
          cpuUsageNumeric: Number.isFinite(cpuNumeric) ? cpuNumeric : 0,
          cpuUsage: formatUsageValue(cpuNumeric),
          cpuWeekly: item?.weekly_trend ?? item?.cpu_weekly ?? "N/A",
          cpuMonthly: item?.monthly_trend ?? item?.cpu_monthly ?? "N/A",
          recommended:
            item?.weekly_sizing_recommendation ||
            item?.monthly_sizing_recommendation ||
            item?.recommended ||
            "No recommendation",
          timestamp: item?.timestamp ?? item?.updated_at ?? null,
          weeklyTrend: item?.weekly_trend ?? null,
          monthlyTrend: item?.monthly_trend ?? null,
        };
      });

      // build unique lists for selects (deduped)
      setUniqueRegions(
        [...new Set(formattedData.map((i) => i.region))].filter(Boolean)
      );
      setUniqueAccountIds(
        [...new Set(formattedData.map((i) => i.accountId))].filter(Boolean)
      );
      setUniqueAccountNames(
        [...new Set(formattedData.map((i) => i.accountName))].filter(Boolean)
      );

      setPerformanceData(formattedData);
      setFilteredData(formattedData);
    } catch (err) {
      console.error("Error fetching performance data:", err?.message ?? err);
      setError({
        title: "API Error",
        message: err?.message ?? "Unknown error",
        type: "error",
        showRetry: true,
      });

      // fallback to small mock dataset so UI remains interactive
      setPerformanceData(mockData);
      setFilteredData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply top-level filters to the already-mapped data
  useEffect(() => {
    let result = [...performanceData];

    if (filters.accountId) {
      const v = String(filters.accountId).toLowerCase();
      result = result.filter((item) =>
        String(item.accountId ?? "").toLowerCase().includes(v)
      );
    }

    if (filters.accountName) {
      const v = String(filters.accountName).toLowerCase();
      result = result.filter((item) =>
        String(item.accountName ?? "").toLowerCase().includes(v)
      );
    }

    if (filters.region) {
      const v = String(filters.region).toLowerCase();
      result = result.filter((item) =>
        String(item.region ?? "").toLowerCase().includes(v)
      );
    }

    setFilteredData(result);
  }, [filters, performanceData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
  };

  const clearFilters = () =>
    setFilters({
      accountId: "",
      accountName: "",
      region: "",
    });

  const getUsageColor = (cpuNumeric) => {
    const percentage = Number(cpuNumeric) || 0;
    if (percentage >= THRESHOLD_CRITICAL) return "red";
    if (percentage >= THRESHOLD_WARNING) return "orange";
    return "green";
  };

  // Table columns — removed column header filters to avoid duplication with top selects
  const columns = [
    {
      title: "SI. No",
      dataIndex: "slNo",
      key: "slNo",
      width: 80,
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Account ID",
      dataIndex: "accountId",
      key: "accountId",
      width: 120,
      fixed: "left",
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => (a.accountId || "").localeCompare(b.accountId || ""),
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => (a.accountName || "").localeCompare(b.accountName || ""),
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 120,
      render: (text) => (
        <Tag color="blue" style={{ fontSize: "12px" }}>
          {text}
        </Tag>
      ),
      sorter: (a, b) => (a.region || "").localeCompare(b.region || ""),
    },
    {
      title: "Instance ID",
      dataIndex: "instanceId",
      key: "instanceId",
      width: 180,
      ellipsis: true,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: "CPU Usage",
      dataIndex: "cpuUsage",
      key: "cpuUsage",
      width: 120,
      render: (_, record) => (
        <Tag color={getUsageColor(record.cpuUsageNumeric)} style={{ minWidth: "60px", textAlign: "center" }}>
          {record.cpuUsage}
        </Tag>
      ),
      sorter: (a, b) => (Number(a.cpuUsageNumeric || 0) - Number(b.cpuUsageNumeric || 0)),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_, record) => {
        const status = getStatus(record.cpuUsageNumeric);
        return (
          <Tag color={getStatusColor(status)} style={{ minWidth: "60px", textAlign: "center" }}>
            {status}
          </Tag>
        );
      },
      filters: [
        { text: "Normal", value: "Normal" },
        { text: "Warning", value: "Warning" },
        { text: "Critical", value: "Critical" },
      ],
      // Keep table-level filter of status only (this is optional)
      onFilter: (value, record) => getStatus(record.cpuUsageNumeric) === value,
      sorter: (a, b) => getStatus(a.cpuUsageNumeric).localeCompare(getStatus(b.cpuUsageNumeric)),
    },
    {
      title: "Recommended",
      dataIndex: "recommended",
      key: "recommended",
      width: 150,
      ellipsis: true,
      render: (text) => (
        <Tag color="purple" style={{ fontSize: "12px" }}>
          {text}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Skeleton active title paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (error && performanceData.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Alert
            message={error.title || "Error"}
            description={error.message}
            type={error.type || "error"}
            action={
              error.showRetry && (
                <Button size="small" type="primary" onClick={fetchPerformanceData} icon={<ReloadOutlined />}>
                  Retry
                </Button>
              )
            }
            closable
            style={{ marginBottom: 24 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ maxWidth: "100%" }}>
      <Row gutter={[16, 8]} style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 4, marginTop: 10 }}>
        <Col xs={24} md={12}>
          <Title
            level={4}
            style={{
              fontFamily: "'Roboto', 'Segoe UI', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
              color: "#1f2937",
              margin: 0,
            }}
          >
            Performance Right Sizing
          </Title>
        </Col>

        <Col xs={24} md={12}>
          <Row gutter={[8, 8]} justify="end">
            <Col xs={12} sm={6}>
              <Select
                showSearch
                placeholder="Select Account ID"
                style={{ width: "100%" }}
                value={filters.accountId || undefined}
                onChange={(value) => handleFilterChange("accountId", value)}
                allowClear
                size="middle"
                filterOption={(input, option) => option?.children.toLowerCase().includes(input.toLowerCase())}
              >
                {uniqueAccountIds.map((accountId) => (
                  <Option key={accountId} value={accountId}>
                    {accountId}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={12} sm={6}>
              <Select
                showSearch
                placeholder="Select Account Name"
                style={{ width: "100%" }}
                value={filters.accountName || undefined}
                onChange={(value) => handleFilterChange("accountName", value)}
                allowClear
                size="middle"
                filterOption={(input, option) => option?.children.toLowerCase().includes(input.toLowerCase())}
              >
                {uniqueAccountNames.map((accountName) => (
                  <Option key={accountName} value={accountName}>
                    {accountName}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={12} sm={6}>
              <Select
                showSearch
                placeholder="Select Region"
                style={{ width: "100%" }}
                value={filters.region || undefined}
                onChange={(value) => handleFilterChange("region", value)}
                allowClear
                size="middle"
                filterOption={(input, option) => option?.children.toLowerCase().includes(input.toLowerCase())}
              >
                {uniqueRegions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={12} sm={4}>
              <Button onClick={clearFilters} style={{ width: "100%" }}>
                Clear
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {error && performanceData.length > 0 && (
        <Alert
          message="API Connection Issue"
          description={`${error.message} Showing sample data for demonstration.`}
          type="warning"
          closable
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" type="link" onClick={fetchPerformanceData} icon={<ReloadOutlined />}>
              Retry API
            </Button>
          }
        />
      )}

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="key"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1200 }}
        size="middle"
        bordered={false}
        style={{
          border: "none",
          borderCollapse: "separate",
          borderSpacing: "0 8px",
        }}
        className="custom-table"
      />
    </div>
  );
}

export default RightSizing;
