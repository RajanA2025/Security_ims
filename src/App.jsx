// File: src/App.jsx
import React, { useState } from 'react';
import './stylecss/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Security/iam_insights/insights';
import SecurityGroup from './pages/Security/security_group/Securitygrp'
import CloudTrail from "./pages/Security/Cloud_Trail/Cloud_Trail"
import SecurityTools from "./pages/Security/SecurityTool/SecurityTools"
import Business from "./pages/operational/Business/Business"
import Dashboard1 from "./pages/operational/Dashboard"
import Ami from "./pages/operational/Amis"
import Observability from './pages/operational/Observability/Observability';
import Monitoring from './pages/operational/Monitoring/Monitoring';
import RightSizing from './pages/operational/RightSizing/RightSizing';
import Dashboard2 from './pages/CostPages/Dashboard';
import { Costdeepdrive } from './pages/CostPages/Costdeepdrive';
import Imsproduct from './components/CostComponents/Imsproduct';
import { Savings } from './pages/CostPages/Savings';
import { Complaince } from './pages/CostPages/Complaince';
function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    context: 'By app',
  });

  const handleDateChange = ({ startDate, endDate, context }) => {
    // console.log('Date Range:', startDate, endDate, 'Context:', context);
    setFilters({ startDate, endDate, context });
  };

  return (
    <Router>
      <Layout
        onDateChange={handleDateChange}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      >
        <Routes>
          <Route path="/Security" element={<Dashboard filters={filters} />} />
          <Route path="/Security/iaminsights" element={<Insights filters={filters} />} />
          <Route path="/Security/group" element={<SecurityGroup filters={filters} />} />
          <Route path="/Security/cloudTrail" element={< CloudTrail filters={filters} />} />
          <Route path="/Security/tools" element={< SecurityTools filters={filters} />} />

          {/* operational */}
          <Route path="/Operational" element={<Dashboard1 filters={filters} />} />
          <Route path="/Operational/Snapshot" element={<Business filters={filters} />} />
          <Route path="/Operational/ami" element={<Ami filters={filters} />} />
          <Route path="/Operational/observability" element={<Observability filters={filters} />} />

          {/* performance */}
          <Route path="/Operational/monitoring" element={<Monitoring filters={filters} />} />
          <Route path="/Operational/rightsizing" element={<RightSizing filters={filters} />} /> Add this route

{/* //cost */}
<Route
          path="/Dashboard2"
          element={
            // <Layout
            //   onDateChange={handleDateChange}
            //   isExpanded={isExpanded}
            //   setIsExpanded={setIsExpanded}
            // >
              <Dashboard2 filters={filters} />
            // {/* </Layout> */}
          }
        />
        <Route
          path="/cost-deepdrive"
          element={
            // <Layout
            //   onDateChange={handleDateChange}
            //   isExpanded={isExpanded}
            //   setIsExpanded={setIsExpanded}
            // >
              <Costdeepdrive />
            // </Layout>
          }
        />
        <Route
          path="/Savings"
          element={
            // <Layout
            //   onDateChange={handleDateChange}
            //   isExpanded={isExpanded}
            //   setIsExpanded={setIsExpanded}
            // >
              <Savings />
            // </Layout>
          }
        />

        <Route
          path="/compliance"
          element={
            // <Layout
            //   onDateChange={handleDateChange}
            //   isExpanded={isExpanded}
            //   setIsExpanded={setIsExpanded}
            // >
              <Complaince />

            // </Layout>
          }
        />

        {/* Page outside Layout */}
        <Route path="/" element={<Imsproduct />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;