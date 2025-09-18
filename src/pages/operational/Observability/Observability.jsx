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
  const [volumeData, setVolumeData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedData1, setSelectedData1] = useState(null);
  const [s3Data, setS3Data] = useState([]);
  const [ec2Data, setEC2Data] = useState([]);

  const [searchText, setSearchText] = useState("");
  //test for search name id
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");


  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tabKey === "1") {
          const res = await axios.get("http://13.212.15.14:8016/keypairs2");
          setSecurityData(res.data);
        } else if (tabKey === "2") {
          const res = await axios.get("http://13.212.15.14:8016/orphaned-eip");
          seteipData(res.data);
        }
        else if (tabKey === "3") {
          const res = await axios.get("http://13.212.15.14:8016/orphaned-volumes");
          setVolumeData(res.data);
        }
        if (tabKey === "4") {
          const res = await axios.get("http://13.212.15.14:8016/s3");
          setS3Data(res.data);
        } else if (tabKey === "5") {
          const res = await axios.get("http://13.212.15.14:8016/ec2");
          setEC2Data(res.data);
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

  // EIP Tab Columns
  const eipColumns = [
    {
      title: 'Account ID',
      dataIndex: 'account_id',
      key: 'account_id',
    },
    {
      title: 'Account Name',
      dataIndex: 'account_name',
      key: 'account_name',
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'Allocation ID',
      dataIndex: 'allocation_id',
      key: 'allocation_id',
    },
    {
      title: 'arn',
      dataIndex: 'arn',
      key: 'arn',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'in-use' ? 'green' : 'red'}>{status}</Tag>
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

  // Volume Tab Columns
  const volumeColumns = [
    {
      title: 'Account ID',
      dataIndex: 'account_id',
      key: 'account_id',
    },
    {
      title: 'Account Name',
      dataIndex: 'account_name',
      key: 'account_id',
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'Volume ID',
      dataIndex: 'volume_id',
      key: 'volume_id',
    },
    {
      title: 'Size (GB)',
      dataIndex: 'size',
      key: 'size',
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
  const kmsColumns = [
    {
      title: (
        <span>
          Account Id{" "}
          <Tooltip title="The AWS account's ID.">
            <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "account_id",
      key: "account_id",
      filters: getUniqueOptions(eipData, "account_id"),
      onFilter: (value, record) => record.account_id === value
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
      // filters: getUniqueOptions(eipData, "key_alias"),
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
      filters: getUniqueOptions(eipData, "key_state"),
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
      title: "LastUsed Date",
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
  const s3Columns = [
    {
      title: "Account ID", dataIndex: "account_id", key: "account_id"
    },
    { title: "Account Name", dataIndex: "account_name", key: "account_name" },
    { title: "Bucket Name", dataIndex: "bucket_name", key: "bucket_name" },
    {
      title: "Versioning",
      dataIndex: "versioning_status",
      key: "versioning_status",
      render: value => {
        if (!value) {
          // Bucket never had versioning enabled
          return <Tag color="default">Unversioned</Tag>;
        }
        if (value.toLowerCase() === "enabled") {
          return <Tag color="green">Enabled</Tag>;
        }
        if (value.toLowerCase() === "suspended") {
          return <Tag color="orange">Suspended</Tag>;
        }
        return <Tag color="default">{value}</Tag>; // fallback for unexpected values
      }
    },
    {
      title: "Public Access Block",
      dataIndex: "public_access_block",
      key: "public_access_block",
      render: value => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Enabled" : "Disabled"}
        </Tag>
      )
    },

    { title: "Region", dataIndex: "region", key: "region" },
    {
      title: "replication_status",
      dataIndex: "replication_status",
      key: "replication_status",
      render: value => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Enabled" : "Disabled"}
        </Tag>
      )
    },
    {
      title: "MFA Delete",
      dataIndex: "mfa_delete",
      key: "mfa_delete",
      render: value => (value ? "✅" : "❌")
    },

    { title: "object_count", dataIndex: "object_count", key: "object_count" },
    { title: "bucket_size_gb", dataIndex: "bucket_size_gb", key: "bucket_size_gb" },
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
  const ec2Columns = [
    { title: "Account ID", dataIndex: "account_id", key: "account_id" },
    { title: "Account Name", dataIndex: "account_name", key: "account_name" },
    { title: "Instance ID", dataIndex: "instance_id", key: "instance_id" },
    { title: "Type", dataIndex: "instance_type", key: "instance_type" },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: value => (
        <Tag color={value === "running" ? "green" : "red"}>{value}</Tag>
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
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            allowClear
          />
        </Col>
        <Col md={4}>
          <Input
            placeholder="Search by Account ID"
            prefix={<SearchOutlined />}
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
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
              (item.account_name?.toLowerCase().includes(searchName.toLowerCase())) &&
              (item.account_id?.toLowerCase().includes(searchId.toLowerCase()))
            )}

            loading={loading}
            rowKey={(record) => record.allocation_id || record.volume_id || record.key_id || 'key'}
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Unassociated Elastic IP" key="2">
          <Table
            columns={eipColumns}
            dataSource={securityData.filter(item =>
  (item.account_name?.toLowerCase().includes(searchName.toLowerCase())) &&
  (item.account_id?.toLowerCase().includes(searchId.toLowerCase()))
)}

            loading={loading}
            rowKey={(record) => record.allocation_id || 'eip-key'}
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Orphaned volume" key="3">
          <Table
            columns={volumeColumns}
            dataSource={volumeData.filter(item =>
              (item.aws_account?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
              (item.volume_id?.toLowerCase() || '').includes(searchText.toLowerCase())
            )}
            loading={loading}
            rowKey={(record) => record.volume_id || 'volume-key'}
            pagination={{ pageSize: 8 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="S3 Details" key="4">
  <Table
    columns={s3Columns}
    dataSource={s3Data.filter(item =>
      (item.account_name?.toLowerCase().includes(searchName.toLowerCase())) &&
      (item.account_id?.toLowerCase().includes(searchId.toLowerCase()))
    )}
    loading={loading}
    rowKey={record => record.bucket_name || 's3-key'}
    pagination={{ pageSize: 8 }}
  />
</Tabs.TabPane>


        <Tabs.TabPane tab="EC2 Details" key="5">
  <Table
    columns={ec2Columns}
    dataSource={ec2Data.filter(item =>
      (item.account_name?.toLowerCase().includes(searchName.toLowerCase())) &&
      (item.account_id?.toLowerCase().includes(searchId.toLowerCase()))
    )}
    loading={loading}
    rowKey={record => record.instance_id || 'ec2-key'}
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
              <Descriptions.Item label="Account ID">{selectedData1.account_id}</Descriptions.Item>
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
