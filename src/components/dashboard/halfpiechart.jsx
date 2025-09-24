import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

function HalfPieChart({ labels = [], data = [] }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);

    const option = {
       title: {
          subtext: 'Ec2 status',
          left: 'center'
        },
      tooltip: {
        trigger: "item",
      },
      legend: {
        bottom: "5%",
        left: "center",
      },
      series: [
        {
          name: "EC2 state",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "70%"],
          startAngle: 180, // start half-circle
          endAngle: 360,   // end half-circle
          data: labels.map((label, i) => ({ value: data[i], name: label })),
        },
      ],
    };

    myChart.setOption(option);

    const handleResize = () => {
      myChart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.dispose();
    };
  }, [labels, data]); // re-render chart if labels/data change

  return <div ref={chartRef} style={{ width: "100%", height: "250px" }} />;
}

export default HalfPieChart;
