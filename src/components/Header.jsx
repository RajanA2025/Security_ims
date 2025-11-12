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
  Tooltip,
  Divider,
} from "@mui/material";
import {
  AccountCircleOutlined,
  Login,
  AccessTime,
} from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";
import { Typography } from "antd";

const Header = ({ onDateChange }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  // Path detection
  const path = location.pathname.toLowerCase();
  const layout = path.startsWith("/security")
    ? "Security"
    : path.startsWith("/operational")
    ? "Operational Excellence"
    : path.startsWith("/imsproduct")
    ? "IMS Product"
    : path.startsWith("/admin")
    ? "Admin"
    : "Cost";

  // Menu handlers
  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Dynamic last updated text
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const date = now.toLocaleDateString("en-GB");
      const day = days[now.getDay()];
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setLastUpdated(`Last updated: ${date}, ${day}, Time: 2:00 PM`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppBar
      position="static"
      elevation={3}
      sx={{
        bgcolor: "white",
        color: "black",
        borderBottom: "1px solid #eaeaea",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, sm: 2, md: 2 },
          py: 1,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* LEFT SIDE */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img
            src={logo}
            alt="logo"
            style={{
              height: 55,
              cursor: "pointer",
            }}
            onClick={() => navigate("/imsproduct")}
          />
          <Box>
            <Typography.Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: "21px",
                letterSpacing: "0.2px",
                color: "#222",
              }}
            >
              {layout}
            </Typography.Title>
            <Typography.Text
              style={{
                fontSize: 13,
                color: "#777",
                fontWeight: 500,
              }}
            >
              Insight Management System
            </Typography.Text>
          </Box>
        </Box>

        {/* RIGHT SIDE */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            flexWrap: "wrap",
          }}
        >
          {/* Last Updated */}
          <Tooltip>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#f2f5fa",
                px: 2,
                py: 0.6,
                borderRadius: 2,
                border: "1px solid #e2e8f0",
              }}
            >
              <AccessTime sx={{ fontSize: 18, mr: 1, color: "#6b7280" }} />
              <Typography.Text
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                {lastUpdated}
              </Typography.Text>
            </Box>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            // sx={{ bgcolor: "#ddd", height: 24 }}
          />

          {/* Profile Menu */}
          <IconButton
            onClick={handleMenu}
            sx={{
              color: "#374151",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            <AccountCircleOutlined fontSize="medium" />
          </IconButton>
        </Box>

        {/* Dropdown Menu */}
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
              try {
                logout();
              } catch (e) {}
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
