// File: CloudComplianceDashboard.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Collapse, Table, Tag, Progress, Spin, Alert } from "antd";
import ReactECharts from "echarts-for-react";
import piechartimg from "../../assets/piechartimg.png";

const { Title, Text } = Typography;

const Complaincechild = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tagData, setTagData] = useState(null);
  const [ec2Data, setEc2Data] = useState([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchTagData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://13.212.15.14:8007/tags');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Process the API response based on your data structure
        // Adjust this based on your actual API response format
        setTagData(data.tag_compliance || data);
        setEc2Data(data.ec2_auto_startstop || []);
        
      } catch (err) {
        console.error('Error fetching tag data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTagData();
  }, []);

  // Show loading spinner
  if (loading) {
    return (
      <div style={{ padding: "16px 0px 16px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading tag compliance data...</div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div style={{ padding: "16px 0px 16px" }}>
        <Alert
          message="Error Loading Data"
          description={`Failed to fetch tag compliance data: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Default values if API data is not in expected format
  const compliance = tagData || {
    total_resources: 0,
    fully_tagged: 0,
    partially_tagged: 0,
    non_tagged: 0,
    resources: 0,
    tagged_resources: 0,
    tagged_services: "",
    untagged_services: "",
    non_taggable_services: ""
  };

  // Calculate percentages
  const fullyTaggedPercent = compliance.total_resources > 0 
    ? Math.round((compliance.fully_tagged / compliance.total_resources) * 100) 
    : 0;
  const partiallyTaggedPercent = compliance.total_resources > 0 
    ? Math.round((compliance.partially_tagged / compliance.total_resources) * 100) 
    : 0;
  const nonTaggedPercent = compliance.total_resources > 0 
    ? Math.round((compliance.non_tagged / compliance.total_resources) * 100) 
    : 0;
  
  // Calculate average (Total Resources percentage)
  const totalResourcesPercent = compliance.total_resources > 0 
    ? Math.round((fullyTaggedPercent + partiallyTaggedPercent + nonTaggedPercent) / 3) 
    : 0;

  const chartOption = {
    title: { text: "Tag Compliance Distribution", left: "center" },
    tooltip: { 
      trigger: "item",
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "Tag Compliance",
        type: "pie",
        radius: "60%",
        data: [
          { 
            value: compliance.fully_tagged, 
            name: "Fully Tagged",
            itemStyle: { color: '#52c41a' }
          },
          { 
            value: compliance.partially_tagged, 
            name: "Partially Tagged",
            itemStyle: { color: '#faad14' }
          },
          { 
            value: compliance.non_tagged, 
            name: "Non-Tagged",
            itemStyle: { color: '#ff4d4f' }
          },
        ],
      },
    ],
  };

  const cardStyle = (bgGradient) => ({
    boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
    padding: "12px 12px",
    minHeight: "24vh",
    background: bgGradient,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  });

  const ec2Columns = [
    { title: "Instance ID", dataIndex: "instance_id", key: "instance_id" },
    { title: "Region", dataIndex: "region", key: "region" },
    { title: "Type", dataIndex: "instance_type", key: "instance_type" },
    {
      title: "Auto Enabled",
      dataIndex: "auto_enabled",
      key: "auto_enabled",
      render: (text) =>
        text === "YES" ? (
          <Tag color="green">YES</Tag>
        ) : (
          <Tag color="red">NO</Tag>
        ),
    },
    { title: "Tag", dataIndex: "enabled_tag", key: "enabled_tag" },
  ];

  return (
    <div style={{ padding: "16px 0px 16px" }}>
      {/* Tag Compliance Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle("linear-gradient(135deg, #667eea 0%, #764ba2 100%)")}>
            <div style={{ textAlign: "center", color: "white" }}>
              <Title level={3} style={{ color: "white", margin: 0 }}>
                {totalResourcesPercent}%
              </Title>
              <Text style={{ color: "white", fontSize: "14px" }}>
                Total Resources
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle("linear-gradient(135deg, #11998e 0%, #38ef7d 100%)")}>
            <div style={{ textAlign: "center", color: "white" }}>
              <Title level={3} style={{ color: "white", margin: 0 }}>
                {fullyTaggedPercent}%
              </Title>
              <Text style={{ color: "white", fontSize: "14px" }}>
                Fully Tagged
              </Text>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                ({compliance.fully_tagged} resources)
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle("linear-gradient(135deg, #f093fb 0%, #f5576c 100%)")}>
            <div style={{ textAlign: "center", color: "white" }}>
              <Title level={3} style={{ color: "white", margin: 0 }}>
                {partiallyTaggedPercent}%
              </Title>
              <Text style={{ color: "white", fontSize: "14px" }}>
                Partially Tagged
              </Text>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                ({compliance.partially_tagged} resources)
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle("linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)")}>
            <div style={{ textAlign: "center", color: "white" }}>
              <Title level={3} style={{ color: "white", margin: 0 }}>
                {nonTaggedPercent}%
              </Title>
              <Text style={{ color: "white", fontSize: "14px" }}>
                Non-Tagged
              </Text>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                ({compliance.non_tagged} resources)
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tag Compliance Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Tag Compliance Overview">
            <ReactECharts option={chartOption} style={{ height: "300px" }} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Tag Compliance Details">
            <div style={{ padding: "20px 0" }}>
              <div style={{ marginBottom: "16px" }}>
                <Text strong>Fully Tagged Resources</Text>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                  All 4 required tags present (Project, Owner, Environment, Name)
                </div>
                <Progress 
                  percent={fullyTaggedPercent} 
                  strokeColor="#52c41a"
                  format={() => `${compliance.fully_tagged} resources`}
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <Text strong>Partially Tagged Resources</Text>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                  1-3 required tags present (missing some of: Project, Owner, Environment, Name)
                </div>
                <Progress 
                  percent={partiallyTaggedPercent} 
                  strokeColor="#faad14"
                  format={() => `${compliance.partially_tagged} resources`}
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <Text strong>Non-Tagged Resources</Text>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                  No required tags present
                </div>
                <Progress 
                  percent={nonTaggedPercent} 
                  strokeColor="#ff4d4f"
                  format={() => `${compliance.non_tagged} resources`}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* EC2 Compliance Table */}
      {ec2Data.length > 0 && (
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="EC2 Auto Start/Stop Compliance">
              <Table
                dataSource={ec2Data}
                columns={ec2Columns}
                rowKey="instance_id"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Service Compliance */}
      {(compliance.tagged_services || compliance.untagged_services || compliance.non_taggable_services) && (
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="Service Tagging Compliance">
              <Collapse accordion>
                {compliance.tagged_services && (
                  <Collapse.Panel header="✅ Tagged Services" key="1">
                    <ul>
                      {compliance.tagged_services.split(",").map((svc, i) => (
                        <li key={i}>{svc.trim()}</li>
                      ))}
                    </ul>
                  </Collapse.Panel>
                )}
                
                {compliance.untagged_services && (
                  <Collapse.Panel header="❌ Untagged Services" key="2">
                    <ul>
                      {compliance.untagged_services.split(",").map((svc, i) => (
                        <li key={i}>{svc.trim()}</li>
                      ))}
                    </ul>
                  </Collapse.Panel>
                )}
                
                {compliance.non_taggable_services && (
                  <Collapse.Panel header="⚪ Non-Taggable Services" key="3">
                    <ul>
                      {compliance.non_taggable_services.split(",").map((svc, i) => (
                        <li key={i}>{svc.trim()}</li>
                      ))}
                    </ul>
                  </Collapse.Panel>
                )}
              </Collapse>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Complaincechild;
