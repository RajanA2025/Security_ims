import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
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
  MdAccountCircle,
} from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { GoTools } from "react-icons/go";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openMenu, setOpenMenu] = useState(null);

  // Auto collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) setIsExpanded(false);
  }, [isMobile, setIsExpanded]);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  // Detect layout
  const path = location.pathname.toLowerCase();
  const layout = path.startsWith("/security")
    ? "1"
    : path.startsWith("/perfops")
      ? "2"
      : path.startsWith("/admin")
        ? "4"
        : path.startsWith("/imsproduct")
          ? "5"
          : "3";

  // Menu definitions
  const navItemsSecurity = [
    { icon: <MdDashboard size={30} />, label: "Dashboard", path: "/security" },
    {
      icon: <MdInsights size={30} />,
      label: "IAM Insights",
      badge: true,
      path: "/security/iaminsights",
    },
    { icon: <MdOutlineSecurity size={30} />, label: "Security Group", path: "/security/group" },
    { icon: <MdCloudCircle size={30} />, label: "Cloud Trail", path: "/security/cloudtrail" },
    { icon: <GoTools size={30} />, label: "Security Tools", path: "/security/tools" },
  ];

  const navItemsOps = [
    { icon: <MdDashboard size={30} />, label: "Dashboard", path: "/perfops" },
    {
      icon: <MdBusiness size={30} />,
      label: "Business",
      badge: true,
      subMenu: [
        { icon: <MdBusiness size={24} />, label: "Snapshot", path: "/perfops/snapshot" },
        { label: "AMI", path: "/perfops/ami" },
      ],
    },
    { icon: <MdAccessibility size={30} />, label: "Observability", path: "/perfops/observability" },
    { icon: <MdCloudySnowing size={30} />, label: "Cloud Watch", path: "/perfops/cloudwatch" },
    { icon: <MdMonitor size={30} />, label: "Monitoring", path: "/perfops/monitoring" },
    { icon: <MdRampRight size={30} />, label: "RightSizing", path: "/perfops/rightsizing" },
  ];

  const navItemsCost = [
    { icon: <MdMoney size={30} />, label: "Cost Overview", path: "/cost" },
    { icon: <MdMoneyOff size={30} />, label: "Cost Deep dive", path: "/cost/cost-deepdive" },
    { icon: <MdSavings size={30} />, label: "Saving Opportunity", path: "/cost/savings" },
    { icon: <MdPublic size={30} />, label: "Compliance", path: "/cost/compliance" },
  ];

  const navItemsAdmin = [
    { icon: <ManageAccountsIcon fontSize="large" />, label: "Manage Accounts", path: "/admin" },
  ];

  const navItemsProduct = [
    { icon: <MdDashboard size={30} />, label: "Dashboard", path: "/imsproduct" },
    { icon: <MdAccountCircle size={30} />, label: "Account", path: "/imsproduct/accountsmanage" },
  ];

  const handleNavClick = (item) => {
    if (item.subMenu) {
      setOpenMenu((prev) => (prev === item.label ? null : item.label));
    } else {
      navigate(item.path);
      setOpenMenu(null);
      if (isMobile) setIsExpanded(false); // close on mobile after click
    }
  };

  const itemsToRender =
    layout === "1"
      ? navItemsSecurity
      : layout === "2"
        ? navItemsOps
        : layout === "4"
          ? navItemsAdmin
          : layout === "5"
            ? navItemsProduct
            : navItemsCost;

  return (
    <Box
      sx={{
        width: isExpanded ? 200 : isMobile ? 0 : 90,
        bgcolor: isMobile ? "rgba(79, 70, 229, 0.9)" : "#4f46e5", // <-- opacity on mobile
        height: "100vh",
        position: isMobile ? "absolute" : "relative",
        transition: "all 0.3s ease",
        top: isMobile ? 56 : 0,   // <-- responsive top        left: 0,
        zIndex: 1200,
        pt: 2,
        overflowX: "hidden",
      }}
    >

      {/* Toggle button for desktop */}
      {!isMobile && (
        <IconButton
          onClick={toggleSidebar}
          sx={{
            position: "absolute",
            top: 10,
            right: -15,
            bgcolor: "#4f46e5",
            color: "white",
            "&:hover": { bgcolor: "#63B3ED" },
            zIndex: 10,
          }}
        >
          {isExpanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
        </IconButton>


      )}

      {/* Menu Items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: isExpanded ? 2 : 1 }}>
        {itemsToRender.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isParentActive = item.subMenu?.some((sub) => sub.path === location.pathname);
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
                    "&:hover": { backgroundColor: "#4338ca", color: "white" },
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
                      <Typography.Text style={{ color: "inherit", fontWeight: 500, fontSize: "16px" }}>
                        {item.label}
                      </Typography.Text>
                    )}
                  </Box>
                  {item.subMenu && isExpanded && (isOpen ? <ExpandLess /> : <ExpandMore />)}
                </Box>
              </Tooltip>

              {/* Submenu */}
              {item.subMenu && isOpen && (
                <Box sx={{ pl: isExpanded ? 7 : 2, display: "flex", flexDirection: "column", gap: 1 }}>
                  {item.subMenu.map((subItem, subIndex) => {
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <Box
                        key={subIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(subItem.path);
                          if (isMobile) setIsExpanded(false);
                        }}
                        sx={{
                          color: isSubActive ? "white" : "#C8D9F0",
                          cursor: "pointer",
                          borderRadius: "6px",
                          padding: isExpanded ? "4px 8px" : "4px",
                          fontSize: 14,
                          "&:hover": { backgroundColor: "#5b21b6", color: "white" },
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


