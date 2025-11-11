import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Modal,
  Descriptions,
  Row,
  Col,
  Card,
  Input,
  Select,
  Tabs,
  Tooltip,
  Button,
  Typography
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import axios from "axios";

const header = { backgroundColor: "#4f46e5", color: "white" };

const SecurityTools = () => {
  const { Option } = Select;

  // Make default the KMS tab so its data is fetched on mount
  const [tabKey, setTabKey] = useState("1");
  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState([]);
  const [kmData, setKmData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedData1, setSelectedData1] = useState(null);

  const [searchText, setSearchText] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get stored account IDs
        let storedAccountIds = localStorage.getItem("account_ids");

        try {
          storedAccountIds = JSON.parse(storedAccountIds);
        } catch {
          storedAccountIds = [storedAccountIds]; // wrap single ID
        }

        // Normalize function
        const normalizeId = (id) => String(id).trim().toLowerCase();
        const storedIds = storedAccountIds.map(id => normalizeId(id));
        console.log("Filtered Account IDs:", storedIds);

        if (tabKey === "2") {
          const res = await axios.get("http://47.130.218.97:8012/tools");
          if (Array.isArray(res.data)) {
            const filtered = res.data.filter(item =>
              storedIds.includes(normalizeId(item.account_id || item.aws_account))
            );
            setSecurityData(filtered);
          }
        } else if (tabKey === "1") {
          const res = await axios.get("http://47.130.218.97:8012/kms");
          if (Array.isArray(res.data)) {
            const filtered = res.data.filter(item =>
              storedIds.includes(normalizeId(item.account_id || item.aws_account))
            );
            setKmData(filtered);
          }
        }
      } catch (err) {
        console.error("Error fetching filtered data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tabKey]);


  const handleSearch = e => setSearchText(e.target.value);

  const handleOpenModal = record => {
    setSelectedData(record);
    setIsModalOpen(true);
  };
  const handleOpenModal1 = record => {
    setSelectedData1(record);
    setIsModalOpen1(true);
  };


  const getUniqueOptions = (data, key) => {
    const unique = [...new Set(data.map(item => item[key]))];
    return unique.map(value => ({ text: String(value), value }));
  };

  // Security Tab Columns
  const columns = [
    {
      title: (
        <span>
          Account Name{" "}
          <Tooltip title="The AWS account's name.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "account_name",
      key: "account_name"
    },
    {
      title: (
        <span>
          Region{" "}
          <Tooltip title="AWS region where the service is running.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "region",
      key: "region",
      filters: getUniqueOptions(securityData, "region"),
      onFilter: (value, record) => record.region === value
    },
    {
      title: (
        <span>
          Tool{" "}
          <Tooltip title="Security tool used in AWS.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "tool",
      key: "tool",
      filters: getUniqueOptions(securityData, "tool"),
      onFilter: (value, record) => record.tool === value
    },
    {
      title: (
        <span>
          Status{" "}
          <Tooltip title="Indicates if the tool is active or disabled.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Enabled", value: "Enabled" },
        { text: "Disabled", value: "Disabled" }
      ],
      onFilter: (value, record) => record.status === value,
      render: value => (
        <Tag color={value === "Disabled" ? "red" : "green"}>{value}</Tag>
      )
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
      )
    }
  ];

  // KMS Tab Columns
  const columns1 = [
    {
      title: (
        <span>
          Account Id{" "}
          <Tooltip title="The AWS account's name.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "account_id",
      key: "account_id",
      filters: getUniqueOptions(kmData, "account_id"),
      onFilter: (value, record) => record.aws_account === value
    },
    {
      title: (
        <span>
          Alias Key{" "}
          <Tooltip title="A Key Alias is a friendly name that you assign to a KMS key">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "key_alias",
      key: "key_alias",
      // filters: getUniqueOptions(kmData, "key_alias"),
      // onFilter: (value, record) => record.key_alias === value
    },
    {
      title: (
        <span>
          State Key{" "}
          <Tooltip title="The AWS account's name.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "key_state",
      key: "key_state",
      filters: getUniqueOptions(kmData, "key_state"),
      onFilter: (value, record) => record.key_state === value,
      render: value => (
        <Tag color={value ? "green" : "red"}>{value ? "Enabled" : "Disabled"}</Tag>
      )
    },

    {
      title: (
        <span>
          Last Accessed Service{" "}
          <Tooltip title="The AWS account's name.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "last_accessed_service",
      key: "last_accessed_service",

    },
    {
      title: (
        <span>
          Key Rotation{" "}
          <Tooltip title="The AWS account's name.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "key_rotation_enabled",
      key: "key_rotation_enabled",
      filters: [
        { text: "True", value: true },
        { text: "False", value: false }
      ],
      onFilter: (value, record) => record.key_rotation_enabled === value,
      render: value => (
        <Tag color={value ? "green" : "red"}>{value ? "True" : "False"}</Tag>
      )
    },
    {
      title: (
        <span>
          Deletion Protection{" "}
          <Tooltip title="The AWS account's name.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "deletion_protection",
      key: "deletion_protection",
      filters: [
        { text: "True", value: true },
        { text: "False", value: false }
      ],
      onFilter: (value, record) => record.deletion_protection === value,
      render: value => (
        <Tag color={value ? "green" : "red"}>{value ? "True" : "False"}</Tag>
      )
    },
    {
      title: "Last Used Date",
      dataIndex: "last_used_date",
      key: "last_used_date",

    },
    // {
    //   title: "Creation Date",
    //   dataIndex: "creation_date",
    //   key: "creation_date"
    // },
    {
      title: "More Details",
      key: "action",
      render: (_, record) => (
        <Tooltip title="View Details">
          <EyeOutlined
            style={{ fontSize: 18, color: "#1890ff", cursor: "pointer" }}
            onClick={() => handleOpenModal1(record)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div className="p-6">


      <Row gutter={[16, 16]} style={{ justifyContent: "flex-end" }}>
        <Col md={20}>
          <Typography.Title
            level={4}
            style={{
              fontFamily: "'Roboto', 'Segoe UI', sans-serif",
              fontSize: "20px",
              fontWeight: 500,
              color: "black",
              margin: 0
            }}
          >
            Security & KMS Tools
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

      <Tabs
        activeKey={tabKey}
        onChange={key => setTabKey(key)}
        style={{
          marginTop: "0px",
          padding: "0px"
        }}
      >
        <Tabs.TabPane tab="KMS" key="1">
          <Table
            columns={columns1}
            dataSource={kmData.filter(item =>
              item.account_id?.toLowerCase().includes(searchText.toLowerCase())
            )} r
            loading={loading}
            rowKey="username"
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Security" key="2">
          <Table
            columns={columns}
            dataSource={securityData.filter(item =>
              item.account_name?.toLowerCase().includes(searchText.toLowerCase())
            )}
            loading={loading}
            rowKey="username"
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>

      </Tabs>

      <Modal
        title={`${selectedData?.account_name || selectedData?.account_id || ""} - Account Details`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedData && (
          <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={header}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">{selectedData.account_id}</Descriptions.Item>
              <Descriptions.Item label="Account Name">{selectedData.account_name}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedData.status}</Descriptions.Item>
              <Descriptions.Item label="Check On">{selectedData.checked_on}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>

      <Modal
        title={`Account Details`}
        open={isModalOpen1}
        onCancel={() => setIsModalOpen1(false)}
        footer={null}
        width={900}
      >
        {selectedData1 && (
          <Card size="small" title="Information" style={{ marginBottom: 16 }} headStyle={header}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">{selectedData1.aws_account}</Descriptions.Item>
              <Descriptions.Item label="Key Id">{selectedData1.key_id}</Descriptions.Item>
              <Descriptions.Item label="key ARN">{selectedData1.key_arn}</Descriptions.Item>
              <Descriptions.Item label="Origin">{selectedData1.origin}</Descriptions.Item>
              <Descriptions.Item label="Key Type">{selectedData1.key_type}</Descriptions.Item>
              <Descriptions.Item label="Usage Key">{selectedData1.key_usage}</Descriptions.Item>
              {/* <Descriptions.Item label="Status">{selectedData1.creation_date}</Descriptions.Item> */}
              <Descriptions.Item label="Rotation Age">{selectedData1.rotation_age_days}</Descriptions.Item>
              <Descriptions.Item label="created On">{selectedData1.creation_date}</Descriptions.Item>
              <Descriptions.Item label="Multi Region">{selectedData1.multi_region}</Descriptions.Item>
              <Descriptions.Item label="Acoount Access">{selectedData1.cross_account_access}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedData1.description}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default SecurityTools;
