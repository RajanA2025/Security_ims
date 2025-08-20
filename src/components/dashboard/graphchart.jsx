import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function GraphChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);

    let base = +new Date(1988, 9, 3);
    let oneDay = 24 * 3600 * 1000;
    let data = [[base, Math.random() * 300]];

    for (let i = 1; i < 20000; i++) {
      let now = new Date((base += oneDay));
      data.push([+now, Math.round((Math.random() - 0.5) * 20 + data[i - 1][1])]);
    }

    // const option = {
    //   tooltip: {
    //     // trigger: 'axis',
    //     position: (pt) => [pt[0], '10%']
    //   },
    //   title: {
    //     left: 'center',
    //     text: 'Large Area Chart'
    //   },
    //   toolbox: {
    //     feature: {
    //       dataZoom: { yAxisIndex: 'none' },
    //       restore: {},
    //       saveAsImage: {}
    //     }
    //   },
    //   xAxis: {
    //     type: 'time',
    //     boundaryGap: false
    //   },
    //   yAxis: {
    //     type: 'value',
    //     boundaryGap: [0, '100%']
    //   },
    //   dataZoom: [
    //     { type: 'inside', start: 0, end: 20 },
    //     { start: 0, end: 20 }
    //   ],
    //   series: [
    //     {
    //       name: 'Fake Data',
    //       type: 'line',
    //       smooth: true,
    //       symbol: 'none',
    //       areaStyle: {},
    //       data: data
    //     }
    //   ]
    // };

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {},
      xAxis: [
        {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'MFA',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: [320, 332, 301, 334, 390, 330, 320]
        },
        {
          name: 'Email',
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: 'Union Ads',
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
          name: 'Video Ads',
          type: 'bar',
          stack: 'Ad',
          emphasis: {
            focus: 'series'
          },
          data: [150, 232, 201, 154, 190, 330, 410]
        },
        {
          name: 'Search Engine',
          type: 'bar',
          data: [862, 1018, 964, 1026, 1679, 1600, 1570],
          emphasis: {
            focus: 'series'
          },
          markLine: {
            lineStyle: {
              type: 'dashed'
            },
            data: [[{ type: 'min' }, { type: 'max' }]]
          }
        },
        {
          name: 'Baidu',
          type: 'bar',
          barWidth: 5,
          stack: 'Search Engine',
          emphasis: {
            focus: 'series'
          },
          data: [620, 732, 701, 734, 1090, 1130, 1120]
        },
        {
          name: 'Google',
          type: 'bar',
          stack: 'Search Engine',
          emphasis: {
            focus: 'series'
          },
          data: [120, 132, 101, 134, 290, 230, 220]
        },
        {
          name: 'Bing',
          type: 'bar',
          stack: 'Search Engine',
          emphasis: {
            focus: 'series'
          },
          data: [60, 72, 71, 74, 190, 130, 110]
        },
        // {
        //   name: 'Others',
        //   type: 'bar',
        //   stack: 'Search Engine',
        //   emphasis: {
        //     focus: 'series'
        //   },
        //   data: [62, 82, 91, 84, 109, 110, 120]
        // }
      ]
    };
    myChart.setOption(option);

    return () => {
      myChart.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '500px' }} />;
}

export default GraphChart;
