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
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import BarChart from "../components/barchart";
import Top5 from "../components/Top5";
import DonutChart from "../components/DonutChart";
import forecastImg from "../assets/forecast.png";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { Savingdashmain } from "../components/Savingdashmain";
import { CostContext } from "../Context/CostContext.jsx";  // ⬅️ import context
import { Complaincedashmain } from "../components/Complaincedashmain.jsx";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { costData, loading, error } = useContext(CostContext); // ⬅️ use context

  const [context, setContext] = useState([]);
  const [dates, setDates] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [apps, setApps] = useState([]);
  const [currentMonthCost, setCurrentMonthCost] = useState(null);
  const [previousMonthCost, setPreviousMonthCost] = useState(null);
  const [forecastAmount, setForecastAmount] = useState(null);
  const [top5Services, setTop5Services] = useState([]);
  const [change, setChange] = useState(null);

  // derive data from context (instead of fetching directly)
  useEffect(() => {
    if (!costData) return;

    const current = costData.monthly_summary?.current_month_cost || 0;
    const previous = costData.monthly_summary?.previous_month_cost || 0;
    setCurrentMonthCost(current);
    setPreviousMonthCost(previous);
    setForecastAmount(costData.monthly_summary?.forecast_amount || 0);

    if (previous > 0) {
      const diff = ((current - previous) / previous) * 100;
      setChange(diff.toFixed(1));
    }

    setAccounts([costData.account_id].filter(Boolean));
    setApps(
      costData.top_5?.top_apps_current_month
        ?.map((a) => a.app_name)
        .filter(Boolean) || []
    );
    setTop5Services(costData.top_5?.top_services_current_month || []);
  }, [costData]);

  const handleReset = () => {
    setContext([]);
    setDates([]);
  };

  const treeData = [
    {
      title: "Accounts",
      value: "accounts",
      children: accounts.map((acc) => ({
        title: acc,
        value: acc,
      })),
    },
    {
      title: "Apps",
      value: "apps",
      children: apps.map((app) => ({
        title: app,
        value: app,
      })),
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "0 10px" }}>
      {/* Filter Row */}
      <Row justify="end" style={{ margin: "0 0 1% 0" }}>
        <Space wrap>
          <TreeSelect
            treeData={treeData}
            value={context}
            onChange={setContext}
            treeCheckable={true}
            showCheckedStrategy={TreeSelect.SHOW_PARENT}
            placeholder="Select filters"
            style={{ minWidth: 100 }}
            suffixIcon={<DownOutlined />}
          />

          <RangePicker
            value={dates}
            onChange={setDates}
            size="middle"
            style={{ width: "100%", maxWidth: 200 }}
          />

          <Button onClick={handleReset}>Reset</Button>
        </Space>
      </Row>

      {/* Cost Grid */}
      <Row gutter={[16, 16]}>
        {/* Left Section */}
        <Col xs={24} sm={24} md={12} lg={8}>
          <Row gutter={[16, 16]}>
            {/* Current Month Cost Card */}
            <Col xs={24} sm={12} md={12} lg={12}>
              <Card
                bodyStyle={{
                  padding: 10,
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  background: "#fff",
                  fontWeight: 500,
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start", // push content to top
                }}
              >
                <Text
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  Current Month Cost
                </Text>

                <Title
                  level={4}
                  style={{
                    margin: "15px 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    textAlign: 'center'
                  }}
                >
                  {`$${currentMonthCost?.toLocaleString()}`}
                </Title>

                {change !== null && (
                  <Space
                    style={{
                      marginTop: 8,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {change < 0 ? (
                      <LuTrendingDown style={{ fontSize: 20, color: "#dc2626" }} />
                    ) : (
                      <LuTrendingUp style={{ fontSize: 20, color: "#16a34a" }} />
                    )}
                    <Text strong type={change < 0 ? "danger" : "success"}>
                      {Math.abs(change)}%
                    </Text>
                    <Text
                      type="secondary"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      vs Previous Month
                    </Text>
                  </Space>
                )}
              </Card>
            </Col>


            {/* Forecast Cost Card */}
            <Col xs={24} sm={12} md={12} lg={12}>
              <Card
                bodyStyle={{
                  padding: 10,
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  background: "#fff",
                  fontWeight: 500,
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start", // push content to top
                }}
              >
                <Text
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  Forecast Cost
                </Text>

                <Title
                  level={4}
                  style={{
                    margin: "15px 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    textAlign: 'center'
                  }}
                >
                  {`$${forecastAmount?.toLocaleString()}`}
                </Title>

                <div style={{ textAlign: "center" }}>
                  <img
                    src={forecastImg}
                    alt="forecast"
                    width={30}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Top 5 Section */}
          <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
            <Col xs={24}>
              <Top5 data={top5Services} />
            </Col>
          </Row>
        </Col>



        {/* Donut Chart */}
        <Col xs={24} sm={24} md={12} lg={6}>
          <DonutChart />
        </Col>

        {/* Bar Chart */}
        <Col xs={24} sm={24} md={24} lg={10}>
          <BarChart />
        </Col>
      </Row>

      {/* Savings Section */}
      <Row style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Savingdashmain />
        </Col>
      </Row>

      {/* Complaince Section */}
      <Row style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Complaincedashmain />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
