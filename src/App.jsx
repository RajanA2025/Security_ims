// File: src/App.jsx
import React, { useState } from 'react';
import './stylecss/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';


// Security
import Dashboard from './pages/Dashboard';
import Insights from './pages/Security/iam_insights/insights';
import SecurityGroup from './pages/Security/security_group/Securitygrp';
import CloudTrail from './pages/Security/Cloud_Trail/Cloud_Trail';
import SecurityTools from './pages/Security/SecurityTool/SecurityTools';

// Operational
import Business from './pages/operational/Business/Business';
import Dashboard1 from './pages/operational/Dashboard';
import Ami from './pages/operational/Amis';
import Observability from './pages/operational/Observability/Observability';
import Monitoring from './pages/operational/Monitoring/Monitoring';
import RightSizing from './pages/operational/RightSizing/RightSizing';
import CloudWatch from './pages/operational/cloudWatch/cloudWatch'

// Cost
import Dashboard2 from './pages/CostPages/Dashboard';
import { Costdeepdrive } from './pages/CostPages/Costdeepdrive';
import Imsproduct from './components/CostComponents/Imsproduct';
import { Savings } from './pages/CostPages/Savings';
import { Complaince } from './pages/CostPages/Complaince';

// Landing
import LandingHome from './landing/pages/Home';
import Header from './landing/Components/Hearder';

function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    context: 'By app',
  });

  const handleDateChange = ({ startDate, endDate, context }) => {
    setFilters({ startDate, endDate, context });
  };

  return (
    <Router>
  <Routes>
    {/* Pages without Layout */}
    <Route path="/" element={<Imsproduct />} />
    <Route path="/landing" element={<LandingHome />} />
    <Route path="/header" element={<Header />} />

    {/* Pages with Layout */}
    <Route element={
      <Layout 
        onDateChange={handleDateChange}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
    }>
      {/* Security */}
      <Route path="/security" element={<Dashboard filters={filters} />} />
      <Route path="/security/iaminsights" element={<Insights filters={filters} />} />
      <Route path="/security/group" element={<SecurityGroup filters={filters} />} />
      <Route path="/security/cloudtrail" element={<CloudTrail filters={filters} />} />
      <Route path="/security/tools" element={<SecurityTools filters={filters} />} />

      {/* Operational */}
      <Route path="/operational" element={<Dashboard1 filters={filters} />} />
      <Route path="/operational/snapshot" element={<Business filters={filters} />} />
      <Route path="/operational/ami" element={<Ami filters={filters} />} />
      <Route path="/operational/observability" element={<Observability filters={filters} />} />
      <Route path="/operational/monitoring" element={<Monitoring filters={filters} />} />
      <Route path="/operational/rightsizing" element={<RightSizing filters={filters} />} />

      {/* Cost */}
      <Route path="/cost" element={<Dashboard2 />} />
      <Route path="/cost/cost-deepdrive" element={<Costdeepdrive />} />
      <Route path="/cost/savings" element={<Savings />} />
      <Route path="/cost/compliance" element={<Complaince />} />
    </Route>
  </Routes>
</Router>

  );
}

export default App;
