import React, { useState, useEffect } from "react";
import { Row, Space, Select, Checkbox, Button, DatePicker } from "antd";
import { DownOutlined } from "@ant-design/icons";
import CollapsibleTable from "../../components/CostComponents/CollapsibleTable";

const { RangePicker } = DatePicker;

export const Costdeepdrive = ({ allInstances }) => {
  const [context, setContext] = useState([]);
  const [dates, setDates] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [apps, setApps] = useState([]);

  // Compute unique accounts and apps dynamically
  useEffect(() => {
    if (allInstances?.length) {
      const uniqueAccounts = [...new Set(allInstances.map((inst) => inst.account_id))];
      const uniqueApps = [...new Set(allInstances.map((inst) => inst.instance_name))];
      setAccounts(uniqueAccounts);
      setApps(uniqueApps);
    }
  }, [allInstances]);

  const handleReset = () => {
    setContext([]);
    setDates([]);
  };

  return (
    <div style={{ margin: "16px" }}>
      {/* Filter Panel */}
      <Row justify="end" style={{ marginBottom: "1%" }}>
        <Space wrap>
          <Select
            mode="multiple"
            allowClear
            placeholder="Select filters"
            value={context}
            onChange={setContext}
            style={{ minWidth: 200 }}
            suffixIcon={<DownOutlined />}
            dropdownRender={(menu) => (
              <>
                {accounts.length > 0 && (
                  <div style={{ padding: "4px 8px", fontWeight: 500 }}>Accounts</div>
                )}
                {accounts.map((acc) => (
                  <Select.Option key={acc} value={acc}>
                    <Checkbox checked={context.includes(acc)}>{acc}</Checkbox>
                  </Select.Option>
                ))}

                {apps.length > 0 && (
                  <div style={{ padding: "4px 8px", fontWeight: 500 }}>Apps</div>
                )}
                {apps.map((app) => (
                  <Select.Option key={app} value={app}>
                    <Checkbox checked={context.includes(app)}>{app}</Checkbox>
                  </Select.Option>
                ))}

                {menu}
              </>
            )}
          />
          <Button onClick={handleReset}>Reset</Button>
        </Space>
      </Row>

      {/* Pass selected filters to table */}
      <CollapsibleTable selectedFilters={context} selectedDates={dates} allInstances={allInstances} />
    </div>
  );
};
  