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
  const [isModalOpenS3, setIsModalOpenS3] = useState(false);
const [selectedS3, setSelectedS3] = useState(null);

const [isModalOpenEC2, setIsModalOpenEC2] = useState(false);
const [selectedEC2, setSelectedEC2] = useState(null);


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
const handleOpenS3 = record => {
  setSelectedS3(record);
  setIsModalOpenS3(true);
};

const handleOpenEC2 = record => {
  setSelectedEC2(record);
  setIsModalOpenEC2(true);
};
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
      dataIndex: "last_accessed_service",
      key: "last_accessed_service",

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
    { title: "Instance Name", dataIndex: "instance_name", key: "instance_name" },
    { title: "Type", dataIndex: "instance_type", key: "instance_type" },
    { title: "region", dataIndex: "region", key: "region" },
    { title: "cpu_avg_7d", dataIndex: "cpu_avg_7d", key: "cpu_avg_7d" },
    {
      title: "status_checks_ok",
      dataIndex: "status_checks_ok",
      key: "status_checks_ok",
      render: value => (value ? "✅" : "❌")
    },
    {
      title: "underutilized",
      dataIndex: "underutilized",
      key: "underutilized",
      render: value => (
        <Tag color={value ? "green" : "red"}>
          {value ? "true" : "false"}
        </Tag>
      )
    },
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
        onClick={() => handleOpenEC2(record)}
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
            dataSource={eipData.filter(item =>
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

      {/* <Modal
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
      </Modal> */}
      <Modal
        title={`${selectedData?.account_name || selectedData?.account_id || ""} - Key Pair Details`}
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
            headStyle={header}
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Account ID">{selectedData.account_id}</Descriptions.Item>
              <Descriptions.Item label="Account Name">{selectedData.account_name}</Descriptions.Item>
              <Descriptions.Item label="Region">{selectedData.region}</Descriptions.Item>
              <Descriptions.Item label="Key Name">{selectedData.key_name}</Descriptions.Item>
              <Descriptions.Item label="Key Pair ID">{selectedData.key_pair_id}</Descriptions.Item>
              <Descriptions.Item label="Key Type">{selectedData.key_type}</Descriptions.Item>
              <Descriptions.Item label="Key Fingerprint">{selectedData.key_fingerprint}</Descriptions.Item>
              <Descriptions.Item label="Created On">{selectedData.create_time}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedData.status}</Descriptions.Item>
              <Descriptions.Item label="Instance Name">{selectedData.instance_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Instance ID">{selectedData.instance_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Tags">
                {Object.keys(selectedData.tags || {}).length > 0
                  ? JSON.stringify(selectedData.tags)
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>


      <Modal
  title={`${selectedData?.account_name || selectedData?.account_id || ""} - Elastic IP Details`}
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
        <Descriptions.Item label="Region">{selectedData.region}</Descriptions.Item>
        <Descriptions.Item label="Public IP">{selectedData.public_ip}</Descriptions.Item>
        <Descriptions.Item label="Allocation ID">{selectedData.allocation_id}</Descriptions.Item>
        <Descriptions.Item label="ARN">{selectedData.arn}</Descriptions.Item>
        <Descriptions.Item label="Month">{selectedData.months}</Descriptions.Item>
        <Descriptions.Item label="Cost Savings">{selectedData.cost_savings || "-"}</Descriptions.Item>
        <Descriptions.Item label="Status">{selectedData.status}</Descriptions.Item>
      </Descriptions>
    </Card>
  )}
</Modal>
<Modal
  title={`${selectedData?.account_name || selectedData?.account_id || ""} - Orphaned Volume Details`}
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
        <Descriptions.Item label="Region">{selectedData.region}</Descriptions.Item>
        <Descriptions.Item label="Availability Zone">{selectedData.availability_zone}</Descriptions.Item>
        <Descriptions.Item label="Volume ID">{selectedData.volume_id}</Descriptions.Item>
        <Descriptions.Item label="Volume Name">{selectedData.volume_name || "-"}</Descriptions.Item>
        <Descriptions.Item label="Size (GB)">{selectedData.size}</Descriptions.Item>
        <Descriptions.Item label="State">{selectedData.state}</Descriptions.Item>
        <Descriptions.Item label="Throughput">{selectedData.throughput || "-"}</Descriptions.Item>
        <Descriptions.Item label="IOPS">{selectedData.iops || "-"}</Descriptions.Item>
        <Descriptions.Item label="Snapshot ID">{selectedData.snapshot_id || "-"}</Descriptions.Item>
        <Descriptions.Item label="Create Time">{selectedData.create_time}</Descriptions.Item>
        <Descriptions.Item label="Created At">{selectedData.created_at}</Descriptions.Item>
        <Descriptions.Item label="Tags">
          {Array.isArray(selectedData.tags) && selectedData.tags.length > 0
            ? selectedData.tags.map(tag => `${tag.Key}: ${tag.Value}`).join(", ")
            : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )}
