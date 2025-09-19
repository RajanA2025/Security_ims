import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Tooltip } from "antd";
import { TagOutlined, UnorderedListOutlined, DollarCircleOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";

const { Title, Text } = Typography;

export const Complaincedashmain = () => {
    const compliance = {
        total_cost: 25000,
        tagged_cost: 18000,
        untagged_cost: 5000,
        resources: 100,
        tagged_resources: 80,
        non_taggable_cost: 2000,
        service_costs: {
            EC2: 8000,
            S3: 5000,
            Lambda: 3000,
            RDS: 2000,
            CloudFront: 1000,
        },
        auto_start_stop: {
            total: 50,
            enabled: 30,
        },
    };

    const total = compliance.total_cost;

    const cardStyles = (border) => ({
        body: {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minHeight: 250, // unified height
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 12,
            borderTop: border,
            padding: 20,
            width: "100%",
        }
    });

    const renderGradientProgress = (label, value, color, icon = null) => {
        const safeValue = value || 0; // Add null check
        const percent = Math.round((safeValue / total) * 100);
        return (
            <div style={{ marginTop: 0, width: "100%" }}>
                <Text strong>
                    {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
                    {label}
                </Text>
                <Tooltip title={`$${safeValue.toLocaleString()} (${percent}%)`}>
                    <Progress
                        percent={percent}
                        strokeColor={{ "0%": color, "100%": `${color}AA` }}
                        strokeWidth={14}
                        showInfo={true}
                        format={() => `${percent}%`}
                        style={{ marginTop: 5 }}
                    />
                </Tooltip>
            </div>
        );
    };

    const AutoStartStopCard = () => {
        const { total, enabled } = compliance.auto_start_stop;
        const disabled = total - enabled;
        const enabledPercent = Math.round((enabled / total) * 100);

        return (
            <Card 
                styles={cardStyles("4px solid #eb2f96")} 
                hoverable 
                style={{ flex: 1 }}
            >
                <Text strong style={{ marginBottom: 15, marginTop: 0 }}>Auto Start/Stop</Text>
                <Tooltip title={`Enabled: ${enabled} | Disabled: ${disabled}`}>
                    <Progress
                        type="circle"
                        percent={enabledPercent}
                        strokeColor="#52c41a"
                        strokeWidth={12}
                        size={100}
                        format={() => `${enabledPercent}%`}
                    />
                </Tooltip>
                <div style={{ marginTop: 15, width: "100%", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#52c41a", fontWeight: 500 }}>Enabled: {enabled}</span>
                    <span style={{ color: "#999", fontWeight: 500 }}>Disabled: {disabled}</span>
                </div>
            </Card>
        );
    };

    const CostBreakdownCard = () => (
        <Card 
            styles={cardStyles("4px solid #722ed1")} 
            hoverable 
            style={{ flex: 1 }}
        >
            <Text strong style={{ marginBottom: 15, marginTop: 0 }}>Tag Compliance</Text>
            {renderGradientProgress("Total Resources", compliance.resource, "#722ed1", <TagOutlined />)}
            {renderGradientProgress("Fully Tagged", compliance.tagged_cost, "#722ed1", <TagOutlined />)}
            {renderGradientProgress("Partially-Tagged", compliance.untagged_cost, "#fa8c16", <UnorderedListOutlined />)}
            {renderGradientProgress("Non-Tagged", compliance.non_taggable_cost, "#52c41a", <DollarCircleOutlined />)}
        </Card>
    );

    const ServiceProgressPieCard = () => {
        const serviceData = Object.entries(compliance.service_costs).map(([name, value]) => ({ name, value }));
        const colors = ["#1890ff", "#13c2c2", "#2f54eb", "#722ed1", "#fa541c"];

        const pieOption = {
            tooltip: { trigger: "item", formatter: "{b}: ${c} ({d}%)" },
            legend: { 
                orient: "vertical", 
                left: "left", 
                textStyle: { fontSize: 12 },
                type: 'scroll',
                height: 200
            },
            series: [
                {
                    name: "Service Costs",
                    type: "pie",
                    radius: ["35%", "60%"],
                    avoidLabelOverlap: false,
                    label: { show: true, position: "inside", formatter: "{d}%" },
                    emphasis: { label: { show: true, fontSize: "14", fontWeight: "bold" } },
                    labelLine: { show: false },
                    data: serviceData.map((item, index) => ({
                        ...item,
                        value: item.value || 0, // Ensure value is defined
                        itemStyle: { color: colors[index % colors.length] }
                    })),
                },
            ],
        };

        return (
            <Card 
                styles={cardStyles("4px solid #1890ff")} 
                hoverable 
                style={{ flex: 1 }}
            >
                <Text strong style={{ marginBottom: 15, marginTop: 0 }}>Service Tagged Costs</Text>
                <ReactECharts 
                    option={pieOption} 
                    style={{ height: 200, width: "100%" }} 
                    opts={{ renderer: 'svg' }}
                />
            </Card>
        );
    };

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12} lg={8} xl={8} style={{ display: "flex" }}>
                    <AutoStartStopCard />
                </Col>
                <Col xs={24} sm={24} md={12} lg={8} xl={8} style={{ display: "flex" }}>
                    <CostBreakdownCard />
                </Col>
                <Col xs={24} sm={24} md={12} lg={8} xl={8} style={{ display: "flex" }}>
                    <ServiceProgressPieCard />
                </Col>
            </Row>
        </div>
    );
};
