import { Col, Row ,Card, Space, Typography } from 'antd'
import React from 'react'
import DonutChart from '../../components/dashboard/donutchart'
import Chart from "../../components/dashboard/chart"
import Graph from "../../components/dashboard/graphchart"
function Dashboard() {
  return (
    <div>
        <Typography.Title 
  level={4}
  style={{
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    fontSize: "20px",
    fontWeight: 500,
    color: "black",
    margin: 0
  }}
>
Snapshot & AMI
</Typography.Title>
<hr/>
        <Row>
            <Col md={9}>
            <Card >
              <DonutChart/>
            </Card>
           
            </Col>
            <Col md={15}>
            <Card >
          
              <Chart/>
            </Card>
           
            </Col>
        </Row>

    </div>
  )
}

export default Dashboard