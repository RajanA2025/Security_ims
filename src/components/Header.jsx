import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../assets/logo.png';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  MenuItem,
  Menu,
  useTheme,
} from '@mui/material';
import { AccountCircleOutlined, Login } from '@mui/icons-material';
import { Typography } from 'antd';

const Header = ({ onDateChange }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [context, setContext] = useState('Account');
  const [loaded, setLoaded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // detect section
  const path = location.pathname.toLowerCase();
  const isSecurity = path.startsWith('/security');
  const isOperational = path.startsWith('/operational');
  const isAdmin = path.startsWith('/admin');

  const layout = isSecurity
    ? "1"
    : isOperational
      ? "2"
      : isAdmin
        ? "4"
        : "3";

  // open & close menu
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (startDate && endDate && context) {
      onDateChange({ startDate, endDate, context });
    }
  }, [startDate, endDate, context]);

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        bgcolor: 'white',
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={logo}
            alt="logo"
            style={{ height: 70, marginRight: 25, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />
          <Typography.Title
            level={3}
            style={{
              fontFamily:
                "Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
              fontSize: "23px",
              fontWeight: 700,
              color: "black",
              margin: 0,
            }}
          >
            {layout === "1"
              ? "Security"
              : layout === "2"
                ? "Operational Excellence"
                : layout === "4"
                  ? "Admin"
                  : "Cost Management"}
          </Typography.Title>
        </Box>

        {/* User Menu */}
        <IconButton onClick={handleMenu}>
          <AccountCircleOutlined fontSize="medium" />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={() => { handleClose(); alert("Go to Profile"); }}>
            <AccountCircleOutlined /> &nbsp; Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              navigate("/login");
            }}
          >
            <Login /> &nbsp; Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
