import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../stylecss/App.css";

const Layout = ({ onDateChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="app-container p-0">
      <Header isExpanded={isExpanded} setIsExpanded={setIsExpanded} onDateChange={onDateChange} />
      <div className="dashboard">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <main className="main-content py-0 px-5">
          <Outlet /> {/* Nested routes */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
