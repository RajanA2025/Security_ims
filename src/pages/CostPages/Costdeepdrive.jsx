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
    const fetchData = async () => {
      setLoading(true);

      try {
        // --- Robust parsing of account_ids from localStorage ---
        let raw = null;
        try {
          raw = localStorage.getItem("account_ids");
        } catch (err) {
          // localStorage unavailable (e.g. SSR, strict environments) -> fallback to empty
          // eslint-disable-next-line no-console
          console.warn("localStorage unavailable:", err);
          raw = null;
        }

        let storedAccounts = [];

        if (raw == null) {
          storedAccounts = [];
        } else {
          // Try JSON parse first (handles '["A","B"]' and '"A"')
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              storedAccounts = parsed;
            } else if (parsed === null || parsed === undefined) {
              storedAccounts = [];
            } else {
              // single value (number/string) parsed
              storedAccounts = [String(parsed)];
            }
          } catch {
            // Not valid JSON — handle CSV or single string
            const s = String(raw);
            if (s.includes(",")) {
              storedAccounts = s.split(",").map((x) => x.trim()).filter(Boolean);
            } else if (s.trim() === "") {
              storedAccounts = [];
            } else {
              storedAccounts = [s.trim()];
            }
          }
        }

        // Normalize and filter falsy values
        storedAccounts = Array.from(
          new Set(storedAccounts.map((id) => String(id ?? "").trim()).filter(Boolean))
        );

        // If no account ids available, short-circuit with empty UI
        if (storedAccounts.length === 0) {
          setFilteredAccounts([]);
          setAccounts([]);
          setLoading(false);
          return;
        }

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
const jwt_token = localStorage.getItem("jwt_token");
        const json = await response.json();
        console.log("📌 API Response:", json);

        const json = await response.json().catch(() => null);

        // Normalize results: prefer json.results array, else accept json array, else empty
        let results = [];
        if (json == null) {
          results = [];
        } else if (Array.isArray(json.results)) {
          results = json.results;
        } else if (Array.isArray(json)) {
          results = json;
        } else if (Array.isArray(json.data)) {
          results = json.data;
        } else {
          // try to safely coerce to an array if backend returned single object with items property
          results = [];
        }

        // Ensure results is an array of objects
        if (!Array.isArray(results)) results = [];

        // Backend already filters → use results directly
        setFilteredAccounts(results);

        // Extract unique account list for dropdown (filter out falsy ids)
        const uniqueAccounts = [
          ...new Set(results.map((inst) => String(inst.account_id ?? "").trim()).filter(Boolean)),
        ];

        setAccounts(uniqueAccounts);
      } catch (err) {
        // Clear data on error so UI shows empty state
        setFilteredAccounts([]);
        setAccounts([]);

        // Better error log for debugging
        // eslint-disable-next-line no-console
        console.error("Costdeepdrive: failed to fetch instances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReset = () => setSelectedAccount(null);

  // Filter by selected account dynamically
  const displayedData = selectedAccount
    ? filteredAccounts.filter((i) => String(i.account_id ?? "") === String(selectedAccount))
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

      {/* Show table or "No Data Found" */}
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

export default Costdeepdrive;
