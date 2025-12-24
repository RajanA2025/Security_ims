import React, { useEffect, useState } from "react";
import * as echarts from 'echarts';
import { Spin, Alert } from "antd"; // Removed Card from imports

const ResourceBarChart = () => {
  const [keyPairs, setKeyPairs] = useState([]);
  const [elasticIPs, setElasticIPs] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep your existing data fetching useEffect
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [keyPairRes, eipRes, volumeRes] = await Promise.all([
          fetch("http://47.130.218.97:8012/keypairs2", {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      }),
          fetch("http://47.130.218.97:8012/orphaned-eip", {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      }),
          fetch("http://47.130.218.97:8012/orphaned-volumes", {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      })
        ]);

        if (!keyPairRes.ok) throw new Error("Failed to fetch key pairs");
        if (!eipRes.ok) throw new Error("Failed to fetch elastic IPs");  
        if (!volumeRes.ok) throw new Error("Failed to fetch volumes");

        const [keyPairData, eipData, volumeData] = await Promise.all([
          keyPairRes.json(),
          eipRes.json(),
          volumeRes.json()
        ]);

        setKeyPairs(Array.isArray(keyPairData) ? keyPairData : []);
        setElasticIPs(Array.isArray(eipData) ? eipData : []);
        setVolumes(Array.isArray(volumeData) ? volumeData : []);

      } catch (err) {
        console.error("Error fetching resource data:", err);
        setError(err.message);
        setKeyPairs([]);
        setElasticIPs([]);
        setVolumes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Simplified chart initialization
  useEffect(() => {
    if (!loading && !error) {
      const chartDom = document.getElementById('resource-chart');
      const myChart = echarts.init(chartDom);

      const orphanedKeyPairs = keyPairs.filter(item => item.status === "Orphaned").length;
      const orphanedElasticIPs = elasticIPs.length;
      const orphanedVolumes = volumes.length;

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['Key Pairs', 'Elastic IPs', 'Volumes'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [orphanedKeyPairs, orphanedElasticIPs, orphanedVolumes],
            type: 'bar',
            barWidth: '20%',
            itemStyle: {
              color: '#4A90E2'
            }
          },
        ],
      };

      myChart.setOption(option);

      return () => {
        myChart.dispose();
      };
    }
  }, [keyPairs, elasticIPs, volumes, loading, error]);

  if (loading) {
    return (
      <div style={{ 
        height: "280px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: "280px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <Alert type="error" message="Failed to load data" description={error} showIcon />
      </div>
    );
  }

  return (
    <div
      id="resource-chart"
      style={{ width: '100%', height: '280px' }}
    />
  );
};

// export default ResourceBarChart;
