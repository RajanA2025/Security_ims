// src/components/Header.jsx
import React from 'react';
import { Layout, Typography, Button, Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import logo from '../assets/logo.png';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  return (
    <AntHeader
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '4px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Left: Logo & Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center', // 🔹 ensures vertical center alignment
          gap: 12,
        }}
      >
        <img src={logo} alt="logo" style={{ height: 70 }} />
        <Title
          level={3}
          style={{
            margin: 0,
            letterSpacing: 0.5,
            fontSize: 23,
            lineHeight: '42px', 
            marginLeft:'25px',
            fontWeight:700
          }}
        >
          IMS DashControl
        </Title>
      </div>

      {/* Right: Account Icon */}
      <Button
        type="text"
        style={{
          backgroundColor: '#f1f5f9',
          padding: 4,
          borderRadius: 4,
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
      >
        <Avatar size="medium" icon={<UserOutlined />} style={{ backgroundColor: 'transparent' }} />
      </Button>
    </AntHeader>
  );
};

export default Header;
