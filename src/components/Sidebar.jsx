import React, { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Badge,
  useTheme
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineSecurity, MdDashboard, MdDangerous, MdInsights, MdCloudCircle, MdBusiness, MdAccessibility, MdCloudySnowing } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { CloudCircle, Insights, ExpandLess, ExpandMore, InsightsOutlined, CloudCircleRounded } from "@mui/icons-material";
import { GoTools } from "react-icons/go";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null); // track which menu is open

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  var layout ="2"

  const navItems = [
    { icon: <MdDashboard size={30}/>, label: "Dashboard", path: "/Security" },
    { icon: <MdInsights size={30} />, label: "IAM Insights", badge: true, path: "/Security/iaminsights" },
    {
      icon: <MdOutlineSecurity size={30}/>,
      label: "Security Group",
      path: "/Security/group",
   
    },
    { icon: <MdCloudCircle size={30}/>, label: "Cloud Trail", path: "/Security/cloudTrail" },
    { icon: <GoTools size={30}/>, label: "Security Tools", path: "/Security/tools" }
  ];
  const navItems1 = [
    { icon: <MdDashboard size={30}/>, label: "Dashboard", path: "/Operational" },
    { icon: <MdBusiness size={30} />, label: "Business      ", badge: true ,
  
  
      subMenu: [
        { label: "Snapshot", path: "/Operational/Snapshot" },
        { label: "AMI", path: "/Operational/ami" }
      ]
  },
    {
      icon: <MdAccessibility size={30}/>,
      label: "Observability",
      path: "/Operational/observability",
      // subMenu: [
      //   { label: "Orthpanel", path: "/securitygroup/orthpanel" },
      //   { label: "SSH", path: "/securitygroup/ssh" }
      // ]
    },
    { icon: <MdCloudySnowing size={30}/>, label: "Cloud Watch", path: "/Operational/CloudWatch" },
    // { icon: <GoTools size={30}/>, label: "Security Tools", path: "/security_tools" }
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
  const itemsToRender = layout === "1" ? navItems : navItems1;
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
                      <Typography variant="body1" noWrap sx={{ color: "inherit",    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
                      }}>
                        {item.label}
                      </Typography>
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
                        {isExpanded ? subItem.label : "•"}
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
