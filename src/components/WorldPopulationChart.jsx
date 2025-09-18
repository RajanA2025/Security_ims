import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CpuUsageChart = ({ data = [], filters = {} }) => {
  // Check if we should show instance-level data (when accountId and region are filtered)
  const showInstanceLevel = filters.accountId && filters.region;

  // Process data based on whether we're showing instance-level or account-level data
  let chartData = [];
  
  if (showInstanceLevel) {
    // Show instance-level data
    chartData = data
      .filter(item => 
        (!filters.accountId || item.accountId === filters.accountId) &&
        (!filters.region || item.region === filters.region)
      )
      .map(item => ({
        name: item.instanceId,
        'CPU Usage': typeof item.cpuUsage === 'string' 
          ? parseFloat(item.cpuUsage.replace('%', '')) 
          : item.cpuUsage || 0
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Show account-level data (grouped by account)
    const accountData = data.reduce((acc, item) => {
      const accountKey = item.accountName || `Account ${item.accountId}`;
      const cpuValue = typeof item.cpuUsage === 'string' 
        ? parseFloat(item.cpuUsage.replace('%', '')) 
        : item.cpuUsage || 0;
      
      if (!acc[accountKey]) {
        acc[accountKey] = {
          name: accountKey,
          total: 0,
          count: 0
        };
      }
      
      acc[accountKey].total += cpuValue;
      acc[accountKey].count += 1;
      
      return acc;
    }, {});

    // Calculate average CPU usage for each account and sort by account name
    chartData = Object.values(accountData)
      .map(account => ({
        name: account.name,
        'CPU Usage': parseFloat((account.total / account.count).toFixed(2))
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        <p>No CPU usage data available</p>
      </div>
    );
  }

  // Calculate dynamic Y-axis domain based on data
  const calculateYAxisDomain = () => {
    if (!chartData || chartData.length === 0) return [0, 100];
    
    try {
      const values = chartData.map(item => {
        const value = item['CPU Usage'];
        return typeof value === 'number' ? value : 0;
      }).filter(val => !isNaN(val));
      
      if (values.length === 0) return [0, 100];
      
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      
      // Add some padding (10% of range or 10, whichever is smaller)
      const range = maxValue - minValue;
      const padding = Math.min(range * 0.1, 10);
      
      return [
        Math.max(0, minValue - padding),
        Math.min(100, maxValue + padding)
      ];
    } catch (error) {
      console.error('Error calculating Y-axis domain:', error);
      return [0, 100];
    }
  };

  // Debug: Log the data being used for the chart
  console.log('Chart data:', chartData);
  
  return (
    <div style={{ width: '100%', height: '300px', padding: '0', boxSizing: 'border-box' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 4px 0', fontSize: '14px', fontWeight: 500 }}>
        {filters.accountId && filters.region ? 'Instance CPU Usage' : 'Average CPU Usage by Account'}
      </h3>
      <div style={{ width: '100%', height: 'calc(100% - 24px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
            barCategoryGap="0%"
            barGap={0}
            barSize={80}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              // stroke="#f0f0f0" 
              horizontal={true} 
              vertical={false}
            />
            <XAxis 
              dataKey="name"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              tickMargin={2}
              // minTickGap={1}
              axisLine={false}
            />
            <YAxis 
              domain={calculateYAxisDomain()}
              tickCount={5}
              tickFormatter={(value) => `${value}%`}
              width={40}
              tick={{ fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip 
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'CPU Usage']}
              labelFormatter={(label) => filters.accountId && filters.region ? `Instance: ${label}` : `Account: ${label}`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="CPU Usage"
              fill="#8884d8"
              name="CPU Usage"
              animationDuration={600}
              isAnimationActive={true}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CpuUsageChart;
