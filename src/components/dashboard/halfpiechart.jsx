import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

function HalfPieChart({ labels = [], data = [] }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);

    const legendTextStyle = {
      fontSize: 9,
      fontWeight: 600,
      color: "#333",
      fontFamily: "Roboto, sans-serif",
    };

    const option = {
      title: {
        subtext: "EC2 Status",
        left: "center",
        top: "0%",
        subtextStyle: {
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "Roboto, sans-serif",
          color: "#000000ff",
        },
      },

      tooltip: {
        trigger: "item",
        textStyle: {
          fontSize: 10,
          fontWeight: 500,
          color: "#333",
          fontFamily: "Roboto, sans-serif",
        },
        formatter: (params) =>
          `${params.name}: ${params.value} (${params.percent}%)`,
      },

      legend: {
        type: "scroll",
        bottom: "1%",
        left: "center",
        orient: "horizontal",
        textStyle: legendTextStyle,
        itemGap: 8,
        icon: "circle",
      },

      series: [
        {
          name: "EC2 State",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "50%"], // moved up/down to adjust spacing
          startAngle: 180,
          endAngle: 360,

          label: {
            show: true,
            position: "inside",
            formatter: "{d}%",
            color: "#000",
            fontWeight: "bold",
            fontSize: 12,
            fontFamily: "Roboto, sans-serif",
          },


          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },

          data: labels.map((label, i) => ({
            value: data[i],
            name: label,
          })),
        },
      ],

      color: [
        "#8b5cf6",
        "#22c55e",
        "#facc15",
        "#f97316",
        "#afef40ff",
        "#0284c7",
        "#070808ff",
        "#0ea5e9",
        "#14b8a6",
      ],
    };

    myChart.setOption(option);

    const handleResize = () => myChart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.dispose();
    };
  }, [labels, data]);

  return (
    <div ref={chartRef} style={{ width: "100%", height: "250px" }} />
  );
}

export default HalfPieChart;
