import React, { useEffect } from 'react';
import * as echarts from 'echarts';

const Chart = () => {
  useEffect(() => {
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);

    const option = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: 'bar',
        },
      ],
    };

    myChart.setOption(option);

    return () => {
      myChart.dispose();
    };
  }, []);

  return (
    <div
      id="main"
      style={{ width: '100%', height: '250px' }} // Required for chart display
    ></div>
  );
};

export default Chart;
