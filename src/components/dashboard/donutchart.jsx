import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function DonutChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);
    const option ={
   
        title: {
          subtext: 'Orphaned Volume',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'horizontal',
          left: 'center'
        },
        series: [
          {
            name: 'Orphaned Volume',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 12, name: 'Available' },
              { value: 17, name: 'Attached' },
              { value: 34, name: 'Deleted' },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      
    }
    myChart.setOption(option);
    return () => {
      myChart.dispose();
    };
  }, []);

  return (
    <div>
      <div
        ref={chartRef}
        style={{ width: '100%', height: '250px' }} // Must set size
      />
    </div>
  );
}
export default DonutChart;