import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

function DonutChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: "item",
        textStyle: {
          fontSize: 10,
          fontWeight: 500,
          color: "#333",
          fontFamily: "Roboto, sans-serif",
        },
        formatter: (params) => {
          const value = Array.isArray(params.value)
            ? params.value[1]
            : params.value;
          return `${params.name}: ${Number(value).toFixed(2)}`;
        },
      },

      title: {
        subtext: "AMI Status",
        left: "center",

        // main title style (you don't use main title)
        textStyle: {
          fontFamily: "Roboto, sans-serif",
          fontSize: 12,
          fontWeight: 600,
        },

        // ✔ This applies color to AMI Status
        subtextStyle: {
          fontFamily: "Roboto, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#000000ff",  // your red color
        },
      },


      legend: {
        bottom: "1%",
        orient: "horizontal",
        left: "center",
        icon: "circle",
        textStyle: {
          fontSize: 9,
          fontWeight: 600,
          color: "#333",
          fontFamily: "Roboto, sans-serif",
        },
        itemGap: 8,
      },

      series: [
        {
          name: "Orphaned Volume",
          type: "pie",
          radius: ["40%", "70%"], // same style ratio
          avoidLabelOverlap: false,

          label: {
            show: true,
            position: "inside",
            formatter: "{d}%",
            fontSize: 12,
            fontWeight: "bold",
            color: "#000",
            fontFamily: "Roboto, sans-serif",
          },

          labelLine: { show: false },

          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },

          data: [
            { value: 12, name: "Available" },
            { value: 17, name: "Attached" },
            { value: 34, name: "Deleted" },
          ],
        },
      ],

      color: [
        "#5cf6f1ff",
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

    return () => {
      myChart.dispose();
    };
  }, []);

  return (
    <div>
      <div
        ref={chartRef}
        style={{ width: "100%", height: "250px" }}
      />
    </div>
  );
}

export default DonutChart;
