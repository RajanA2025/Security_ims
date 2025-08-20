// File: src/layout/Layout.jsx
import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../stylecss/App.css'

const Layout = ({ children, onDateChange, isExpanded, setIsExpanded }) => {
  return (
    <div className="app-container">
      <Header onDateChange={onDateChange} />
      <div className="dashboard">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
