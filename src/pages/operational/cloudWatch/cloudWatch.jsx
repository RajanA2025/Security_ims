import React, { useEffect, useState } from "react";
import {
    Table,
    Tag,
    Modal,
    Descriptions,
    Row,
    Col,
    Input,
    Card,
    Tooltip,
    Typography,
} from "antd";
import {
    EyeOutlined,
    InfoCircleOutlined,
    SearchOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    MinusOutlined,
} from "@ant-design/icons";
import axios from "axios";

// 🔹 Operator mapping with symbols & icons
const operatorMap = {
    GreaterThanOrEqualToThreshold: {
        symbol: "≥",
        icon: <ArrowUpOutlined style={{ color: "green" }} />,
    },
    GreaterThanThreshold: {
        symbol: ">",
        icon: <ArrowUpOutlined style={{ color: "green" }} />,
    },
    LessThanThreshold: {
        symbol: "<",
        icon: <ArrowDownOutlined style={{ color: "red" }} />,
    },
    LessThanOrEqualToThreshold: {
        symbol: "≤",
        icon: <ArrowDownOutlined style={{ color: "red" }} />,
    },
    EqualToThreshold: {
        symbol: "=",
        icon: <MinusOutlined style={{ color: "gray" }} />,
    },
};

const headerStyle = { backgroundColor: "#4f46e5", color: "white" };

const API_URL = "http://13.212.15.14:8016/cloudwatch";

const Business = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [searchText, setSearchText] = useState("");

    // 🔹 Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(API_URL);
                setData(data);
            } catch (error) {
                console.error("Error fetching CloudWatch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 🔹 Extract username safely
    const getRecordUsername = (record) =>
        (
            record?.account_name ||
            record?.accountName ||
            record?.user_identity?.accountName ||
            record?.user_identity?.accountname ||
            record?.user?.username ||
            record?.user?.name ||
            ""
        ).toString();

    // 🔹 Filters
    const accountIds = [...new Set(data.map((item) => item.account_id))];
    const regions = [...new Set(data.map((item) => item.region))];
    const alarms = [...new Set(data.map((item) => item.alarm_name))];

    // 🔹 Open modal
    const handleOpenModal = (record) => {
        setSelectedData(record);
        setIsModalOpen(true);
    };

    // 🔹 Search handler
    const handleSearch = (e) => setSearchText(e.target.value);

    // 🔹 Columns
    const columns = [
        {
            title: (
                <span>
                    Account ID{" "}
                    <Tooltip title="AWS account ID associated with the event.">
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    </Tooltip>
                </span>
            ),
            dataIndex: "account_id",
            key: "account_id",
            filters: accountIds.map((id) => ({ text: id, value: id })),
            onFilter: (value, record) => record.account_id === value,
        },
        {
            title: (
                <span>
                    Account Name{" "}
                    <Tooltip title="AWS user or role that performed the action.">
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    </Tooltip>
                </span>
            ),
            key: "account_name",
            render: (_, record) => getRecordUsername(record),
        },
        {
            title: (
                <span>
                    Alarm Name{" "}
                    <Tooltip title="CloudWatch alarm that triggered.">
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    </Tooltip>
                </span>
            ),
            dataIndex: "alarm_name",
            key: "alarm_name",
            filters: alarms.map((a) => ({ text: a, value: a })),
            onFilter: (value, record) => record.alarm_name === value,
        },
        {
            title: "Metric Name",
            dataIndex: "metric_name",
            key: "metric_name",
        },
        {
            title: "Instance ID",
            dataIndex: "instance_id",
            key: "instance_id",
        },
        {
            title: "Instance Name",
            dataIndex: "instance_name",
            key: "instance_name",
            filters: [...new Set(data.map((item) => item.instance_name))].map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) => record.instance_name === value,
        },
        {
            title: "Threshold",
            dataIndex: "threshold",
            key: "threshold",
            render: (value, record) => {
                const operator =
                    operatorMap[record.comparison_operator] || {
                        symbol: "?",
                        icon: null,
                    };
                return (
                    <Tooltip title={record.comparison_operator}>
                        <span>
                            {operator.icon} {operator.symbol} {value}
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: "More Details",
            key: "action",
            render: (_, record) => (
                <Tooltip title="View Details">
                    <EyeOutlined
                        style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
                        onClick={() => handleOpenModal(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    // 🔹 Filtered data by search
    const filteredData = data.filter((item) =>
        getRecordUsername(item).toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <>
            {/* Header & Search */}
            <Row gutter={[16, 16]} style={{ marginBottom: 5 }}>
                <Col md={20}>
                    <Typography.Title
                        level={4}
                        style={{
                            fontFamily:
                                "Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif",
                            fontSize: "20px",
                            fontWeight: 500,
                            color: "black",
                            margin: 0,
                        }}
                    >
                        Cloud-Watch
                    </Typography.Title>
                </Col>
                <Col md={4}>
                    <Input
                        placeholder="Search by Account Name"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearch}
                        allowClear
                    />
                </Col>
            </Row>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey={(record) =>
                    record.event_id ||
                    `${getRecordUsername(record)}-${record.event_time}`
                }
                pagination={{ pageSize: 8 }}
            />

            {/* Modal */}
            {/* <Modal
        title={`${selectedData?.account_name || ""} - Account Details`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedData && (
          <Card
            size="small"
            title="Information"
            style={{ marginBottom: 16 }}
            headStyle={headerStyle}
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">
                {selectedData.account_id}
              </Descriptions.Item>
              <Descriptions.Item label="Account Name">
                {getRecordUsername(selectedData)}
              </Descriptions.Item>
              <Descriptions.Item label="Instance ID">
                {selectedData.instance_id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Instance Name">
                {selectedData.instance_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Namespace">
                {selectedData.namespace || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="State Value">
                {selectedData.state_value || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="State Updated">
                {selectedData.state_updated || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Evaluation Periods">
                {selectedData.evaluation_periods}
              </Descriptions.Item>
              <Descriptions.Item label="Period">
                {selectedData.period}
              </Descriptions.Item>
              <Descriptions.Item label="Statistic">
                {selectedData.statistic || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="History Event Time">
                {selectedData.history_event_time || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="History Summary">
                {selectedData.history_summary || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal> */}
            {/* Modal */}
            <Modal
                title={`${selectedData?.account_name || ""} - Account Details`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={900}
            >
                {selectedData && (
                    <Card
                        size="small"
                        title="Information"
                        style={{ marginBottom: 16 }}
                        headStyle={headerStyle}
                    >
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Account ID">
                                {selectedData.account_id || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Account Name">
                                {selectedData.account_name || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Region">
                                {selectedData.region || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Alarm Name">
                                {selectedData.alarm_name || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Alarm ARN" span={2}>
                                {selectedData.alarm_arn || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Metric Name">
                                {selectedData.metric_name || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Namespace">
                                {selectedData.namespace || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Instance ID">
                                {selectedData.instance_id || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Instance Name">
                                {selectedData.instance_name || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="State Value">
                                {selectedData.state_value || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="State Updated">
                                {selectedData.state_updated || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Threshold">
                                {selectedData.threshold || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Comparison Operator">
                                {selectedData.comparison_operator || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Evaluation Periods">
                                {selectedData.evaluation_periods || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Period">
                                {selectedData.period || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Statistic">
                                {selectedData.statistic || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="History Event Time">
                                {selectedData.history_event_time || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="History Timestamp">
                                {selectedData.history_timestamp || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="History Summary" span={2}>
                                {selectedData.history_summary || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="History Message" span={2}>
                                {selectedData.history_message || "-"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}
            </Modal>

        </>
    );
};

export default Business;
