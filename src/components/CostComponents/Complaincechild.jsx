import React, { useContext, useMemo } from "react";
import { Table, Spin, Alert, Tag } from "antd";
import { CostContext } from "../../Context/CostContext";

const Compliancechild = () => {
  const { tagData, loading, error } = useContext(CostContext);


  console.log("first", tagData);

  const requiredTags = ["Name", "Owner", "Project", "Environment"];

  // ✅ Get account IDs from localStorage
  const storedAccountIds = JSON.parse(localStorage.getItem("account_ids")) || [];

  // ✅ Filter data by localStorage account_ids
  const filteredTagData = useMemo(() => {
    if (!Array.isArray(tagData)) return [];

    // Convert both to strings for accurate matching
    const normalizedIds = storedAccountIds.map(String);
    const filtered = tagData.filter((item) =>
      normalizedIds.includes(String(item.account_id))
    );

    console.log("🧩 Stored IDs:", normalizedIds);
    console.log("🧩 Filtered count:", filtered.length);
    console.log("🧩 Example IDs in tagData:", tagData.slice(0, 3).map((d) => d.account_id));

    return filtered;
  }, [tagData, storedAccountIds]);

  // ✅ Add IDs for table key
  const dataWithIds = filteredTagData.map((item, index) => ({
    ...item,
    id: index + 1,
  }));

  // ✅ Tagging logic
  const getTagStatus = (tags) => {
    if (!tags) return "Not Tagged";
    const present = requiredTags.filter(
      (tag) => tags[tag] !== null && tags[tag] !== "" && tags[tag] !== undefined
    );
    if (present.length === requiredTags.length) return "Fully Tagged";
    if (present.length > 0) return "Partially Tagged";
    return "Not Tagged";
  };

  const uniqueValues = (key) =>
    [...new Set(dataWithIds.map((r) => r[key]))].filter(Boolean);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Account Name",
      dataIndex: "account_name",
      key: "account_name",
      width: 190,
      filters: uniqueValues("account_name").map((val) => ({ text: val, value: val })),
      onFilter: (value, record) => record.account_name === value,
    },
    {
      title: "Account ID",
      dataIndex: "account_id",
      key: "account_id",
      width: 160,
      filters: uniqueValues("account_id").map((val) => ({ text: val, value: val })),
      onFilter: (value, record) => record.account_id === value,
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 120,
      filters: uniqueValues("region").map((val) => ({ text: val, value: val })),
      onFilter: (value, record) => record.region === value,
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
      width: 150,
      filters: uniqueValues("service").map((val) => ({ text: val, value: val })),
      onFilter: (value, record) => record.service === value,
    },
    {
      title: "Resource ARN",
      dataIndex: "resource",
      key: "resource",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Tagging Status",
      dataIndex: "tags",
      key: "tags",
      width: 190,
      filters: [
        { text: "Fully Tagged", value: "Fully Tagged" },
        { text: "Partially Tagged", value: "Partially Tagged" },
        { text: "Not Tagged", value: "Not Tagged" },
      ],
      onFilter: (value, record) => getTagStatus(record.tags) === value,
      render: (tags) => {
        const status = getTagStatus(tags);
        const color =
          status === "Fully Tagged"
            ? "green"
            : status === "Partially Tagged"
            ? "gold"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Available Tags",
      dataIndex: "tags",
      key: "available_tags",
      width: 200,
      render: (tags) => {
        if (!tags) return "-";
        const available = requiredTags.filter(
          (key) => tags[key] !== null && tags[key] !== "" && tags[key] !== undefined
        );
        return available.length ? available.join(", ") : "-";
      },
    },
    {
      title: "Missing Tags",
      dataIndex: "tags",
      key: "missing_tags",
      width: 200,
      render: (tags) => {
        const missing = requiredTags.filter(
          (key) =>
            !tags || tags[key] === null || tags[key] === "" || tags[key] === undefined
        );
        return missing.length ? missing.join(", ") : "-";
      },
    },
  ];

  if (loading)
    return <Spin tip="Loading..." style={{ display: "block", margin: "20px auto" }} />;
  if (error)
    return <Alert message="Error" description={error} type="error" showIcon />;
  if (dataWithIds.length === 0)
    return <Alert message="No matching accounts found" type="info" showIcon />;

  return (
    <div style={{ padding: 16 }}>
      <h3
        style={{
          fontFamily: "'Roboto', sans-serif",
          paddingTop: 16,
          paddingBottom: 16,
          margin: 0,
          color: "#000e00",
        }}
      >
        Resource Tag Compliance
      </h3>

      <Table
        dataSource={dataWithIds}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1400 }}
      />
    </div>
  );
};

export default Compliancechild;
