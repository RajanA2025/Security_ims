import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const Chart = ({ labels, data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    // Stable colors
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

      // Grid for padding
      grid: {
        top: 40,
        left: 20,
        right: 20,
        bottom: 15,
        containLabel: true,
      },

      // SAME FONT STYLE as DonutChart
      textStyle: {
        fontFamily: "Roboto, sans-serif",
        color: "#333",
        fontSize: 12,
      },

      // SAME TITLE STYLE
      title: {
        subtext: "Overall Count",
        left: "center",
        subtextStyle: {
          fontSize: 14,
          fontWeight: 600,
          color: "#000000ff",
          fontFamily: "Roboto, sans-serif",
        },
      },

      // SAME TOOLTIP STYLE
      tooltip: {
        trigger: "axis",
        backgroundColor: "#f9f9f9",
        borderColor: "#ddd",
        borderWidth: 1,
        textStyle: {
          fontSize: 12,
          color: "#333",
        },
        axisPointer: { type: "shadow" },
      },

      // 🔥 SAME LEGEND STYLE as DonutChart
      legend: {
        bottom: "5%",
        left: "center",
        orient: "horizontal",
        textStyle: {
          fontSize: 12,
          fontWeight: 500,
          color: "#333",
        },
      },

      xAxis: {
        type: "category",
        data: labels,
        axisLabel: {
          // rotate: 20,
          color: "rgba(0, 0, 0, 0.7)",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "Roboto, sans-serif",
        },
        axisLine: { lineStyle: { color: "#888" } },
      },

      yAxis: {
        type: "value",
        axisLabel: {
          color: "rgba(0, 0, 0, 0.7)",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "Roboto, sans-serif",
        },
        splitLine: {
          lineStyle: { color: "#eee" },
        },
      },

      // BAR SERIES
      series: [
        {
          type: "bar",
          barMaxWidth: 30,
          data: data.map((val, i) => ({
            value: val,
            itemStyle: { color: labelColors[labels[i]] },
          })),

          // SAME EMPHASIS STYLE as Donut Chart
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },

          label: {
            show: true,
            position: "top",
            fontSize: 12,
            fontWeight: 600,
            color: "#333",
          },
        },
      ],
    };

    myChart.setOption(option);
    const resize = () => myChart.resize();
    window.addEventListener("resize", resize);

    return () => {
      myChart.dispose();
      window.removeEventListener("resize", resize);
    };
  }, [labels, data]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "250px",
        background: "#fff",
        padding: 0,
      }}
    />
  );
};

export default Chart;
