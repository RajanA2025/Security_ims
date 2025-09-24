import React, { useState, useEffect } from "react";
import { Row, Space, Select, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import AntdNestedTable from "../../components/CostComponents/AntdNestedTable";

export const Costdeepdrive = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);

  // Fetch unique accounts
  useEffect(() => {
    fetch("http://13.212.15.14:8002/instances")
      .then((res) => res.json())
      .then((res) => {
        const uniqueAccounts = [...new Set(res.results.map((inst) => inst.account_id))];
        setAccounts(uniqueAccounts);
      })
      .catch((err) => console.error(err));
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

      {/* Table + Chart */}
      <AntdNestedTable selectedAccount={selectedAccount} />
    </div>
  );
};
