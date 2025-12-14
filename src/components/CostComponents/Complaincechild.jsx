import React, { useContext, useMemo } from "react";
import { Table, Spin, Alert, Tag } from "antd";
import { CostContext } from "../../Context/CostContext";

/**
 * Compliancechild — improved robustness
 * - safe localStorage parsing with fallbacks
 * - memoized derived arrays to avoid inline duplication
 * - deterministic row keys
 * - robust tagging/status logic
 * - no console.error leaks
 */

const Compliancechild = () => {
  const { tagData, loading, error } = useContext(CostContext);

  const requiredTags = useMemo(() => ["Name", "Owner", "Project", "Environment"], []);

  // Safe parse of localStorage account_ids -> returns array of trimmed strings
  const storedAccountIds = useMemo(() => {
    try {
      const raw = localStorage.getItem("account_ids");
      if (raw == null) return [];
      const s = String(raw).trim();
      if (s === "") return [];

      // Try JSON parse
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v ?? "").trim()).filter(Boolean);
        // If parsed a single primitive
        if (typeof parsed === "string" || typeof parsed === "number") return [String(parsed).trim()].filter(Boolean);
        // Fallback to CSV string if it's something else
      } catch {
        // Not JSON — treat as CSV or single id
        if (s.includes(",")) {
          return s.split(",").map((v) => String(v ?? "").trim()).filter(Boolean);
        }
        return [s];
      }
    } catch (e) {
      // localStorage may be unavailable — return empty list
      return [];
    }
    return [];
  }, []);

  // Filter tagData by storedAccountIds in a memoized and defensive way
  const filteredTagData = useMemo(() => {
    if (!Array.isArray(tagData) || tagData.length === 0) return [];

    if (!storedAccountIds || storedAccountIds.length === 0) {
      // If no stored ids, return the backend-provided data (no client-side filtering)
      return tagData;
    }

    const idSet = new Set(storedAccountIds.map((id) => String(id).trim()));
    return tagData.filter((item) => idSet.has(String(item?.account_id ?? "").trim()));
  }, [tagData, storedAccountIds]);

  // Add stable numeric id for rowKey (avoid using array index for react key where possible)
  const dataWithIds = useMemo(() => {
    return filteredTagData.map((item, idx) => ({
      // Prefer an existing unique identifier if present (id, resource, arn), otherwise fallback to index-based id
      id: item.id ?? item.resource ?? `${String(item.account_id ?? "acc")}-${idx + 1}`,
      ...item,
    }));
  }, [filteredTagData]);

  // Return tagging status in a pure function (no inline side effects)
  const getTagStatus = (tags) => {
    if (!tags || typeof tags !== "object") return "Not Tagged";

    const presentCount = requiredTags.reduce((acc, t) => {
      const v = tags[t];
      if (v !== null && v !== undefined && String(v).trim() !== "") return acc + 1;
      return acc;
    }, 0);

    if (presentCount === requiredTags.length) return "Fully Tagged";
    if (presentCount > 0) return "Partially Tagged";
    return "Not Tagged";
  };

  // Safe helper for listing available/missing tags
  const listAvailableTags = (tags) => {
    if (!tags || typeof tags !== "object") return [];
    return requiredTags.filter((t) => tags[t] !== null && tags[t] !== undefined && String(tags[t]).trim() !== "");
  };

  const listMissingTags = (tags) =>
    requiredTags.filter((t) => !tags || tags[t] === null || tags[t] === undefined || String(tags[t]).trim() === "");

  // Unique-values helper (defensive)
  const uniqueValues = (key) =>
    Array.from(new Set(dataWithIds.map((r) => r?.[key]).filter((v) => v != null && String(v).trim() !== "")));

  // Columns (no inline mutation)
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Account Name",
      dataIndex: "account_name",
      key: "account_name",
      width: 190,
      filters: uniqueValues("account_name").map((val) => ({ text: val, value: val })),
      onFilter: (value, record) => String(record.account_name) === String(value),
    },
    {
      title: "Account ID",
      dataIndex: "account_id",
      key: "account_id",
      width: 160,
      filters: uniqueValues("account_id").map((val) => ({ text: val, value: val })),
      onFilter: (value, record) => String(record.account_id) === String(value),
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 120,
      filters: uniqueValues("region").map((val) => ({ text: val, value: val })),
      onFilter: (value, record) => String(record.region) === String(value),
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
      width: 150,
      filters: uniqueValues("service").map((val) => ({ text: val, value: val })),
      onFilter: (value, record) => String(record.service) === String(value),
    },
    {
      title: "Resource ARN",
      dataIndex: "resource",
      key: "resource",
      width: 250,
      ellipsis: true,
      render: (text) => (text ? String(text) : "-"),
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
        const color = status === "Fully Tagged" ? "green" : status === "Partially Tagged" ? "gold" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Available Tags",
      dataIndex: "tags",
      key: "available_tags",
      width: 200,
      render: (tags) => {
        const available = listAvailableTags(tags);
        return available.length ? available.join(", ") : "-";
      },
    },
    {
      title: "Missing Tags",
      dataIndex: "tags",
      key: "missing_tags",
      width: 200,
      render: (tags) => {
        const missing = listMissingTags(tags);
        return missing.length ? missing.join(", ") : "-";
      },
    },
  ];

  // Loading / error / empty states
  if (loading)
    return <Spin tip="Loading..." style={{ display: "block", margin: "20px auto" }} />;
  if (error)
    return <Alert message="Error" description={error} type="error" showIcon />;
  if (!dataWithIds || dataWithIds.length === 0)
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
        rowKey={(record) => String(record.id)}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1400 }}
      />
    </div>
  );
};

export default Compliancechild;
