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

  // Fetch performance data from API
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_ENDPOINT = '/performance';

      const response = await api.get(API_ENDPOINT, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      });


      // The API returns { data: [...] }, so we need to access response.data.data
      const responseData = response.data?.data || response.data || [];

      if (!Array.isArray(responseData) || responseData.length === 0) {
        setError({
          title: 'No Data Available',
          message: 'No performance data was returned from the server.',
          type: 'info'
        });
        setPerformanceData([]);
        setFilteredData([]);
        return;
      }

      // Transform the API response to match our expected format
      const formattedData = responseData.map((item, index) => ({
        key: item.id || `item-${index}`, // Ant Design requires 'key' for table rows
        id: item.id || `item-${index}`,
        accountId: String(item.account_id || item.accountId || '').trim(),
        accountName: String(item.account_name || item.accountName || 'N/A').trim(),
        region: String(item.region || 'N/A').trim(),
        instanceId: String(item.instance_id || item.instanceId || 'N/A').trim(),
        // Round values to 2 decimal places before formatting
        cpuUsage: formatUsageValue(Number(item.cpu_utilization || item.cpuUtilization || 0).toFixed(2)),
        // New columns from API data
        cpuWeekly: item.weekly_trend || item.weeklyTrend || 'N/A',
        cpuMonthly: item.monthly_trend || item.monthlyTrend || 'N/A',
        recommended: item.weekly_sizing_recommendation ||
          item.monthly_sizing_recommendation ||
          item.weeklySizingRecommendation ||
          item.monthlySizingRecommendation ||
          'No recommendation',
        // Include additional fields from the API if needed
        timestamp: item.timestamp,
        weeklyTrend: item.weekly_trend || item.weeklyTrend,
        monthlyTrend: item.monthly_trend || item.monthlyTrend,
        weeklySizingRecommendation: item.weekly_sizing_recommendation || item.weeklySizingRecommendation,
        monthlySizingRecommendation: item.monthly_sizing_recommendation || item.monthlySizingRecommendation
      }));

      // Extract unique values for filters
      // After formattedData is created

      // Get stored account IDs from localStorage
      const storedIds = JSON.parse(localStorage.getItem("account_ids") || "[]");

      // Filter by stored account IDs if available
      let filteredByStorage = formattedData;
      if (Array.isArray(storedIds) && storedIds.length > 0) {
        filteredByStorage = formattedData.filter(item => storedIds.includes(item.accountId));
      }

      // Extract unique values based on filtered list
      const regions = [...new Set(filteredByStorage.map(item => item.region).filter(r => r && r !== 'N/A'))].sort();
      const accountIds = [...new Set(filteredByStorage.map(item => item.accountId).filter(a => a && a !== ''))].sort();
      const accountNames = [...new Set(filteredByStorage.map(item => item.accountName).filter(a => a && a !== 'N/A'))].sort();

      setUniqueRegions(regions);
      setUniqueAccountIds(accountIds);
      setUniqueAccountNames(accountNames);

      // Set table data from filtered list
      setPerformanceData(filteredByStorage);
      setFilteredData(filteredByStorage);


    } catch (err) {
      console.error('Error fetching performance data:', err);

      let errorMessage = err.message;
      let errorType = 'error';

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout: The server took too long to respond.';
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = 'Network Error: Please check your internet connection and try again.';
      } else if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = 'CORS Error: Cannot connect to the API server. This is likely due to Cross-Origin Resource Sharing (CORS) restrictions.';
      } else if (err.response) {
        // Server responded with an error status
        errorMessage = `Server Error (${err.response.status}): ${err.response.data?.message || err.response.statusText}`;
      }

      setError({
        title: 'Failed to Load Data',
        message: errorMessage,
        type: errorType,
        showRetry: true
      });

      // Mock data for testing when API fails
      const mockData = [
        {
          key: 'mock-1',
          id: 'mock-1',
          accountId: 'ACC-001',
          accountName: 'Production Account',
          region: 'us-east-1',
          instanceId: 'i-1234567890abcdef0',
          cpuUsage: '45.00%',
          cpuWeekly: 'Stable',
          cpuMonthly: 'Increasing',
          recommended: 't3.medium'
        },
        {
          key: 'mock-2',
          id: 'mock-2',
          accountId: 'ACC-002',
          accountName: 'Development Account',
          region: 'us-west-2',
          instanceId: 'i-0987654321fedcba0',
          cpuUsage: '78.00%',
          cpuWeekly: 'High',
          cpuMonthly: 'Stable',
          recommended: 't3.large'
        },
        {
          key: 'mock-3',
          id: 'mock-3',
          accountId: 'ACC-001',
          accountName: 'Production Account',
          region: 'eu-west-1',
          instanceId: 'i-abcdef1234567890',
          cpuUsage: '23.00%',
          cpuWeekly: 'Low',
          cpuMonthly: 'Decreasing',
          recommended: 't3.small'
        },
        {
          key: 'mock-4',
          id: 'mock-4',
          accountId: 'ACC-003',
          accountName: 'Staging Account',
          region: 'ap-south-1',
          instanceId: 'i-fedcba0987654321',
          cpuUsage: '85.00%',
          cpuWeekly: 'Critical',
          cpuMonthly: 'High',
          recommended: 't3.xlarge'
        }
      ];

      setPerformanceData(mockData);
      setFilteredData(mockData);
      setUniqueRegions(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1']);
      setUniqueAccountIds(['ACC-001', 'ACC-002', 'ACC-003']);
      setUniqueAccountNames(['Production Account', 'Development Account', 'Staging Account']);

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
