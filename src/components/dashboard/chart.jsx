import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const Chart = ({ labels, data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    const option = {
       title: {
          subtext: 'OverAll Count',
          left: 'center'
        },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          interval: 0,   // force all labels to show
          rotate: 20,    // rotate for readability
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: data,
          type: 'bar',
          itemStyle: {
            color: '#5470C6', // optional: custom bar color
          },
        },
      ],
      tooltip: {
        show: true,
        trigger: 'axis',
      },
    };
    

    myChart.setOption(option);

    return () => {
      myChart.dispose();
    };
  }, [labels, data]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '250px' }}
    />
  );
};

export default Chart;
