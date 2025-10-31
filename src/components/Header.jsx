import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  MenuItem,
  Menu,
  useTheme,
} from "@mui/material";
import { AccountCircleOutlined, Login } from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";
import { Typography } from "antd";

const Header = ({ onDateChange }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [context, setContext] = useState("Account");
  const [loaded, setLoaded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Detect section
  const path = location.pathname.toLowerCase();

  const isSecurity = path.startsWith("/security");
  const isOperational = path.startsWith("/operational");
  const isAdmin = path.startsWith("/admin");
  const isImsProduct = path.startsWith("/imsproduct");

  const layout = isSecurity
    ? "1"
    : isOperational
    ? "2"
    : isAdmin
    ? "4"
    : isImsProduct
    ? "3"
    : "";

  // Menu controls
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const { logout } = useAuth();

  useEffect(() => setLoaded(true), []);

  useEffect(() => {
    if (startDate && endDate && context) {
      onDateChange({ startDate, endDate, context });
    }
  }, [startDate, endDate, context, onDateChange]);

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
  };

  // ✅ Title logic (IMS Product included)
  const getHeaderTitle = () => {
    switch (layout) {
      case "1":
        return "Security";
      case "2":
        return "Operational Excellence";
      case "3":
        return "IMS Product";
      case "4":
        return "Admin";
      default:
        return "Cost Management";
    }
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        bgcolor: "white",
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            alt="logo"
            style={{ height: 70, marginRight: 25, cursor: "pointer" }}
            onClick={() => navigate("/Imsproduct")}
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
            {getHeaderTitle()}
          </Typography.Title>
        </Box>

        {/* User Menu */}
        <IconButton onClick={handleMenu}>
          <AccountCircleOutlined fontSize="medium" />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem
            onClick={() => {
              handleClose();
              alert("Go to Profile");
            }}
          >
            <AccountCircleOutlined /> &nbsp; Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              // call context logout which clears localStorage
              try {
                logout();
              } catch (e) {
                // ignore
              }
              // ensure redirect to login
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
