import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const Chart = ({ labels, data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    // ✅ Generate stable random colors for each label
    let labelColors = {};
    const sortedLabels = Array.from(labels).sort();

    sortedLabels.forEach((label) => {
      if (!labelColors[label]) {
        labelColors[label] =
          "#" + Math.floor(Math.random() * 16777215).toString(16);
      }
    });

    const option = {
      backgroundColor: '#fff',
      textStyle: {
        color: '#333',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 12,
      },
      title: {
        subtext: 'Overall Count',
        left: 'center',
        subtextStyle: {
          fontSize: 13,
          fontWeight: 600,
          color: '#333',
          fontFamily: 'Roboto, sans-serif',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        textStyle: { fontSize: 11, color: '#333' },
        backgroundColor: '#f9f9f9',
        borderColor: '#ccc',
        borderWidth: 1,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: 20,
          fontSize: 12,
          fontWeight: 500,
          color: '#333',
        },
        axisLine: { lineStyle: { color: '#888' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 12,
          color: '#333',
        },
        splitLine: { lineStyle: { color: '#eee' } },
      },
      series: [
        {
          data: data.map((val, i) => ({
            value: val,
            itemStyle: { color: labelColors[labels[i]] }, // 🎨 dynamic color per label
          })),
          type: 'bar',
          barMaxWidth: 30,
          label: {
            show: true,
            position: 'top',
            color: '#333',
            fontSize: 11,
            fontWeight: 500,
          },
        },
      ],
    };

    myChart.setOption(option);
    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      myChart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [labels, data]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '250px',
        background: '#fff',
        borderRadius: '8px',
      }}
    />
  );
};

export default Chart;
