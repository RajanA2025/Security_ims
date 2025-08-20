import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function DonutChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);

    const option = {
      tooltip: { trigger: 'item' },
      legend: { top: '5%', left: 'center' },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: { show: false },
          data: [
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
            { value: 484, name: 'Union Ads' },
            { value: 300, name: 'Video Ads' }
          ]
        }
      ]
    };

    myChart.setOption(option);

    return () => {
      myChart.dispose();
    };
  }, []);

  return (
    <div>
      <div
        ref={chartRef}
        style={{ width: '100%', height: '500px' }} // Must set size
      />
    </div>
  );
}

export default DonutChart;
