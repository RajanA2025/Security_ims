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
    region: ''
  });
  const [uniqueRegions, setUniqueRegions] = useState([]);
  const [uniqueAccountIds, setUniqueAccountIds] = useState([]);

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
      
      const apiUrl = 'http://13.212.15.14:8008/performance';
      console.log('Fetching data from:', apiUrl);
      
      const response = await axios({
        method: 'get',
        url: apiUrl,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // The API returns { data: [...] }, so we need to access response.data.data
      const responseData = response.data.data || [];
      console.log('Received data:', responseData);
      
      if (!responseData || responseData.length === 0) {
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
      const formattedData = responseData.map((item) => ({
        key: item.id, // Ant Design requires 'key' for table rows
        id: item.id,
        accountId: String(item.account_id).trim(),
        accountName: String(item.account_name).trim(),
        region: String(item.region).trim(),
        instanceId: String(item.instance_id).trim(),
        // Round values to 2 decimal places before formatting
        cpuUsage: formatUsageValue(Number(item.cpu_utilization).toFixed(2)),
        memoryUsage: formatUsageValue(Number(item.memory_utilization).toFixed(2)),
        diskUsage: formatUsageValue(Number(item.disk_utilization).toFixed(2)),
        // Include additional fields from the API if needed
        timestamp: item.timestamp,
        weeklyTrend: item.weekly_trend,
        monthlyTrend: item.monthly_trend,
        weeklySizingRecommendation: item.weekly_sizing_recommendation,
        monthlySizingRecommendation: item.monthly_sizing_recommendation
      }));
      
      // Extract unique values for filters
      const regions = [...new Set(formattedData.map(item => item.region))].sort();
      const accountIds = [...new Set(formattedData.map(item => item.accountId))].sort();
      
      setUniqueRegions(regions);
      setUniqueAccountIds(accountIds);
      
      console.log('Formatted data:', formattedData);
      setPerformanceData(formattedData);
      setFilteredData(formattedData);
      
    } catch (err) {
      console.error('Error fetching performance data:', err);
      
      let errorMessage = err.message;
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = 'CORS Error: Cannot connect to the API server. This is likely due to Cross-Origin Resource Sharing (CORS) restrictions.';
      }
      
      setError({
        title: 'Failed to Load Data',
        message: errorMessage,
        type: 'error',
        showRetry: true
      });
      
      // Mock data for testing when API fails
      // const mockData = [
      //   {
      //     key: 'mock-1',
      //     id: 'mock-1',
      //     accountId: 'ACC-001',
      //     accountName: 'Production Account',
      //     region: 'us-east-1',
      //     instanceId: 'i-1234567890abcdef0',
      //     cpuUsage: '45.00%',
      //     memoryUsage: '67.00%',
      //     diskUsage: '23.00%'
      //   },
      //   {
      //     key: 'mock-2',
      //     id: 'mock-2',
      //     accountId: 'ACC-002',
      //     accountName: 'Development Account',
      //     region: 'us-west-2',
      //     instanceId: 'i-0987654321fedcba0',
      //     cpuUsage: '78.00%',
      //     memoryUsage: '56.00%',
      //     diskUsage: '89.00%'
      //   },
      //   {
      //     key: 'mock-3',
      //     id: 'mock-3',
      //     accountId: 'ACC-001',
      //     accountName: 'Production Account',
      //     region: 'eu-west-1',
      //     instanceId: 'i-abcdef1234567890',
      //     cpuUsage: '23.00%',
      //     memoryUsage: '34.00%',
      //     diskUsage: '45.00%'
      //   }
      // ];
      
      setPerformanceData(mockData);
      setFilteredData(mockData);
      setUniqueRegions(['us-east-1', 'us-west-2', 'eu-west-1']);
      setUniqueAccountIds(['ACC-001', 'ACC-002']);
      
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

  // Table columns configuration
  const columns = [
    {
      title: 'SI. No',
      dataIndex: 'slNo',
      key: 'slNo',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Account ID',
      dataIndex: 'accountId',
      key: 'accountId',
      width: 120,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Account Name',
      dataIndex: 'accountName',
      key: 'accountName',
      width: 150,
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
    },
    {
      title: 'Instance ID',
      dataIndex: 'instanceId',
      key: 'instanceId',
      width: 180,
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
      title: 'Memory Usage',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      width: 120,
      render: (text) => (
        <Tag color={getUsageColor(text)} style={{ minWidth: '60px', textAlign: 'center' }}>
          {text}
        </Tag>
      ),
      sorter: (a, b) => parseFloat(a.memoryUsage) - parseFloat(b.memoryUsage),
    },
    {
      title: 'Disk Usage',
      dataIndex: 'diskUsage',
      key: 'diskUsage',
      width: 120,
      render: (text) => (
        <Tag color={getUsageColor(text)} style={{ minWidth: '60px', textAlign: 'center' }}>
          {text}
        </Tag>
      ),
      sorter: (a, b) => parseFloat(a.diskUsage) - parseFloat(b.diskUsage),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />
          <Skeleton.Input active size="large" style={{ width: '100%', height: 400, marginBottom: 24 }} />
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  // Error state
  if (error && performanceData.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Alert
            message={error.title || 'Error'}
            description={error.message}
            type={error.type || 'error'}
            action={
              <Button
                size="small"
                type="primary"
                onClick={fetchPerformanceData}
                icon={<ReloadOutlined />}
              >
                Retry
              </Button>
            }
            closable
            style={{ marginBottom: 24 }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with Filters - Similar to SecurityTools */}
      <Row gutter={[16, 16]} style={{ justifyContent: "flex-end", marginBottom: 16 }}>
        <Col md={16}>
          <Typography.Title 
            level={4}
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
              fontSize: "20px",
              fontWeight: 500,
              color: "black",
              margin: 0
            }}
          >
            Performance Monitoring
          </Typography.Title>
        </Col>
        <Col md={4}>
          <Input
            placeholder="Search Account ID"
            value={filters.accountId}
            onChange={(e) => handleFilterChange('accountId', e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
        <Col md={4}>
          <Select
            placeholder="Region"
            style={{ width: '100%' }}
            value={filters.region || undefined}
            onChange={(value) => handleFilterChange('region', value)}
            allowClear
          >
            {uniqueRegions.map((region) => (
              <Option key={region} value={region}>
                {region}
              </Option>
            ))}
          </Select>
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
      <Card style={{ marginBottom: 24, padding: '12px 16px' }}>
        <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
          Performance Overview Chart
        </Title>
        <div style={{ height: '250px', marginTop: '2px' }}>
          <CpuUsageChart data={filteredData} filters={filters} />
        </div>
      </Card>

      {/* Performance Data Table - Styled like SecurityTools */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="user_name"
        pagination={{ pageSize: 8 }}
      />
     

      {/* Show error notification if API failed but we have mock data */}
      {error && performanceData.length > 0 && (
        <Alert
          message="API Connection Issue"
          description={`Showing mock data. ${error.message}`}
          type="warning"
          closable
          style={{ marginTop: 24 }}
        />
      )}
    </>
  );
};

export default Monitoring;
