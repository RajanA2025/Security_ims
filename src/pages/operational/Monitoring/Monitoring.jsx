import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  Alert,
  Spin,
  Tag,
  Skeleton
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import CpuUsageChart from '../../../components/WorldPopulationChart';
import api from '../../../lib/api';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const Monitoring = () => {
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

  // Fetch performance data from API
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Read account_ids from localStorage
      let storedIds = JSON.parse(localStorage.getItem("account_ids") || "[]");

      // If user mistakenly stored single string — convert to array
      if (!Array.isArray(storedIds)) {
        storedIds = [storedIds];
      }

      // API POST URL
      const apiUrl = "http://47.130.218.97:8005/performance/filter";

      console.log("POST →", apiUrl, storedIds);

      // POST CALL
      const token = localStorage.getItem("auth_token");
      const response = await axios.post(
        apiUrl,
        { account_ids: storedIds },   // <-- sending required payload
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          timeout: 10000,
        }
      );

      console.log("API Response:", response);

      // API returns { data: [...] }
      const responseData = response.data?.data || [];

      if (!Array.isArray(responseData) || responseData.length === 0) {
        setError({
          title: "No Data Available",
          message: "No performance data returned for the selected accounts.",
          type: "info",
        });
        setPerformanceData([]);
        setFilteredData([]);
        return;
      }

      // Format table rows
      const formattedData = responseData.map((item, index) => ({
        key: item.id || `row-${index}`,
        id: item.id || `row-${index}`,

        accountId: String(item.account_id || ""),
        accountName: String(item.account_name || "N/A"),
        region: String(item.region || "N/A"),
        instanceId: String(item.instance_id || "N/A"),

        cpuUsage: formatUsageValue(Number(item.cpu_utilization).toFixed(2)),
        memoryUsage: formatUsageValue(Number(item.memory_utilization).toFixed(2)),
        diskUsage: formatUsageValue(Number(item.disk_utilization).toFixed(2)),
      }));

      // Compute dropdown filters
      setUniqueRegions([...new Set(formattedData.map(i => i.region))]);
      setUniqueAccountIds([...new Set(formattedData.map(i => i.accountId))]);
      setUniqueAccountNames([...new Set(formattedData.map(i => i.accountName))]);

      // API already filtered → just set data
      setPerformanceData(formattedData);
      setFilteredData(formattedData);

    } catch (err) {
      console.error("Error fetching performance data:", err);

      setError({
        title: "Failed to Load Data",
        message: err.message,
        type: "error",
        showRetry: true,
      });
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

  // Get usage status
  const getUsageStatus = (usage) => {
    const percentage = parseFloat(usage);
    if (percentage >= 80) return 'error';
    if (percentage >= 60) return 'warning';
    return 'success';
  };

  // Table columns configuration with filtering only
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
      filters: uniqueAccountIds.map((accountId) => ({
        text: accountId,
        value: accountId,
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
      filters: uniqueAccountNames.map((accountName) => ({
        text: accountName,
        value: accountName,
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
      filters: uniqueRegions.map((region) => ({
        text: region,
        value: region,
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
    }
    // {
    //   title: 'Memory Usage',
    //   dataIndex: 'memoryUsage',
    //   key: 'memoryUsage',
    //   width: 120,
    //   render: (text) => (
    //     <Tag color={getUsageColor(text)} style={{ minWidth: '60px', textAlign: 'center' }}>
    //       {text}
    //     </Tag>
    //   ),
    // },
    // {
    //   title: 'Disk Usage',
    //   dataIndex: 'diskUsage',
    //   key: 'diskUsage',
    //   width: 120,
    //   render: (text) => (
    //     <Tag color={getUsageColor(text)} style={{ minWidth: '60px', textAlign: 'center' }}>
    //       {text}
    //     </Tag>
    //   ),
    // },
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
    <div className='p-4' style={{ maxWidth: '100%' }}>
      {/* Header with Filters */}
      <Row gutter={[16, 8]} style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 10 }}>
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
            Performance Monitoring
          </Typography.Title>
        </Col>
        <Col xs={24} md={12}>
          <Row gutter={[8, 8]} justify="end">

            <Col xs={8} sm={6}>
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
            {/* <Col xs={8} sm={6}>
                <Select
                  showSearch
                  placeholder="Select Region"
                  style={{ width: '100%' }}
                  value={filters.region || undefined}
                  onChange={(value) => handleFilterChange('region', value)}
                  allowClear
                  size="middle"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {uniqueRegions.map((region) => (
                    <Option key={region} value={region}>
                      {region}
                    </Option>
                  ))}
                </Select>
              </Col> */}
          </Row>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Instances"
              value={filteredData.length}
              prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Healthy Instances"
              value={filteredData.filter(d =>
                parseFloat(d.cpuUsage) < 60 &&
                parseFloat(d.memoryUsage) < 60 &&
                parseFloat(d.diskUsage) < 60
              ).length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Warning"
              value={filteredData.filter(d =>
                (parseFloat(d.cpuUsage) >= 50 && parseFloat(d.cpuUsage) < 80) ||
                (parseFloat(d.memoryUsage) >= 50 && parseFloat(d.memoryUsage) < 80) ||
                (parseFloat(d.diskUsage) >= 50 && parseFloat(d.diskUsage) < 80)
              ).length}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Critical"
              value={filteredData.filter(d =>
                parseFloat(d.cpuUsage) >= 80 ||
                parseFloat(d.memoryUsage) >= 80 ||
                parseFloat(d.diskUsage) >= 80
              ).length}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      {/* <Card style={{ marginBottom: 24, padding: '12px 16px' }}>
          <Title level={5} style={{ 
            margin: '0 0 8px 0', 
            fontSize: '16px',
            fontFamily: "'Roboto', 'Segoe UI', sans-serif"
          }}>
            Performance Overview Chart
          </Title>
          <div style={{ height: '250px', marginTop: '2px' }}>
            <CpuUsageChart data={filteredData} filters={filters} />
          </div>
        </Card> */}

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

      {/* Performance Data Table with built-in column filters */}
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
};

export default Monitoring;
