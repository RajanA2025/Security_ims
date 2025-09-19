import React, { useRef, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, Spin, Alert } from "antd";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResourceBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  // ✅ Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://13.212.15.14:8016/keypairs2");
        if (!response.ok) {
          throw new Error("Failed to fetch key pairs");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Filter only Orphaned key pairs
  const orphanedKeyPairs = data.filter(
    (item) => item.status === "Orphaned"
  ).length;

  // ✅ ChartJS dataset
  const chartData = {
    labels: ["Key Pairs (Orphaned)"],
    datasets: [
      {
        label: "Orphaned Key Pairs",
        data: [orphanedKeyPairs],
        backgroundColor: ["#1677ff"],
        borderRadius: 8,
      },
    ],
  };

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (loading) {
    return <Spin tip="Loading orphaned key pairs..." />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <Card style={{ borderRadius: "12px", marginTop: "24px" }}>
      <div style={{ height: "250px" }}>
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
                ticks: { precision: 0 },
              },
              x: {
                grid: { display: false },
              },
            },
          }}
        />
      </div>
    </Card>
  );
};

export default ResourceBarChart;
