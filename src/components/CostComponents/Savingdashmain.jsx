import React, { useContext, useMemo } from "react";
import { Row, Col, Card, Typography, Spin } from "antd";
import LogAxisChart from "./LogAxisChart";
import Savingimg from "../../assets/Savingimg.png";
import realsaveimg from "../../assets/realsaveimg.png";
import piechartimg from "../../assets/piechartimg.png";
import { CostContext } from "../../Context/CostContext";
import SavingsTrendGraph from "./SavingsTrendGraph";

const { Title, Text } = Typography;

export const Savingdashmain = () => {
  const { resourcesData, loading, error } = useContext(CostContext);

  // ✅ Get stored account IDs from localStorage
  const storedIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("account_ids")) || [];
    } catch {
      return [];
    }
  }, []);

  // ✅ Compute summary values only for filtered IDs
  const {
    totalPotentialSavings,
    realizedAmount,
    totalOpportunities,
    unassignedCost,
  } = useMemo(() => {
    if (!resourcesData) {
      return {
        totalPotentialSavings: null,
        realizedAmount: null,
        totalOpportunities: null,
        unassignedCost: null,
      };
    }

    // ✅ Combine all resource arrays
    let allResources = [
      ...resourcesData.underutilized_ec2,
      ...resourcesData.underutilized_ebs,
      ...resourcesData.orphaned_volumes,
      ...resourcesData.orphaned_eips,
      ...resourcesData.orphaned_snapshots,
    ];

    // ✅ Filter by account IDs if present
    if (storedIds.length > 0) {
      allResources = allResources.filter((item) =>
        storedIds.includes(item.account_id)
      );
    }

    // ✅ Total potential savings
    const totalPotentialSavings = allResources.reduce(
      (sum, item) => sum + (item.cost_savings ?? item.cost ?? 0),
      0
    );

    // ✅ Total savings opportunities
    const totalOpportunities =
      allResources.filter((item) => item.type === "underutilized").length ||
      allResources.length;

    // ✅ Assigned vs unassigned
    let assigned = 0,
      unassigned = 0;
    allResources.forEach((item) => {
      const cost = item.cost_savings ?? item.cost ?? 0;
      const status = (item.status || "unassigned").toLowerCase();

      if (status === "assigned") assigned += cost;
      else unassigned += cost;
    });



    return {
      totalPotentialSavings,
      realizedAmount: 0, // placeholder
      totalOpportunities,
      unassignedCost: { total: assigned + unassigned, assigned, unassigned },
    };
  }, [resourcesData, storedIds]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          width: "100%",
        }}
      >
        <Spin size="large" tip="Loading savings data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 50, color: "red" }}>
        Error: {error}
      </div>
    );
  }

  const cardStyle = (bgGradient) => ({
    boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
    padding: "10px 10px",
    fontWeight: 500,
    minHeight: "26vh",
    background: bgGradient,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  });

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };
  const valueTitleStyle = { margin: 0, textAlign: "center" };

  return (
    <div style={{ padding: "20px 10px" }}>
      <Row gutter={[16, 16]}>
        {/* Potential Savings */}
        <Col xs={24} sm={12} md={5}>
          <Card
            bodyStyle={cardStyle("white")}
            style={{ borderTop: "4px solid #52c41a" }}
          >
            <div style={headerStyle}>
              <Text strong>Potential Savings</Text>
              <img src={Savingimg} alt="savings" width={40} height={40} />
            </div>
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <Title level={4} style={valueTitleStyle}>
                <Text type="secondary" style={{ display: "block", fontSize: 14 }}>
                  Potential Savings Opportunity
                </Text>
                {totalPotentialSavings !== null
                  ? `$${totalPotentialSavings.toLocaleString()}`
                  : "Loading..."}
              </Title>
            </div>
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <Title level={4} style={valueTitleStyle}>
                <Text type="secondary" style={{ display: "block", fontSize: 14 }}>
                  No. of Savings Opportunities
                </Text>
                {totalOpportunities !== null
                  ? totalOpportunities
                  : "Loading..."}
              </Title>
            </div>
          </Card>
        </Col>

        {/* Realized Savings */}
        <Col xs={24} sm={12} md={5}>
          <Card
            bodyStyle={cardStyle("white")}
            style={{ borderTop: "4px solid #1890ff" }}
          >
            <div style={headerStyle}>
              <Text strong>Realized Savings</Text>
              <img src={realsaveimg} alt="savings" width={40} height={40} />
            </div>
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <Title level={4} style={{ ...valueTitleStyle, marginBottom: "6px" }}>
                {realizedAmount !== null
                  ? `$${realizedAmount.toLocaleString()}`
                  : "Loading..."}
              </Title>
              <Text type="secondary" style={{ fontSize: 14, display: "block" }}>
                (Annualized Savings)
              </Text>
            </div>
          </Card>
        </Col>

        {/* Implementation Status */}
        <Col xs={24} sm={12} md={5}>
          <Card
            bodyStyle={cardStyle("white")}
            style={{ borderTop: "4px solid #fa8c16" }}
          >
            <div style={headerStyle}>
              <Text strong style={{ fontSize: 14 }}>
                Implementation Status
              </Text>
              <img src={piechartimg} alt="savings" width={40} height={40} />
            </div>
            <div
              style={{
                marginTop: "7px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 14, flex: 1, textAlign: "right" }}
                >
                  Total Costs
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: 20,
                    flex: 1,
                    textAlign: "left",
                    paddingLeft: "10px",
                    color: "#1677ff",
                  }}
                >
                  {unassignedCost !== null
                    ? `$${unassignedCost.total.toLocaleString()}`
                    : "Loading..."}
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 14, flex: 1, textAlign: "right" }}
                >
                  Assigned
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: 20,
                    flex: 1,
                    textAlign: "left",
                    paddingLeft: "10px",
                    color: "green",
                  }}
                >
                  {unassignedCost !== null
                    ? `$${unassignedCost.assigned.toLocaleString()}`
                    : "Loading..."}
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 14, flex: 1, textAlign: "right" }}
                >
                  Unassigned
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: 20,
                    flex: 1,
                    textAlign: "left",
                    paddingLeft: "10px",
                    color: "red",
                  }}
                >
                  {unassignedCost !== null
                    ? `$${unassignedCost.unassigned.toLocaleString()}`
                    : "Loading..."}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Chart */}
        <Col xs={24} sm={24} md={9}>
          <LogAxisChart />
          {/* <SavingsTrendGraph/> */}
        </Col>
      </Row>
    </div>
  );
};
