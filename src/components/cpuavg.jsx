// cpuavg.jsx
// Line graph component to display CPU average over the last 7 days
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Spin, Alert } from 'antd';

function CpuAvg() {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cpuData, setCpuData] = useState([]);
    const [dates, setDates] = useState([]);

    // Fetch CPU data from API
    useEffect(() => {
        const fetchCpuData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://47.130.218.97:8012/ec2');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const instances = await response.json();
                console.log('API Response:', instances);
                
                // Process data - group by date and calculate average CPU
                const today = new Date();
                const last7Days = [];
                const dateLabels = [];
                
                console.log('Processing data for instances count:', instances.length);
                
                // Initialize data for last 7 days
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    last7Days.push({
                        date: dateStr,
                        totalCpu: 0,
                        count: 0
                    });
                    dateLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                }
                
                // Process each instance's data
                instances.forEach(instance => {
                    if (instance.cpu_avg_7d !== undefined) {
                        const launchDate = new Date(instance.launch_time);
                        const launchDateStr = launchDate.toISOString().split('T')[0];
                        
                        // Find the corresponding day in our 7-day window
                        const dayIndex = last7Days.findIndex(day => day.date === launchDateStr);
                        if (dayIndex !== -1) {
                            last7Days[dayIndex].totalCpu += instance.cpu_avg_7d;
                            last7Days[dayIndex].count += 1;
                        }
                    }
                });
                
                // Calculate average CPU for each day
                const cpuAverages = last7Days.map(day => 
                    day.count > 0 ? parseFloat((day.totalCpu / day.count).toFixed(2)) : 0
                );
                
                console.log('Processed CPU Averages:', cpuAverages);
                console.log('Date Labels:', dateLabels);
                
                setCpuData(cpuAverages);
                setDates(dateLabels);
                setError(null);
                
                // Log the chart data that will be used
                console.log('Chart data:', {
                    dates: dateLabels,
                    cpuAverages: cpuAverages
                });
            } catch (err) {
                console.error('Error fetching CPU data:', err);
                setError('Failed to load CPU data. Please try again later.');
                // Fallback to mock data if API fails
                const mockDates = [];
                const mockData = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    mockDates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    mockData.push(Math.floor(Math.random() * 10) + 1); // 1-10% as fallback
                }
                setCpuData(mockData);
                setDates(mockDates);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCpuData();
    }, []);
    
    // Initialize and update chart when data changes
    useEffect(() => {
        console.log('Chart effect running with data:', { cpuData, dates });
        if (chartRef.current && cpuData.length > 0) {
            // Destroy previous chart instance if exists
            if (chartInstance.current) {
                chartInstance.current.dispose();
            }
            
            // Create new chart instance
            chartInstance.current = echarts.init(chartRef.current);
            
            // Chart configuration
            const option = {
                title: {
                    text: 'CPU Average Usage (Last 7 Days)',
                    left: 'center',
                    textStyle: {
                        color: '#333',
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}<br/>{a0}: {c0}%'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: dates.length > 0 ? dates : Array(7).fill(''),
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    axisLabel: {
                        color: '#666'
                    }
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    max: 100,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    axisLabel: {
                        formatter: '{value}%',
                        color: '#666'
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#eee'
                        }
                    }
                },
                series: [{
                    name: 'Average CPU Usage',
                    type: 'line',
                    data: cpuData,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        color: '#4e73df',
                        borderWidth: 2
                    },
                    lineStyle: {
                        width: 3,
                        color: '#4e73df'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(78, 115, 223, 0.3)' },
                            { offset: 1, color: 'rgba(78, 115, 223, 0.05)' }
                        ])
                    },
                    markLine: {
                        silent: true,
                        data: [{
                            type: 'average',
                            name: 'Average',
                            lineStyle: {
                                color: '#e74a3b',
                                type: 'dashed'
                            },
                            label: {
                                formatter: 'Avg: {c}%',
                                position: 'insideEndBottom'
                            }
                        }]
                    }
                }]
            };

            // Set the chart options
            chartInstance.current.setOption(option);

            // Handle window resize
            const handleResize = () => {
                chartInstance.current?.resize();
            };
            window.addEventListener('resize', handleResize);

            // Cleanup
            return () => {
                window.removeEventListener('resize', handleResize);
                if (chartInstance.current) {
                    chartInstance.current.dispose();
                }
            };
        }
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 10
                }}>
                    <Spin size="large" />
                </div>
            )}
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            )}
            <div 
                ref={chartRef} 
                style={{ 
                    width: '100%', 
                    height: '400px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}
            />
        </div>
    );
}

export default CpuAvg;
