import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Badge,
  useTheme
} from "@mui/material";
import { Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdOutlineSecurity,
  MdDashboard,
  MdInsights,
  MdCloudCircle,
  MdBusiness,
  MdAccessibility,
  MdCloudySnowing,
  MdMonitor,
  MdRampRight,
  MdMoney,
  MdMoneyOff,
  MdSavings,
  MdPublic,
  MdProductionQuantityLimits,
  MdAccountCircle
} from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { GoTools } from "react-icons/go";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  // ✅ Path detection
  const isSecurity = location.pathname.toLowerCase().startsWith("/security");
  const isOperational = location.pathname.toLowerCase().startsWith("/operational");
  const isAdmin = location.pathname.toLowerCase().startsWith("/admin");
  const isProduct = location.pathname.toLowerCase().startsWith("/imsproduct");

  const layout = isSecurity
    ? "1"
    : isOperational
    ? "2"
    : isAdmin
    ? "4"
    : isProduct
    ? "5"
    : "3";

  // ✅ Sidebar menu groups
  const navItems = [
    { icon: <MdDashboard size={30} />, label: "Dashboard", path: "/security" },
    { icon: <MdInsights size={30} />, label: "IAM Insights", badge: true, path: "/security/iaminsights" },
    { icon: <MdOutlineSecurity size={30} />, label: "Security Group", path: "/security/group" },
    { icon: <MdCloudCircle size={30} />, label: "Cloud Trail", path: "/security/cloudtrail" },
    { icon: <GoTools size={30} />, label: "Security Tools", path: "/security/tools" }
  ];

  const navItems1 = [
    { icon: <MdDashboard size={30} />, label: "Dashboard", path: "/operational" },
    {
      icon: <MdBusiness size={30} />,
      label: "Business",
      badge: true,
      subMenu: [
        { icon: <MdBusiness size={24} />, label: "Snapshot", path: "/operational/snapshot" },
        { label: "AMI", path: "/operational/ami" }
      ]
    },
    { icon: <MdAccessibility size={30} />, label: "Observability", path: "/operational/observability" },
    { icon: <MdCloudySnowing size={30} />, label: "Cloud Watch", path: "/operational/cloudwatch" },
    { icon: <MdMonitor size={30} />, label: "Monitoring", path: "/operational/monitoring" },
    { icon: <MdRampRight size={30} />, label: "RightSizing", path: "/operational/rightsizing" }
  ];

  const navItems2 = [
    { icon: <MdMoney size={30} />, label: "Cost Overview", path: "/cost", badge: false },
    { icon: <MdMoneyOff size={30} />, label: "Cost Deepdrive", path: "/cost/cost-deepdrive", badge: false },
    { icon: <MdSavings size={30} />, label: "Saving Opportunity", path: "/cost/savings", badge: false },
    { icon: <MdPublic size={30} />, label: "Compliance", path: "/cost/compliance", badge: false }
  ];

  const navItemsAdmin = [
    { icon: <ManageAccountsIcon fontSize="large" />, label: "Manage Accounts", path: "/admin", badge: false }
  ];

  const navItemsProduct = [
    { icon: <MdDashboard size={30} />, label: "IMS Dashboard", path: "/imsproduct" },
    // { icon: <MdProductionQuantityLimits size={30} />, label: "Products", path: "/imsproduct/products" },
    { icon: <MdAccountCircle size={30} />, label: "Account Manage", path: "/imsproduct/accountsmanage" }
  ];

  // ✅ Handle navigation and submenu toggle
  const handleNavClick = (item) => {
    if (item.subMenu) {
      setOpenMenu((prev) => (prev === item.label ? null : item.label));
    } else {
      navigate(item.path);
      setOpenMenu(null);
    }
  };

  // ✅ Choose menu based on layout
  const itemsToRender =
    layout === "1"
      ? navItems
      : layout === "2"
      ? navItems1
      : layout === "4"
      ? navItemsAdmin
      : layout === "5"
      ? navItemsProduct
      : navItems2;

  return (
    <Box
      sx={{
        width: isExpanded ? 200 : 90,
        bgcolor: "#4f46e5",
        height: "100vh",
        borderRight: `1px solid ${theme.palette.divider}`,
        position: "relative",
        transition: "width 0.3s ease",
        pt: 2
      }}
    >
      {/* Toggle button */}
      <IconButton
        onClick={toggleSidebar}
        sx={{
          position: "absolute",
          top: 10,
          right: -15,
          bgcolor: "#4f46e5",
          color: "white",
          "&:hover": { bgcolor: "#63B3ED" },
          zIndex: 10
        }}
      >
        {isExpanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
      </IconButton>

      {/* Menu Items */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          px: isExpanded ? 2 : 1,
          fontSize: 30
        }}
      >
        {itemsToRender.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isParentActive = item.subMenu?.some(
            (sub) => sub.path === location.pathname
          );
          const isOpen = openMenu === item.label;

          return (
            <React.Fragment key={index}>
              <Tooltip title={!isExpanded ? item.label : ""} placement="right" arrow>
                <Box
                  onClick={() => handleNavClick(item)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isExpanded ? "space-between" : "center",
                    color: isActive || isParentActive ? "white" : "#A7C7E7",
                    cursor: "pointer",
                    borderRadius: "8px",
                    padding: "6px 8px",
                    transition: "background-color 0.2s ease",
                    "&:hover": { backgroundColor: "#4338ca", color: "white" }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {item.badge ? (
                      <Badge
                        variant="dot"
                        overlap="circular"
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                    {isExpanded && (
                      <Typography.Text
                        style={{
                          color: "inherit",
                          fontWeight: "500",
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                          fontSize: "16px"
                        }}
                      >
                        {item.label}
                      </Typography.Text>
                    )}
                  </Box>
                  {item.subMenu && isExpanded && (isOpen ? <ExpandLess /> : <ExpandMore />)}
                </Box>
              </Tooltip>

              {/* Submenu */}
              {item.subMenu && isOpen && (
                <Box
                  sx={{
                    pl: isExpanded ? 7 : 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                  }}
                >
                  {item.subMenu.map((subItem, subIndex) => {
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <Box
                        key={subIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(subItem.path);
                        }}
                        sx={{
                          color: isSubActive ? "white" : "#C8D9F0",
                          cursor: "pointer",
                          borderRadius: "6px",
                          padding: isExpanded ? "4px 8px" : "4px",
                          fontSize: 14,
                          "&:hover": { backgroundColor: "#5b21b6", color: "white" }
                        }}
                      >
                        {isExpanded ? subItem.label : <MdOutlineSecurity />}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

export default Sidebar;
