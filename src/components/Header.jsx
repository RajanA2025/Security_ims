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
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { AccountCircleOutlined, Login, AccessTime } from "@mui/icons-material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";
import { Typography } from "antd";

const Header = ({ isExpanded, setIsExpanded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // ⬅️ get user from auth

  const [anchorEl, setAnchorEl] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  // Layout title based on path
  const path = location.pathname.toLowerCase();
  const layout = path.startsWith("/security")
    ? "Security"
    : path.startsWith("/perfops")
      ? "Performance & Operational Excellence"
      : path.startsWith("/imsproduct")
        ? "IMS Product"
        : path.startsWith("/admin")
          ? "Admin"
          : "Cost";

  // Last updated time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString("en-GB");
      const day = now.toLocaleDateString("en-US", { weekday: "long" });
      setLastUpdated(`Last updated: ${date}, ${day}, Time: 2:00 AM IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Role-based navigation
  const basePath = location.pathname.toLowerCase().split("/")[1];

  const handleProfileClick = () => {
    setAnchorEl(null);

    if (basePath === "admin") {
      navigate("/admin/profile");
    }
    else if (basePath === "imsproduct") {
      navigate("/imsproduct/profile");
    }
    else {
      navigate("/admin/profile"); // default
    }
  };


  return (
    <AppBar
      position="static"
      elevation={3}
      sx={{
        bgcolor: "white",
        color: "black",
        borderBottom: "1px solid #eaeaea",
        transition: "all 0.3s ease",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 1, md: 2 },
          py: { xs: 1, md: 1.2 },
          flexWrap: "wrap",
          rowGap: 1.5,
        }}
      >
        {/* LEFT BLOCK */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 200 }}>
          {isMobile && (
            <IconButton
              onClick={() => setIsExpanded((prev) => !prev)}
              sx={{ color: "#374151" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <img
            src={logo}
            alt="logo"
            style={{ height: isMobile ? 40 : 55, cursor: "pointer" }}
            onClick={() => navigate("/imsproduct")}
          />

          {/* Title */}
          <Box>
            <Typography.Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: isMobile ? 17 : 21,
                color: "#222",
              }}
            >
              {layout}
            </Typography.Title>
            {!isMobile && (
              <Typography.Text style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                Insight Management System
              </Typography.Text>
            )}
          </Box>
        </Box>

        {/* RIGHT BLOCK */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Tooltip title={isMobile ? lastUpdated : ""} arrow>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#f2f5fa",
                px: isMobile ? 1.2 : 2,
                py: 0.7,
                borderRadius: 2,
                border: "1px solid #e2e8f0",
              }}
            >
              <AccessTime sx={{ fontSize: 18, mr: isMobile ? 0 : 1, color: "#6b7280" }} />
              {!isMobile && (
                <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  {lastUpdated}
                </Typography.Text>
              )}
            </Box>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ color: "#374151" }}
          >
            <AccountCircleOutlined fontSize="medium" />
          </IconButton>
        </Box>

        {/* Profile Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={handleProfileClick}>
            <AccountCircleOutlined /> &nbsp; Profile
          </MenuItem>

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              logout();
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
