import React, { useContext, useMemo } from "react";
import { Row, Col, Card, Typography } from "antd";
import LogAxisChart from "./LogAxisChart";
import Savingimg from "../assets/Savingimg.png";
import realsaveimg from "../assets/realsaveimg.png";
import piechartimg from "../assets/piechartimg.png";
import { CostContext } from "../Context/CostContext.jsx";  // ⬅️ import context

const { Title, Text } = Typography;

export const Savingdashmain = () => {
  const { resourcesData, loading, error } = useContext(CostContext);

  // Compute values only when resourcesData changes
  const { PotentialSavingscost, realizedAmount, savingsOpportunities, unassignedCost } = useMemo(() => {
    if (!resourcesData) return { PotentialSavingscost: null, realizedAmount: null, savingsOpportunities: null, unassignedCost: null };

    const allResources = [
      ...resourcesData.underutilized_ec2,
      ...resourcesData.underutilized_ebs,
      ...resourcesData.orphaned_volumes,
      ...resourcesData.orphaned_eips,
      ...resourcesData.orphaned_snapshots,
    ];

    const totalPotential = allResources.reduce((sum, item) => sum + (item.cost_savings || 0), 0);
    const totalOpportunities = resourcesData.underutilized_ec2.length + resourcesData.underutilized_ebs.length;

    let assigned = 0, unassigned = 0;
    allResources.forEach(item => {
      const cost = item.cost || item.cost_savings || 0;
      if (item.status && item.status.toLowerCase() === "unassigned") unassigned += cost;
      else assigned += cost;
    });

    return {
      PotentialSavingscost: totalPotential,
      realizedAmount: totalPotential * 0,
      savingsOpportunities: totalOpportunities,
      unassignedCost: { total: assigned + unassigned, assigned, unassigned },
    };
  }, [resourcesData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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

  const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center" };
  const valueTitleStyle = { margin: 0, textAlign: "center" };

  return (
    <div style={{ padding: "16px 0px 16px" }}>
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
                {PotentialSavingscost !== null ? `$${PotentialSavingscost.toLocaleString()}` : "Loading..."}
              </Title>
            </div>
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <Title level={4} style={valueTitleStyle}>
                <Text type="secondary" style={{ display: "block", fontSize: 14 }}>
                  No. of Savings Opportunities
                </Text>
                {savingsOpportunities !== null ? savingsOpportunities : "Loading..."}
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
                {realizedAmount !== null ? `*$${realizedAmount.toLocaleString()}` : "Loading..."}
              </Title>
              <Text type="secondary" style={{ fontSize: 14, display: "block" }}>
                (Annualized Savings*)
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text strong style={{ fontSize: 14 }}>Implementation Status</Text>
              <img src={piechartimg} alt="savings" width={40} height={40} />
            </div>
            <div style={{ marginTop: "7px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text type="secondary" style={{ fontSize: 14, flex: 1, textAlign: "right" }}>Total Costs</Text>
                <Text strong style={{ fontSize: 20, flex: 1, textAlign: "left", paddingLeft: "10px", color: "#1677ff" }}>
                  {unassignedCost !== null ? `$${unassignedCost.total.toLocaleString()}` : "Loading..."}
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text type="secondary" style={{ fontSize: 14, flex: 1, textAlign: "right" }}>Assigned</Text>
                <Text strong style={{ fontSize: 20, flex: 1, textAlign: "left", paddingLeft: "10px", color: "green" }}>
                  {unassignedCost !== null ? `$${unassignedCost.assigned.toLocaleString()}` : "Loading..."}
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text type="secondary" style={{ fontSize: 14, flex: 1, textAlign: "right" }}>Unassigned</Text>
                <Text strong style={{ fontSize: 20, flex: 1, textAlign: "left", paddingLeft: "10px", color: "red" }}>
                  {unassignedCost !== null ? `$${unassignedCost.unassigned.toLocaleString()}` : "Loading..."}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Chart */}
        <Col xs={24} sm={24} md={9} >
          <LogAxisChart />
        </Col>
      </Row>
    </div>
  );
};
