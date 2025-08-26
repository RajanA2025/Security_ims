// File: src/App.jsx
import React, { useState } from 'react';
import './stylecss/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './pages/Dashboard';
import Insights from './pages/iam_insights/insights';
import SecurityGroup from './pages/security_group/Securitygrp'
import CloudTrail from "./pages/Cloud_Trail/Cloud_Trail"
import SecurityTools from "./pages/SecurityTool/SecurityTools"
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
          <Route path="/cloud_trail" element={< CloudTrail filters={filters} />} />
          <Route path="/security_tools" element={< SecurityTools filters={filters} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
