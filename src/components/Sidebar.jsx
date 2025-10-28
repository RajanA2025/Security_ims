import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Badge,
  useTheme
} from "@mui/material";
import { Typography } from 'antd';
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineSecurity, MdDashboard, MdDangerous, MdInsights, MdCloudCircle, MdBusiness, MdAccessibility, MdCloudySnowing, MdMonitor, MdRampRight, MdMoney, MdMoneyOff, MdSavings, MdPublic } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { CloudCircle, Insights, ExpandLess, ExpandMore, InsightsOutlined, CloudCircleRounded } from "@mui/icons-material";
import { GoTools } from "react-icons/go";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";


const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null); // track which menu is open

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const isSecurity = location.pathname.toLowerCase().startsWith('/security');
  const Operational = location.pathname.toLowerCase().startsWith('/operational');
  const isAdmin = location.pathname.toLowerCase().startsWith('/admin');
  const layout = isSecurity ? "1" : Operational ? "2" : isAdmin ? "4" : "3";

  const navItems = [
    { icon: <MdDashboard size={30} />, label: "Dashboard", path: "/security" },
    { icon: <MdInsights size={30} />, label: "IAM Insights", badge: true, path: "/security/iaminsights" },
    {
      icon: <MdOutlineSecurity size={30} />,
      label: "Security Group",
      path: "/security/group",

    },
    { icon: <MdCloudCircle size={30} />, label: "Cloud Trail", path: "/security/cloudTrail" },
    { icon: <GoTools size={30} />, label: "Security Tools", path: "/security/tools" }
  ];
  const navItems1 = [
    { icon: <MdDashboard size={30} />, label: "Dashboard", path: "/operational" },
    {
      icon: <MdBusiness size={30} />, label: "Business", badge: true,


      subMenu: [
        { icon: <MdBusiness size={30} />, label: "Snapshot", path: "/operational/Snapshot" },
        { label: "AMI", path: "/Operational/ami" }
      ]
    },
    {
      icon: <MdAccessibility size={30} />,
      label: "Observability",
      path: "/operational/observability",

    },
    { icon: <MdCloudySnowing size={30} />, label: "Cloud Watch", path: "/operational/CloudWatch" },
    // { icon: <GoTools size={30}/>, label: "Security Tools", path: "/security_tools" }
    {
      icon: <MdMonitor size={30} />,
      label: "Monitoring",
      path: "/operational/monitoring",

    },
    { icon: <MdRampRight size={30} />, label: "RightSizing", path: "/operational/rightsizing" },
  ];

  const navItems2 = [
    { icon: <MdMoney size={30} />, label: "Cost Overview", path: "/cost  ", badge: false },
    { icon: <MdMoneyOff size={30} />, label: "Cost Deepdrive", path: "/cost/cost-deepdrive", badge: false },
    { icon: <MdSavings size={30} />, label: "Saving Opportunity", path: "/cost/Savings", badge: false },
    { icon: <MdPublic size={30} />, label: "Compliance", path: "/cost/compliance", badge: false },
    // { icon: CgPerformance, label: "Optimization", path: "/optimization", badge: false },
  ];

  const navItemsAdmin = [
    // { icon: <MdDashboard size={30} />, label: "Dashboard", path: "/" },
    { icon: <ManageAccountsIcon fontSize="large" />, label: "Manage Accounts", path: "/admin", badge: false },
  ];

  const handleNavClick = (item) => {
    if (item.subMenu) {
      // Navigate to main route first
      navigate(item.path);
      // Toggle submenu
      setOpenMenu((prev) => (prev === item.label ? null : item.label));
    } else {
      navigate(item.path);
      setOpenMenu(null); // close any open submenu
    }
  };
  const itemsToRender =
    layout === "1" ? navItems :
      layout === "2" ? navItems1 :
        layout === "4" ? navItemsAdmin :
          navItems2;
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
          "&:hover": {
            bgcolor: "#63B3ED"
          },
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
          // pt: 5,
          // pl: 2,
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
              <Tooltip
                title={!isExpanded ? item.label : ""}
                placement="right"
                arrow
              >
                <Box
                  onClick={() => handleNavClick(item)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isExpanded ? "space-between" : "center",
                    color: isActive || isParentActive ? "white" : "#5DAAE0",
                    cursor: "pointer",
                    borderRadius: "8px",
                    padding: "6px 8px",

                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#4f46e5",
                      color: "white"
                    }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {item.badge ? (
                      <Badge
                        variant="dot"
                        overlap="circular"
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right"
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                    {isExpanded && (
                      <Typography.Text style={{ color: "inherit", fontWeight: "500", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'", fontSize: "16px" }}>
                        {item.label}
                      </Typography.Text>
                    )}
                  </Box>
                  {item.subMenu && isExpanded && (
                    isOpen ? <ExpandLess /> : <ExpandMore />
                  )}
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
                          e.stopPropagation(); // prevent toggling parent menu
                          navigate(subItem.path);
                        }}
                        sx={{
                          color: isSubActive ? "white" : "#A7C7E7",
                          cursor: "pointer",
                          borderRadius: "6px",
                          padding: isExpanded ? "4px 8px" : "4px",
                          fontSize: 14,
                          "&:hover": {
                            backgroundColor: "#1565c0",
                            color: "white"
                          }
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
