import React, { useState, useEffect } from "react";
import { Row, Space, Select, Button, Empty } from "antd";
import { DownOutlined } from "@ant-design/icons";
import AntdNestedTable from "../../components/CostComponents/AntdNestedTable";

export const Costdeepdrive = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Read stored value and normalize it into an array
    let storedAccounts = JSON.parse(localStorage.getItem("account_ids")) || [];
    if (typeof storedAccounts === "string") {
      storedAccounts = [storedAccounts];


      console.log("storedAccounts:", storedAccounts);
    }

    fetch("http://47.130.218.97:8002/instances")
      .then((res) => res.json())
      .then((res) => {
        const results = res.results || [];

        // ✅ Filter only matching accounts
        const matched = results.filter((item) =>
          storedAccounts.includes(item.account_id)
        );

        const uniqueAccounts = [
          ...new Set(matched.map((inst) => inst.account_id)),
        ];

        setAccounts(uniqueAccounts);
        setFilteredAccounts(matched);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching instances:", err);
        setLoading(false);
      });
  }, []);

  const handleReset = () => setSelectedAccount(null);

  // ✅ Filter by selected account dynamically
  const displayedData = selectedAccount
    ? filteredAccounts.filter((i) => i.account_id === selectedAccount)
    : filteredAccounts;

  return (
    <div style={{ margin: "16px 10px" }}>
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

      {/* ✅ Show table or "No Data Found" */}
      {loading ? (
        <p>Loading...</p>
      ) : displayedData.length > 0 ? (
        <AntdNestedTable selectedAccount={selectedAccount} data={displayedData} />
      ) : (
        <Empty description="No Data Found" style={{ marginTop: "100px" }} />
      )}
    </div>
  );
};


