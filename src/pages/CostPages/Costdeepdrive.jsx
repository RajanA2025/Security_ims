import React, { useState, useEffect } from "react";
import { Row, Space, Select, Button, Empty } from "antd";
import { DownOutlined } from "@ant-design/icons";
import AntdNestedTable from "../../components/CostComponents/AntdNestedTable";

export const Costdeepdrive = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
const jwt_token = localStorage.getItem("jwt_token");
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // ✅ Read accounts from localStorage
        let storedAccounts = localStorage.getItem("account_ids");

        try {
          storedAccounts = JSON.parse(storedAccounts);
        } catch {
          storedAccounts = [storedAccounts]; // wrap if single string
        }

        // Ensure array format
        if (!Array.isArray(storedAccounts)) {
          storedAccounts = [storedAccounts];
        }

        console.log("📌 POST account_ids:", storedAccounts);

        // --- POST BODY ---
        const body = {
          account_ids: storedAccounts,
        };

        // --- API CALL (POST) ---
        const response = await fetch(
          "http://47.130.218.97:8002/instances/filter",
          {
            method: "POST",
            headers: { "Content-Type": "application/json",
               Authorization: `Bearer ${jwt_token}`,
             },
            body: JSON.stringify(body),
          }
        );
// get jwt_token from localStorage

        const json = await response.json();
        console.log("📌 API Response:", json);

        const results = json.results || [];
console.log('resultssss', results)
        // Backend already filters → NO frontend filter needed
        setFilteredAccounts(results);

        // Extract unique account list for dropdown
        const uniqueAccounts = [
          ...new Set(results.map((inst) => inst.account_id)),
        ];

        setAccounts(uniqueAccounts);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching instances:", err);
        setLoading(false);
      }
    };

    fetchData();
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


