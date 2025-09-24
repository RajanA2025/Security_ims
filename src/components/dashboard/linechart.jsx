import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

function LineChart({ labels = [], data = [], title = "Line Chart" }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);

    const option = {
      title: {
        text: title,
        left: "center"
      },
      tooltip: {
        trigger: "axis"
      },
      xAxis: {
        type: "category",
        data: labels
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          data,
          type: "line",
          smooth: true,
          areaStyle: {}
        }
      ]
    };

    myChart.setOption(option);

    const handleResize = () => myChart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.dispose();
    };
  }, [labels, data, title]);

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }} />;
}

export default LineChart;
