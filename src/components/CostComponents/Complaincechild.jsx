// File: CloudComplianceDashboard.jsx
import React from "react";
import { Row, Col, Card, Typography, Collapse, Table, Tag } from "antd";
import ReactECharts from "echarts-for-react";
import piechartimg from "../assets/piechartimg.png"; // you can swap icons like in your design

const { Title, Text } = Typography;

const data = {
  ec2_auto_startstop: [
    {
      account_id: "127214172745",
      region: "ap-south-1",
      instance_id: "i-0f225ef6b91c18532",
      instance_type: "t2.xlarge",
      auto_enabled: "NO",
      enabled_tag: null,
    },
    {
      account_id: "127214172745",
      region: "us-east-1",
      instance_id: "i-06b6dc0cd454baf4e",
      instance_type: "t2.micro",
      auto_enabled: "YES",
      enabled_tag: "Service=AutoStart/AutoStop",
    },
  ],
  tag_compliance: [
    {
      account_id: "127214172745",
      check_date: "2025-08-01",
      total_cost: 132.75,
      tagged_cost: 70.35,
      untagged_cost: 0.0,
      non_taggable_cost: 62.39,
      tagged_services:
        "Amazon EC2 - Compute (All Required Tags Present), Amazon S3 (All Required Tags Present)",
      untagged_services:
        "arn:aws:cloudformation:ap-south-1:stack/... (Missing: Name, Environment, Owner, Project)",
      non_taggable_services:
        "AWS Cost Explorer, AWS Key Management Service, AWS Lambda",
    },
  ],
};

const Complaincechild = () => {
  const compliance = data.tag_compliance[0];

  const chartOption = {
    title: { text: "Tag Compliance", left: "center" },
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "Cost Breakdown",
        type: "pie",
        radius: "60%",
        data: [
          { value: compliance.tagged_cost, name: "Tagged" },
          { value: compliance.untagged_cost, name: "Untagged" },
          { value: compliance.non_taggable_cost, name: "Non-Taggable" },
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
            {/* EC2 Compliance Table */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="EC2 Auto Start/Stop Compliance">
            <Table
              dataSource={data.ec2_auto_startstop}
              columns={ec2Columns}
              rowKey="instance_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Service Compliance */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Service Tagging Compliance">
            <Collapse accordion>
              <Collapse.Panel header="✅ Tagged Services" key="1">
                <ul>
                  {compliance.tagged_services.split(",").map((svc, i) => (
                    <li key={i}>{svc.trim()}</li>
                  ))}
                </ul>
              </Collapse.Panel>
              <Collapse.Panel header="❌ Untagged Services" key="2">
                <ul>
                  {compliance.untagged_services.split(",").map((svc, i) => (
                    <li key={i}>{svc.trim()}</li>
                  ))}
                </ul>
              </Collapse.Panel>
              <Collapse.Panel header="⚪ Non-Taggable Services" key="3">
                <ul>
                  {compliance.non_taggable_services.split(",").map((svc, i) => (
                    <li key={i}>{svc.trim()}</li>
                  ))}
                </ul>
              </Collapse.Panel>
            </Collapse>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Complaincechild;
