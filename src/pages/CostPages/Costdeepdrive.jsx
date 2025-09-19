import React, { useState } from "react";
import { Row, Space, Select, Checkbox, Button, DatePicker } from "antd";
import { DownOutlined } from "@ant-design/icons";
import CollapsibleTable from "../../components/CostComponents/Costdeepdrive";

const { RangePicker } = DatePicker;

export const Costdeepdrive = () => {
  const [context, setContext] = useState([]);
  const [dates, setDates] = useState([]);

  // Example data arrays for dropdowns
  const accounts = ["Account1", "Account2", "Account3"];
  const environments = ["Production", "Non-Production"];
  const apps = ["App1", "App2", "App3"];

  const handleReset = () => {
    setContext([]);
    setDates([]);
  };

  return (
    <div style={{ margin: "16px" }}>
      {/* Filter Panel */}
      <Row justify="end" style={{ margin: "0 0 1% 0" }}>
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
                  <div style={{ padding: "4px 8px", fontWeight: 500 }}>
                    Accounts
                  </div>
                )}
                {accounts.map((acc) => (
                  <Select.Option key={acc} value={acc}>
                    <Checkbox checked={context.includes(acc)}>{acc}</Checkbox>
                  </Select.Option>
                ))}

                {apps.length > 0 && (
                  <div style={{ padding: "4px 8px", fontWeight: 500 }}>
                    Apps
                  </div>
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

          <RangePicker
            value={dates}
            onChange={setDates}
            size="middle"
            style={{ width: "100%", maxWidth: 220 }}
          />

          <Button onClick={handleReset}>Reset</Button>
        </Space>
      </Row>

      {/* Collapsible Table */}
      <CollapsibleTable />
    </div>
  );
};
