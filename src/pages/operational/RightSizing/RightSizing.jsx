import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Alert,
  Tag,
  Skeleton
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../../../lib/api';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const RightSizing = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    accountId: '',
    accountName: '',
    region: ''
  });
  const [uniqueRegions, setUniqueRegions] = useState([]);
  const [uniqueAccountIds, setUniqueAccountIds] = useState([]);
  const [uniqueAccountNames, setUniqueAccountNames] = useState([]);
// get jwt_token from localStorage
const jwt_token = localStorage.getItem("jwt_token");

  // Format usage values to ensure they're properly formatted with 2 decimal places
  const formatUsageValue = (value) => {
    if (value === null || value === undefined) return '0.00%';

    // If it's already a string with % sign, ensure it has 2 decimal places
    if (typeof value === 'string' && value.endsWith('%')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return `${num.toFixed(2)}%`;
      }
      return value;
    }

    // If it's a number, format with 2 decimal places and add %
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return `${num.toFixed(2)}%`;
    }

    return '0.00%';
  };

  // Get status based on CPU usage
  const getStatus = (cpuUsage) => {
    const percentage = parseFloat(cpuUsage);
    if (percentage >= 80) return 'Critical';
    if (percentage >= 60) return 'Warning';
    return 'Normal';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical': return 'red';
      case 'Warning': return 'orange';
      case 'Normal': return 'green';
      default: return 'blue';
    }
  };

