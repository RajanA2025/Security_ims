// cpuavg.jsx
// Line graph component to display CPU average over the last 7 days
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Spin, Alert } from 'antd';

function CpuAvg() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const resizeHandlerRef = useRef(null);

    // Fetch CPU data from API
    useEffect(() => {
        const fetchCpuData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://47.130.218.97:8012/ec2', {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const instances = await response.json();
             
                
                // Process data - group by date and calculate average CPU
                const today = new Date();
                const last7Days = [];
                const dateLabels = [];
                
                
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
                
                
                setCpuData(cpuAverages);
                setDates(dateLabels);
                setError(null);

  // Helper: safe date -> YYYY-MM-DD string
  const toDateKey = (d) => {
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  // Fetch CPU data from API with timeout and robust field handling
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const fetchCpuData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('http://47.130.218.97:8012/ec2', {
          signal: controller.signal,
        });

        if (!res.ok) {
          // throw a descriptive error to be handled below
          throw new Error(`HTTP error: ${res.status} ${res.statusText || ''}`.trim());
        }

        const instances = await res.json();

        // Build last 7 days window (YYYY-MM-DD) and labels
        const today = new Date();
        const windowDays = [];
        const labels = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().split('T')[0];
          windowDays.push({ date: key, totalCpu: 0, count: 0 });
          labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }

        // guard: instances might not be array
        const list = Array.isArray(instances) ? instances : (instances?.data ?? []);

        if (!Array.isArray(list)) {
          throw new Error('Unexpected API response shape');
        }

        // Process each instance: accept multiple possible date fields and cpu fields
        list.forEach((instance) => {
          // CPU value: prefer cpu_avg_7d, fallback to cpu_avg or cpu (numbers); ignore non-numeric
          const rawCpu =
            instance?.cpu_avg_7d ??
            instance?.cpu_avg ??
            instance?.cpu ??
            instance?.cpu_utilization ??
            null;

          const cpuVal = rawCpu == null ? null : Number(rawCpu);
          if (cpuVal == null || Number.isNaN(cpuVal)) return; // skip if no numeric CPU

          // Prefer timestamp-like fields: timestamp, sample_time, launch_time, date
          const possibleDate = instance?.timestamp ?? instance?.sample_time ?? instance?.launch_time ?? instance?.date ?? instance?.created_at;
          const dateKey = toDateKey(possibleDate);

          // If no date available, attempt to use today's date (putting it in latest slot)
          const effectiveDateKey = dateKey || windowDays[windowDays.length - 1].date;

          // Find matching window day
          const idx = windowDays.findIndex((d) => d.date === effectiveDateKey);
          if (idx !== -1) {
            windowDays[idx].totalCpu += cpuVal;
            windowDays[idx].count += 1;
          } else {
            // if date falls outside the window, ignore
          }
        });

        // Build averages (2 decimals)
        const averages = windowDays.map((day) =>
          day.count > 0 ? parseFloat((day.totalCpu / day.count).toFixed(2)) : 0
        );

        setCpuData(averages);
        setDates(labels);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again later.');
        } else {
          setError(err.message || 'Failed to load CPU data. Please try again later.');
        }

        // Fallback mock values (deterministic small values rather than random)
        const mockDates = [];
        const mockData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          mockDates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          mockData.push(0); // safer: default zero so graph shows empty baseline
        }
        setCpuData(mockData);
        setDates(mockDates);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    fetchCpuData();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // Initialize and update chart when data OR dates change
  useEffect(() => {
    // ensure chartRef exists (it will be a div)
    if (!chartRef.current) return;

    // create or reuse instance
    try {
      if (chartInstance.current) {
        // update existing
        chartInstance.current.setOption(getOption(dates, cpuData));
      } else {
        chartInstance.current = echarts.init(chartRef.current);
        chartInstance.current.setOption(getOption(dates, cpuData));
      }
    } catch (e) {
      // swallow chart errors but keep app alive
      // eslint-disable-next-line no-console
      console.error('Chart error', e);
    }

    // resize listener: store ref so we can remove the exact handler
    const handleResize = () => {
      try {
        chartInstance.current?.resize();
      } catch (e) {
        /* ignore */
      }
    };
    resizeHandlerRef.current = handleResize;
    window.addEventListener('resize', handleResize);

    // cleanup: remove listener and dispose safely
    return () => {
      window.removeEventListener('resize', resizeHandlerRef.current);
      // dispose guard: only if instance exists and not already disposed
      if (chartInstance.current) {
        try {
          chartInstance.current.dispose();
        } catch (e) {
          // ignore dispose errors
        } finally {
          chartInstance.current = null;
        }
      }
    };
    // re-run when cpuData or dates change
  }, [cpuData, dates]);

  // Option builder kept outside effect to avoid recreating too often
  const getOption = (xDates = [], seriesData = []) => ({
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
      formatter: (params) => {
        // params could be array
        const arr = Array.isArray(params) ? params : [params];
        return arr
          .map((p) => {
            const name = p?.axisValue ?? p?.name ?? '';
            const val = p?.data ?? p?.value ?? 0;
            return `${name}<br/>${p?.seriesName ?? 'Average CPU'}: ${val}%`;
          })
          .join('<br/>');
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xDates.length > 0 ? xDates : Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
      axisLine: {
        lineStyle: { color: '#999' }
      },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: true,
        lineStyle: { color: '#999' }
      },
      axisLabel: { formatter: '{value}%', color: '#666' },
      splitLine: { lineStyle: { color: '#eee' } }
    },
    series: [{
      name: 'Average CPU Usage',
      type: 'line',
      data: seriesData,
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
          lineStyle: { color: '#e74a3b', type: 'dashed' },
          label: { formatter: 'Avg: {c}%', position: 'insideEndBottom' }
        }]
      }
    }]
  });

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
