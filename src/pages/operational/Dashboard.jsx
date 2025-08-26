import { Col, Row } from 'antd'
import React from 'react'
import DonutChart from '../../components/dashboard/donutchart'

function Dashboard() {
  return (
    <div>
        <Row>
            <Col md={12}>
            <DonutChart/>
            </Col>
        </Row>

    </div>
  )
}

export default Dashboard