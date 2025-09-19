import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Tooltip, Spin, message } from "antd";
import { TagOutlined, UnorderedListOutlined, DollarCircleOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";

const { Title, Text } = Typography;

export const Complaincedashmain = () => {
    const [loading, setLoading] = useState(true);
    const [tagData, setTagData] = useState({
        fully_tagged: 0,
        partially_tagged: 0,
        not_tagged: 0,
        total_resources: 0
    });

    // Static data for other components
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

    // Fetch tag compliance data
    useEffect(() => {
        const fetchTagData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://13.212.15.14:8007/tags');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Process the API response based on the 'type' field
                const processedData = {
                    fully_tagged: 0,
                    partially_tagged: 0,
                    not_tagged: 0,
                    total_resources: 0
                };

                // Assuming the API returns an array of resources with 'type' field
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        switch (item.type?.toLowerCase()) {
                            case 'fully_tagged':
                            case 'fully tagged':
                            case 'tagged':
                                processedData.fully_tagged++;
                                break;
                            case 'partially_tagged':
                            case 'partially tagged':
                            case 'partial':
                                processedData.partially_tagged++;
                                break;
                            case 'not_tagged':
                            case 'not tagged':
                            case 'untagged':
                                processedData.not_tagged++;
                                break;
                        }
                    });
                    processedData.total_resources = data.length;
                }
                // If API returns an object with counts
                else if (data && typeof data === 'object') {
                    processedData.fully_tagged = data.fully_tagged || data.tagged || 0;
                    processedData.partially_tagged = data.partially_tagged || data.partial || 0;
                    processedData.not_tagged = data.not_tagged || data.untagged || 0;
                    processedData.total_resources = data.total_resources ||
                        (processedData.fully_tagged + processedData.partially_tagged + processedData.not_tagged);
                }

                setTagData(processedData);
            } catch (error) {
                console.error('Error fetching tag data:', error);
                message.error('Failed to fetch tag compliance data');
                // Use fallback data
                setTagData({
                    fully_tagged: 60,
                    partially_tagged: 25,
                    not_tagged: 15,
                    total_resources: 100
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTagData();
    }, []);

    const cardStyles = (border) => ({
        body: {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 12,
            borderTop: border,
            padding: 10,
            width: "100%",
            fontFamily: "'Roboto', sans-serif",
        }
    });

    const renderResourceProgress = (label, value, total, color, icon = null) => {
        const safeValue = value || 0;
        const safeTotal = total || 1; // Prevent division by zero
        const percent = Math.round((safeValue / safeTotal) * 100);

        return (
            <div style={{ width: "100%" }}>
                <Text strong style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
                    {label}
                </Text>
                <Tooltip title={`${safeValue} resources (${percent}%)`}>
                    <Progress
                        percent={percent}
                        strokeColor={{ "0%": color, "100%": `${color}AA` }}
                        strokeWidth={14}
                        showInfo={true}
                        format={() => `${percent}%`}
                        style={{ marginTop: 0 }}
                    />
                </Tooltip>
                <Text
                    type="secondary"
                    style={{
                        fontSize: 12,
                        marginTop: 2,
                        display: 'block',
                        fontFamily: "'Roboto', sans-serif"
                    }}
                >
                    {safeValue} resources
                </Text>
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
                style={{ flex: 1,}}
            >
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flex: 1
                }}>
                    {/* Top content */}
                    <div style={{ textAlign: "center" }}>
                        <Text strong style={{
                            marginBottom: 10,
                            fontFamily: "'Roboto', sans-serif"
                        }}>
                            Auto Start/Stop
                        </Text>
                    </div>
                    <div>
                    <Tooltip title={`Enabled: ${enabled} | Disabled: ${disabled}`}>
                            <Progress
                                type="circle"
                                percent={enabledPercent}
                                strokeColor="#52c41a"
                                strokeWidth={10}
                                size={80}
                                format={() => `${enabledPercent}%`}
                            />
                        </Tooltip>
                    </div>

                    {/* Bottom content pinned */}
                    <div style={{
                        marginTop: 12,
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: 12
                    }}>
                        <span style={{ color: "#52c41a", fontWeight: 500 }}>
                            Enabled: {enabled}
                        </span>
                        <span style={{ color: "#999", fontWeight: 500 }}>
                            Disabled: {disabled}
                        </span>
                    </div>
                </div>
            </Card>

        );
    };

    const CostBreakdownCard = () => {
        if (loading) {
            return (
                <Card
                    styles={cardStyles("4px solid #722ed1")}
                    hoverable
                    style={{ flex: 1 }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        minHeight: 500
                    }}>
                        <Spin size="large" />
                    </div>
                </Card>
            );
        }

        return (
            <Card
                styles={cardStyles("4px solid #722ed1")}
                hoverable
                style={{ flex: 1,}}
            >
                <Text strong style={{
                    // marginBottom: 15, 
                    marginTop: 0,
                    fontFamily: "'Roboto', sans-serif"
                }}>
                    Tag Compliance
                </Text>
                <div style={{ marginBottom: 0 }}>
                    <Text
                        type="secondary"
                        style={{
                            fontSize: 14,
                            flex: 1,
                            fontFamily: "'Roboto', sans-serif",
                        }}
                    >
                        Total Resources:
                        <span style={{
                            color: '#1890ff',
                            fontWeight: 800,
                            fontSize: 20,
                            marginLeft: 4
                        }}>
                            {tagData.total_resources}
                        </span>
                    </Text>
                </div>
                {renderResourceProgress(
                    "Fully Tagged",
                    tagData.fully_tagged,
                    tagData.total_resources,
                    "#52c41a",
                    '0',
                    <TagOutlined />
                )}
                {renderResourceProgress(
                    "Partially Tagged",
                    tagData.partially_tagged,
                    tagData.total_resources,
                    "#fa8c16",
                    <UnorderedListOutlined />
                )}
                {renderResourceProgress(
                    "Not Tagged",
                    tagData.not_tagged,
                    tagData.total_resources,
                    "#ff4d4f",
                    <DollarCircleOutlined />
                )}
            </Card>
        );
    };

    const ServiceProgressPieCard = () => {
        // Calculate tagged and not tagged percentages based on tag compliance data
        const taggedResources = tagData.fully_tagged + tagData.partially_tagged;
        const notTaggedResources = tagData.not_tagged;
        const totalResources = tagData.total_resources;

        // Create pie chart data with two segments
        const pieData = [
            {
                name: "Tagged Resources",
                value: taggedResources,
                itemStyle: { color: "#52c41a" }
            },
            {
                name: "Not Tagged Resources",
                value: notTaggedResources,
                itemStyle: { color: "#ff4d4f" }
            }
        ];

        const pieOption = {
            tooltip: {
                trigger: "item",
                formatter: function (params) {
                    const percent = ((params.value / totalResources) * 100).toFixed(1);
                    return `${params.name}: ${params.value} resources (${percent}%)`;
                }
            },
            legend: {
                orient: "vertical",
                left: "left",
                textStyle: { fontSize: 12, fontFamily: "'Roboto', sans-serif" },
                type: 'scroll',
                height: 100
            },
            series: [
                {
                    name: "Tag Compliance",
                    type: "pie",
                    radius: ["35%", "70%"],
                    avoidLabelOverlap: false,
                    label: {
                        show: true,
                        position: "inside",
                        formatter: function (params) {
                            const percent = ((params.value / totalResources) * 100).toFixed(1);
                            return `${percent}%`;
                        },
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: 14,
                        fontWeight: 'bold'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: "16",
                            fontWeight: "bold",
                            fontFamily: "'Roboto', sans-serif"
                        }
                    },
                    labelLine: { show: false },
                    data: pieData,
                },
            ],
        };

        return (
            <Card
                styles={cardStyles("4px solid #1890ff")}
                hoverable
                style={{ flex: 1 }}
            >
                <Text strong style={{
                    marginBottom: 15,
                    marginTop: 0,
                    fontFamily: "'Roboto', sans-serif"
                }}>
                    Tag Compliance Overview
                </Text>
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                        type="secondary"
                        style={{
                            fontSize: 12,
                            fontFamily: "'Roboto', sans-serif"
                        }}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 16 }}>
                            <span style={{
                                display: 'inline-block',
                                width: 12,
                                height: 12,
                                backgroundColor: '#52c41a',
                                marginRight: 6,
                                borderRadius: '50%'
                            }}></span>
                            Tagged: {taggedResources}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <span style={{
                                display: 'inline-block',
                                width: 12,
                                height: 12,
                                backgroundColor: '#ff4d4f',
                                marginRight: 6,
                                borderRadius: '50%'
                            }}></span>
                            Not Tagged: {notTaggedResources}
                        </span>
                    </Text>
                </div>
                <ReactECharts
                    option={pieOption}
                    style={{ height: 200, width: "100%" }}
                    opts={{ renderer: 'svg' }}
                />
            </Card>
        );
    };

    return (
        <div style={{ fontFamily: "'Roboto', sans-serif" }}>
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
