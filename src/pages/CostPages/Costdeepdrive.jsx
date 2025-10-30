import React, { useState, useEffect } from "react";
import { Row, Space, Select, Button, Empty } from "antd";
import { DownOutlined } from "@ant-design/icons";
import AntdNestedTable from "../../components/CostComponents/AntdNestedTable";

export const Costdeepdrive = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAccounts = JSON.parse(localStorage.getItem("account_ids")) || [];

    fetch("http://13.212.15.14:8002/instances")
      .then((res) => res.json())
      .then((res) => {
        if (res?.results?.length > 0) {
          // ✅ Filter data by stored account IDs
          const filtered = res.results.filter((inst) =>
            storedAccounts.includes(inst.account_id)
          );

          // ✅ Extract unique account IDs
          const uniqueAccounts = [...new Set(filtered.map((i) => i.account_id))];
          setAccounts(uniqueAccounts);
        }
      })
      .catch((err) => console.error("Error fetching instances:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleReset = () => setSelectedAccount(null);

  return (
    <div style={{ margin: "16px" }}>
      {/* Filter Panel */}
      <Row justify="end" style={{ marginBottom: "1%" }}>
        <Space wrap>
          <Select
            placeholder="Select Account"
            value={selectedAccount}
            onChange={setSelectedAccount}
            style={{ minWidth: 200 }}
            suffixIcon={<DownOutlined />}
            allowClear
          >
            {accounts.map((acc) => (
              <Select.Option key={acc} value={acc}>
                {acc}
              </Select.Option>
            ))}
          </Select>

          <Button onClick={handleReset}>Reset</Button>
        </Space>
      </Row>

      {/* ✅ Show No Data if accounts empty */}
      {loading ? (
        <p>Loading...</p>
      ) : accounts.length === 0 ? (
        <div
          style={{
            height: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Empty description="No Data Found" />
        </div>
      ) : (
        <AntdNestedTable selectedAccount={selectedAccount} />
      )}
    </div>
  );
};
