// File: src/App.jsx
import React, { useState } from 'react';
import './stylecss/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './pages/Dashboard';
import Insights from './pages/iam_insights/insights';
import SecurityGroup from './pages/security_group/Securitygrp'
import CloudTrail from "./pages/Cloud_Trail/Cloud_Trail"
import Orphaned from './pages/security_group/orphaned';
import Ssh from "./pages/security_group/Ssh"
function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    context: 'By app',
  });

  const handleDateChange = ({ startDate, endDate, context }) => {
    console.log('Date Range:', startDate, endDate, 'Context:', context);
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
          <Route path="/" element={<Dashboard filters={filters} />} />
          <Route path="/iam_insights" element={<Insights filters={filters} />} />
          <Route path="/securitygroup" element={<SecurityGroup filters={filters} />} />
          <Route path="/cloud_trial" element={< CloudTrail filters={filters} />} />

          {/* <Route path="/securitygroup/orthpanel" element={<Orphaned filters={filters} />} />
          <Route path="/securitygroup/ssh" element={<Ssh filters={filters} />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
