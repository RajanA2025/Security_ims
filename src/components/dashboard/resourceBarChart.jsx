import React, { useRef, useEffect } from "react";
import { Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from "react-chartjs-2";
import { Card } from "antd";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResourceBarChart = ({ data }) => {
  const chartData = {
    labels: ["Key Pairs (Orphaned)", "Elastic IPs", "Volumes"],
    datasets: [
      {
        label: "Resource Count",
        data: [data.keyPairs, data.elasticIPs, data.volumes],
        backgroundColor: ["#0000FF"],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const chartRef = useRef(null);

  // Cleanup chart instance on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <Card style={{ borderRadius: "12px", marginTop: "24px" }}>
    <div style={{ height: "250px" }}>   {/* 👈 fix the chart height */}
      <Bar 
        ref={chartRef}
        data={chartData} 
        options={{
          responsive: true,
          maintainAspectRatio: false,   
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: {
                display: true,
                drawBorder: false
              },
              ticks: { precision: 0 }
            },
            x: {
              grid: { display: false }
            }
          }
        }} 
      />
    </div>
  </Card>
  );
};

export default ResourceBarChart;
