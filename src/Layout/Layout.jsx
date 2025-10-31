import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../stylecss/App.css';

const Layout = ({ onDateChange, isExpanded, setIsExpanded }) => {
  return (
    <div className="app-container p-0">
      <Header onDateChange={onDateChange} />
      <div className="dashboard">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <main className="main-content py-0 px-5">
          <Outlet /> {/* ✅ Nested routes render here */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