// Fetch performance data from API (POST with account_ids)
const fetchPerformanceData = async () => {
  try {
    setLoading(true);
    setError(null);

    // --- NEW API URL ---
    const apiUrl = "http://47.130.218.97:8005/performance/filter";

    // --- Load IDs from localStorage ---
    let storedAccountId = localStorage.getItem("account_ids");

    // Safely parse to array
    try {
      storedAccountId = JSON.parse(storedAccountId);
    } catch {
      storedAccountId = [storedAccountId];
    }

    const normalizeId = (id) => String(id).trim();
    const accountIds = Array.isArray(storedAccountId)
      ? storedAccountId.map(normalizeId)
      : [normalizeId(storedAccountId)];

    const requestBody = { account_ids: accountIds };
    console.log("➡️ POST Body:", requestBody);

    // --- POST REQUEST ---
    const response = await axios.post(apiUrl, requestBody, {
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${jwt_token}`
       },
      timeout: 15000,
    });

    const responseData = response.data?.data || response.data || [];

    if (!Array.isArray(responseData) || responseData.length === 0) {
      setError({
        title: "No Data",
        message: "No performance data returned.",
        type: "info",
      });
      setPerformanceData([]);
      setFilteredData([]);
      return;
    }

    // --- Format data ---
    const formattedData = responseData.map((item, index) => ({
      key: item.id || `item-${index}`,
      id: item.id || `item-${index}`,
      accountId: String(item.account_id || "").trim(),
      accountName: String(item.account_name || "N/A").trim(),
      region: String(item.region || "N/A").trim(),
      instanceId: String(item.instance_id || "N/A").trim(),

      cpuUsage: formatUsageValue(
        Number(item.cpu_utilization || 0).toFixed(2)
      ),

      cpuWeekly: item.weekly_trend || "N/A",
      cpuMonthly: item.monthly_trend || "N/A",
      recommended:
        item.weekly_sizing_recommendation ||
        item.monthly_sizing_recommendation ||
        "No recommendation",

      timestamp: item.timestamp,
      weeklyTrend: item.weekly_trend,
      monthlyTrend: item.monthly_trend,
    }));

    // --- Build filter lists from backend-filtered results ---
    setUniqueRegions(
      [...new Set(formattedData.map((i) => i.region))].filter((v) => v)
    );
    setUniqueAccountIds(
      [...new Set(formattedData.map((i) => i.accountId))].filter((v) => v)
    );
    setUniqueAccountNames(
      [...new Set(formattedData.map((i) => i.accountName))].filter((v) => v)
    );

    setPerformanceData(formattedData);
    setFilteredData(formattedData);

  } catch (err) {
    console.error("Error fetching performance data:", err);

    setError({
      title: "API Error",
      message: err.message,
      type: "error",
      showRetry: true,
    });

    // fallback mock data
    setPerformanceData(mockData);
    setFilteredData(mockData);

  } finally {
    setLoading(false);
  }
};


  // Initial data fetch
  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...performanceData];

    if (filters.accountId) {
      result = result.filter(item =>
        item.accountId.toLowerCase().includes(filters.accountId.toLowerCase())
      );
    }

    if (filters.accountName) {
      result = result.filter(item =>
        item.accountName.toLowerCase().includes(filters.accountName.toLowerCase())
      );
    }

    if (filters.region) {
      result = result.filter(item =>
        item.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    setFilteredData(result);
  }, [filters, performanceData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      accountId: '',
      accountName: '',
      region: ''
    });
  };

  // Get usage color based on percentage
  const getUsageColor = (usage) => {
    const percentage = parseFloat(usage);
    if (percentage >= 80) return 'red';
    if (percentage >= 60) return 'orange';
    return 'green';
  };

  // Table columns configuration
  const columns = [
    {
      title: 'SI. No',
      dataIndex: 'slNo',
      key: 'slNo',
      width: 80,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Account ID',
      dataIndex: 'accountId',
      key: 'accountId',
      width: 120,
      fixed: 'left',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.accountId.localeCompare(b.accountId),
      filters: uniqueAccountIds.map(accountId => ({
        text: accountId,
        value: accountId
      })),
      onFilter: (value, record) => record.accountId === value,
      filterSearch: true,
    },
    {
      title: 'Account Name',
      dataIndex: 'accountName',
      key: 'accountName',
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.accountName.localeCompare(b.accountName),
      filters: uniqueAccountNames.map(accountName => ({
        text: accountName,
        value: accountName
      })),
      onFilter: (value, record) => record.accountName === value,
      filterSearch: true,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      width: 120,
      render: (text) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {text}
        </Tag>
      ),
      sorter: (a, b) => a.region.localeCompare(b.region),
      filters: uniqueRegions.map(region => ({
        text: region,
        value: region
      })),
      onFilter: (value, record) => record.region === value,
      filterSearch: true,
    },
    {
      title: 'Instance ID',
      dataIndex: 'instanceId',
      key: 'instanceId',
      width: 180,
      ellipsis: true,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'CPU Usage',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      width: 120,
      render: (text) => (
        <Tag color={getUsageColor(text)} style={{ minWidth: '60px', textAlign: 'center' }}>
          {text}
        </Tag>
      ),
      sorter: (a, b) => parseFloat(a.cpuUsage) - parseFloat(b.cpuUsage),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = getStatus(record.cpuUsage);
        return (
          <Tag color={getStatusColor(status)} style={{ minWidth: '60px', textAlign: 'center' }}>
            {status}
          </Tag>
        );
      },
      filters: [
        { text: 'Normal', value: 'Normal' },
        { text: 'Warning', value: 'Warning' },
        { text: 'Critical', value: 'Critical' },
      ],
      onFilter: (value, record) => getStatus(record.cpuUsage) === value,
      sorter: (a, b) => {
        const statusA = getStatus(a.cpuUsage);
        const statusB = getStatus(b.cpuUsage);
        return statusA.localeCompare(statusB);
      },
    },
    {
      title: 'Recommended',
      dataIndex: 'recommended',
      key: 'recommended',
      width: 150,
      ellipsis: true,
      render: (text) => (
        <Tag color="purple" style={{ fontSize: '12px' }}>
          {text}
        </Tag>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Skeleton active title paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  // Error state (only show if no data at all)
  if (error && performanceData.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Alert
            message={error.title || 'Error'}
            description={error.message}
            type={error.type || 'error'}
            action={
              error.showRetry && (
                <Button
                  size="small"
                  type="primary"
                  onClick={fetchPerformanceData}
                  icon={<ReloadOutlined />}
                >
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
    // <div style={{ padding: '0 0 24px 0' }}>
      <div className='p-4' style={{ maxWidth: '100%'}}>
        {/* Header with Filters */}
        <Row gutter={[16, 8]} style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 4 ,marginTop:10}}>
          <Col xs={24} md={12}>
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
              Performance Right Sizing
            </Typography.Title>
          </Col>
          <Col xs={24} md={12}>
            <Row gutter={[8, 8]} justify="end">
              <Col xs={12} sm={6}>
                <Select
                  showSearch
                  placeholder="Select Account ID"
                  style={{ width: '100%' }}
                  value={filters.accountId || undefined}
                  onChange={(value) => handleFilterChange('accountId', value)}
                  allowClear
                  size="middle"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().includes(input.toLowerCase())
                  }
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
                  style={{ width: '100%' }}
                  value={filters.accountName || undefined}
                  onChange={(value) => handleFilterChange('accountName', value)}
                  allowClear
                  size="middle"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {uniqueAccountNames.map((accountName) => (
                    <Option key={accountName} value={accountName}>
                      {accountName}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Show error notification if API failed but we have mock data */}
        {error && performanceData.length > 0 && (
          <Alert
            message="API Connection Issue"
            description={`${error.message} Showing sample data for demonstration.`}
            type="warning"
            closable
            style={{ marginBottom: 24 }}
            action={
              <Button
                size="small"
                type="link"
                onClick={fetchPerformanceData}
                icon={<ReloadOutlined />}
              >
                Retry API
              </Button>
            }
          />
        )}

        {/* Performance Data Table */}
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
            border: 'none',
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
          }}
          className="custom-table"
        />
      </div>
    // </div>
  );
}

export default RightSizing;
