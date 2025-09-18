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

const Observability = () => {
  const { Option } = Select;

  const [tabKey, setTabKey] = useState("1");
  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState([]);
  const [eipData, seteipData] = useState([]);
  const [volumeData, setvolumeData] = useState([]);
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
        if (tabKey === "1") {
          const res = await axios.get("http://13.212.15.14:8012/keypairs2");
          setSecurityData(res.data);
        } else if (tabKey === "2") {
          const res = await axios.get("http://13.212.15.14:8012/orphaned_eip");
          seteipData(res.data);
        }
        else if (tabKey === "3") {
            const res = await axios.get("http://13.212.15.14:8012/orphaned_volumes");
            setvolumeData(res.data);
          }
      } catch (err) {
        console.error("Error fetching data:", err);
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

  const accountIds = [...new Set(securityData.map(item => item.account_id))];
  const statusIds = [...new Set(securityData.map(item => item.status))];
  const getUniqueOptions = (data, key) => {
    const unique = [...new Set(data.map(item => item[key]))];
    return unique.map(value => ({ text: String(value), value }));
  };

  // Security Tab Columns
  const columns = [
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
      filters: accountIds.map(id => ({ text: id, value: id })),
      onFilter: (value, record) => record.account_id === value
    },
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
          Key Name{" "}
          <Tooltip title="Security Key used in AWS.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "key_name",
      key: "key_name",
      filters: getUniqueOptions(securityData, "keyName"),
      onFilter: (value, record) => record.key_name === value
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
      filters: statusIds.map(id => ({ text: id, value: id })),
      // onFilter: (value, record) => record.account_id === value
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
      filters: accountIds.map(id => ({ text: id, value: id })),
      onFilter: (value, record) => record.account_id === value
    },
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
           Public IP{" "}
          <Tooltip title="Security Key used in AWS.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "key_name",
      key: "key_name",
      filters: getUniqueOptions(securityData, "keyName"),
      onFilter: (value, record) => record.key_name === value
    },
    {
      title: (
        <span>
          allocation ID{" "}
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
  const columns2 = [
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
      filters: accountIds.map(id => ({ text: id, value: id })),
      onFilter: (value, record) => record.account_id === value
    },
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
          Volume ID{" "}
          <Tooltip title="Security Key used in AWS.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "key_name",
      key: "key_name",
      filters: getUniqueOptions(securityData, "keyName"),
      onFilter: (value, record) => record.key_name === value
    },
    {
      title: (
        <span>
          Volume Name{" "}
          <Tooltip title="Security Key used in AWS.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "key_name",
      key: "key_name",
      filters: getUniqueOptions(securityData, "keyName"),
      onFilter: (value, record) => record.key_name === value
    },
    {
      title: (
        <span>
          Size{" "}
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
    <>
     

      <Row gutter={[16, 16]} style={{ justifyContent: "flex-end" }}>
        <Col md={20}>
        <Typography.Title 
  level={4}
  style={{
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    fontSize: "20px",
    fontWeight: 500,
    color: "black",
    margin: 0
  }}
>
Observability
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
        defaultActiveKey="1" 
        onChange={key => setTabKey(key)}
        style={{
          marginTop: "0px",
          padding: "0px"
        }}
      >
        <Tabs.TabPane tab="Key Pair" key="1">
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
        <Tabs.TabPane tab="Unassociated Elastic IP" key="2">
          <Table
            columns={columns1}
            dataSource={eipData.filter(item =>
              item.aws_account?.toLowerCase().includes(searchText.toLowerCase())
            )}
            loading={loading}
            rowKey="username"
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Orphaned volume" key="3">
          <Table
            columns={columns2}
            dataSource={eipData.filter(item =>
              item.aws_account?.toLowerCase().includes(searchText.toLowerCase())
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
              <Descriptions.Item label="Created On">{selectedData.create_time}</Descriptions.Item>
              <Descriptions.Item label="Instance ID">{selectedData.instance_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Instance Name">{selectedData.instance_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedData.status}</Descriptions.Item>
              <Descriptions.Item label="Key Name">{selectedData.key_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Key Type">{selectedData.key_type || "-"}</Descriptions.Item>
              <Descriptions.Item label="FingerPrint Key">{selectedData.key_fingerprint || "-"}</Descriptions.Item>
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
    </>
  );
};

export default Observability;
