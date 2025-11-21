// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useContext, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  DatePicker,
  Button,
  Typography,
  Space,
  TreeSelect,
  Spin
} from "antd";
import { DownOutlined, ReloadOutlined } from "@ant-design/icons";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";

import BarChart from "../../components/CostComponents/barchart.jsx";
import Top5 from "../../components/CostComponents/Top5";
import DonutChart from "../../components/CostComponents/DonutChart";
import { Savingdashmain } from "../../components/CostComponents/Savingdashmain";
import { Complaincedashmain } from "../../components/CostComponents/Complaincedashmain.jsx";
import { CostContext } from "../../Context/CostContext.jsx";

import forecastImg from "../../assets/forecast.png";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { costData, loading, error, filters, setFilters, accounts } = useContext(CostContext);

  const [context, setContext] = useState([]);
  const [dates, setDates] = useState([]);
  const [currentMonthCost, setCurrentMonthCost] = useState(0);
  const [forecastAmount, setForecastAmount] = useState(0);
  const [change, setChange] = useState(null);
  const [top5Services, setTop5Services] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleReset();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate dashboard metrics
  useEffect(() => {
    if (!costData) return;

    const current = costData.monthly_summary?.current_month_cost || 0;
    const previous = costData.monthly_summary?.previous_month_cost || 0;
    const forecast = costData.monthly_summary?.forecast_amount || 0;

    setCurrentMonthCost(current);
    setForecastAmount(forecast);

    if (previous > 0) setChange(((current - previous) / previous) * 100);
    else setChange(null);

    setTop5Services(costData.top_5?.top_services_current_month || []);
  }, [costData]);

  /** ================== Handlers ================== */
  const handleContextChange = (val) => {
    setContext(val);
    localStorage.setItem("current_acc", val);
    setFilters((prev) => ({ ...prev, account_id: val || null }));
  };

  const handleDateChange = (val) => {
    setDates(val);
    if (val && val.length === 2) {
      setFilters((prev) => ({
        ...prev,
        start_date: val[0].format("YYYY-MM-DD"),
        end_date: val[1].format("YYYY-MM-DD"),
      }));
    } else {
      setFilters((prev) => ({ ...prev, start_date: null, end_date: null }));
    }
  };

  const handleReset = () => {
    setContext([]);
    setDates([]);
    setFilters({ account_id: null, app: null, start_date: null, end_date: null });
  };

  /** ================== TreeSelect Data ================== */
  const storedAccountIds = JSON.parse(localStorage.getItem("account_ids")) || [];
  const filteredAccounts = accounts.filter((acc) => storedAccountIds.includes(acc));

  const treeData = [
    {
      title: "Accounts",
      value: "accounts",
      selectable: false,
      children: filteredAccounts.map((acc) => ({
        title: acc,
        value: acc,
        selectable: true,
      })),
    },
  ];

  /** ================== Loading/Error ================== */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "100%",
        }}
      >
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: 50 }}>
        Error: {error}
      </p>
    );
  }

  /** ================== Render ================== */
  return (
    <div style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}>
      {/* Filters */}
<Row gutter={[8, 8]}>
  <Col xs={24}>
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end", // push content to right
      }}
    >
      <Card
        size="small"
        style={{ borderRadius: 12, background: "none" }}
        bodyStyle={{ padding: "8px 0px" }}
      >
        <Space size="middle" wrap>
          <TreeSelect
            treeData={treeData}
            value={context}
            onChange={handleContextChange}
            placeholder="Select filter"
            style={{ minWidth: 170, maxWidth: 250, width: "100%" }}
            suffixIcon={<DownOutlined />}
            allowClear
            dropdownStyle={{ padding: "12px 0" }}
            treeLine
            fieldNames={{ title: "title", value: "value", children: "children" }}
            treeNodeLabelProp="title"
            showArrow
            popupClassName="custom-tree-dropdown"
          />

          <RangePicker
            value={dates}
            onChange={handleDateChange}
            size="middle"
            style={{ width: "100%", maxWidth: 240 }}
          />

          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
        </Space>
      </Card>
    </div>
  </Col>
</Row>



      {/* Main Grid */}
      <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
        {/* Left Column */}
        <Col xs={24} md={12} lg={8}>
          <Row gutter={[16, 16]}>
            {/* Current Month Cost */}
            <Col xs={24} sm={12}>
              <Card
                bodyStyle={{
                  padding: 10,
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Text strong>Current Month Cost</Text>
                <Title level={4} style={{ margin: "15px 0", textAlign: "center" }}>
                  ${currentMonthCost?.toLocaleString()}
                </Title>

                {change !== null && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginTop: 8,
                      textAlign: "center",
                      overflow: "hidden",
                    }}
                  >
                    {change < 0 ? (
                      <LuTrendingDown style={{ fontSize: 20, color: "#16a34a" }} />
                    ) : (
                      <LuTrendingUp style={{ fontSize: 20, color: "#dc2626" }} />
                    )}

                    <Text
                      strong
                      style={{
                        color: change < 0 ? "#16a34a" : "#dc2626",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {Math.abs(change).toFixed(1)}%
                    </Text>

                    <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                      from last month.
                    </Text>
                  </div>
                )}
              </Card>
            </Col>

            {/* Forecast Cost */}
            <Col xs={24} sm={12}>
              <Card
                bodyStyle={{
                  padding: 10,
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Text strong>Forecast Cost</Text>
                <Title level={4} style={{ margin: "15px 0 0", textAlign: "center" }}>
                  ${forecastAmount?.toLocaleString()}
                </Title>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <img src={forecastImg} alt="forecast" width={55} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Top 5 */}
          <Row style={{ marginTop: 10 }}>
            <Col span={24}>
              <Top5 data={top5Services} />
            </Col>
          </Row>
        </Col>

        {/* Donut Chart */}
        <Col xs={24} md={12} lg={6} style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <DonutChart />
          </div>
        </Col>

        {/* Bar Chart */}
        <Col xs={24} lg={10}>
          <BarChart />
        </Col>
      </Row>

      {/* Savings */}
      <Row style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Savingdashmain />
        </Col>
      </Row>

      {/* Compliance */}
      <Row style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Complaincedashmain />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