</Modal>
<Modal
  title={`${selectedData?.account_name || selectedData?.account_id || ""} - S3 Bucket Details`}
  open={isModalOpen}
  onCancel={() => setIsModalOpen(false)}
  footer={null}
  width={1000}
>
  {selectedData && (
    <>
      {/* Main Bucket Information */}
      <Card size="small" title="Bucket Information" style={{ marginBottom: 16 }} headStyle={header}>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Account ID">{selectedData.account_id}</Descriptions.Item>
          <Descriptions.Item label="Account Name">{selectedData.account_name}</Descriptions.Item>
          <Descriptions.Item label="Region">{selectedData.region}</Descriptions.Item>
          <Descriptions.Item label="Bucket Name">{selectedData.bucket_name}</Descriptions.Item>
          <Descriptions.Item label="Bucket ARN">{selectedData.bucket_arn}</Descriptions.Item>
          <Descriptions.Item label="Owner">{selectedData.owner}</Descriptions.Item>
          <Descriptions.Item label="Created On">{selectedData.creation_date}</Descriptions.Item>
          <Descriptions.Item label="Last Modified">{selectedData.last_modified_date}</Descriptions.Item>
          <Descriptions.Item label="Versioning Status">
            {selectedData.versioning_status ?? "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Encryption">{selectedData.encryption || "-"}</Descriptions.Item>
          <Descriptions.Item label="KMS Key ID">{selectedData.kms_key_id || "-"}</Descriptions.Item>
          <Descriptions.Item label="MFA Delete">{selectedData.mfa_delete ? "✅" : "❌"}</Descriptions.Item>
          <Descriptions.Item label="Public Access Block">{selectedData.public_access_block ? "✅" : "❌"}</Descriptions.Item>
          <Descriptions.Item label="Replication Status">{selectedData.replication_status || "-"}</Descriptions.Item>
          <Descriptions.Item label="Logging Status">{selectedData.logging_status || "-"}</Descriptions.Item>
          <Descriptions.Item label="Object Count">{selectedData.object_count}</Descriptions.Item>
          <Descriptions.Item label="Bucket Size (GB)">{selectedData.bucket_size_gb}</Descriptions.Item>
          <Descriptions.Item label="Tags">
            {selectedData.tags ? JSON.stringify(selectedData.tags) : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Checked On">{selectedData.checked_on}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Risk Indicators */}
      <Card size="small" title="Risk Indicators" style={{ marginBottom: 16 }} headStyle={header}>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Public">{selectedData.risk_indicators?.public ? "⚠️ Yes" : "✅ No"}</Descriptions.Item>
          <Descriptions.Item label="Unencrypted">{selectedData.risk_indicators?.unencrypted ? "⚠️ Yes" : "✅ No"}</Descriptions.Item>
          <Descriptions.Item label="No Versioning">{selectedData.risk_indicators?.no_versioning ? "⚠️ Yes" : "✅ No"}</Descriptions.Item>
          <Descriptions.Item label="Replication Disabled">{selectedData.risk_indicators?.replication_disabled ? "⚠️ Yes" : "✅ No"}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* CORS Configuration Table */}
      {Array.isArray(selectedData.cors_configuration) && selectedData.cors_configuration.length > 0 && (
        <Card size="small" title="CORS Configuration" style={{ marginBottom: 16 }} headStyle={header}>
          <Table
            bordered
            size="small"
            rowKey={(record, idx) => idx}
            pagination={false}
            columns={[
              { title: "Max Age Seconds", dataIndex: "MaxAgeSeconds", key: "MaxAgeSeconds" },
              { title: "Allowed Headers", dataIndex: "AllowedHeaders", key: "AllowedHeaders", render: v => v.join(", ") },
              { title: "Allowed Methods", dataIndex: "AllowedMethods", key: "AllowedMethods", render: v => v.join(", ") },
              { title: "Allowed Origins", dataIndex: "AllowedOrigins", key: "AllowedOrigins", render: v => v.join(", ") },
            ]}
            dataSource={selectedData.cors_configuration}
          />
        </Card>
      )}

      {/* Lifecycle Rules Table */}
      {Array.isArray(selectedData.lifecycle_rules) && selectedData.lifecycle_rules.length > 0 && (
        <Card size="small" title="Lifecycle Rules" headStyle={header}>
          <Table
            bordered
            size="small"
            rowKey={(record, idx) => idx}
            pagination={false}
            columns={[
              { title: "Rule ID", dataIndex: "ID", key: "ID" },
              { title: "Prefix", dataIndex: ["Filter", "Prefix"], key: "Prefix" },
              { title: "Status", dataIndex: "Status", key: "Status" },
              { title: "Expiration (Days)", dataIndex: ["Expiration", "Days"], key: "Days" },
            ]}
            dataSource={selectedData.lifecycle_rules}
          />
        </Card>
      )}
    </>
  )}
</Modal>

    </>
  );
};

export default Observability;
