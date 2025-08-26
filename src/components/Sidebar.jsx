// // src/components/Sidebar.jsx
// import React from 'react';
// import {
//   Box,
//   IconButton,
//   Typography,
//   Tooltip,
//   Badge,
//   useTheme
// } from '@mui/material';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { MdOutlineSecurity, MdDashboard } from 'react-icons/md';
// import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
// import { CloudCircle, Insights } from '@mui/icons-material';
// import { GoTools } from 'react-icons/go';

// const Sidebar = ({ isExpanded, setIsExpanded }) => {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation(); // ✅ Get current route

//   const toggleSidebar = () => setIsExpanded(prev => !prev);

//   const navItems = [
//     { icon: <MdDashboard />, label: 'Dashboard', path: '/' },
//     { icon: <Insights />, label: 'IAM_Insights', badge: true, path: '/iam_insights' },
//     { icon: <MdOutlineSecurity />, label: 'Security Group', path: '/securitygroup' },
//     { icon: <CloudCircle />, label: 'Cloud Trial', path: '/cloud_trial' },
//     { icon: <GoTools />, label: 'Security Tools', path: '/security_tools' },
//   ];

//   return (
//     <Box
//       sx={{
//         width: isExpanded ? 200 : 90,
//         bgcolor: '#4f46e5',
//         height: '100vh',
//         borderRight: `1px solid ${theme.palette.divider}`,
//         position: 'relative',
//         transition: 'width 0.3s ease',
//         pt: 2,
//       }}
//     >
//       {/* Toggle button */}
//       <IconButton
//         onClick={toggleSidebar}
//         sx={{
//           position: 'absolute',
//           top: 10,
//           right: -15,
//           bgcolor: '#4f46e5',
//           color: 'white',
//           '&:hover': {
//             bgcolor: '#63B3ED',
//           },
//           zIndex: 10
//         }}
//       >
//         {isExpanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
//       </IconButton>

//       {/* Menu Items */}
//       <Box sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         gap: 3,
//         px: isExpanded ? 3 : 2,
//         pt: 5,
//         pl: 3,
//         fontSize: 30
//       }}>
//         {navItems.map((item, index) => {
//           const isActive = location.pathname === item.path; // ✅ check active route
//           return (
//             <Tooltip
//               title={!isExpanded ? item.label : ''}
//               placement="right"
//               arrow
//               key={index}
//             >
//               <Box
//                 onClick={() => navigate(item.path)}
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 2,
//                   color: isActive ? 'white' : '#5DAAE0',
//                   cursor: 'pointer',
//                   position: 'relative',
//                   borderRadius: '8px',
//                   padding: '6px 8px',
//                   // backgroundColor: isActive ? '#1565c0' : 'transparent', // ✅ highlight active
//                   transition: 'background-color 0.2s ease',
//                   '&:hover': {
//                     backgroundColor: '#1565c0',
//                     color: 'white'
//                   }
//                 }}
//               >
//                 {item.badge ? (
//                   <Badge
//                     variant="dot"
//                     overlap="circular"
//                     anchorOrigin={{
//                       vertical: 'top',
//                       horizontal: 'right',
//                     }}
//                   >
//                     {item.icon}
//                   </Badge>
//                 ) : (
//                   item.icon
//                 )}
//                 {isExpanded && (
//                   <Typography variant="body1" noWrap sx={{ color: 'inherit' }}>
//                     {item.label}
//                   </Typography>
//                 )}
//               </Box>
//             </Tooltip>
//           );
//         })}
//       </Box>
//     </Box>
//   );
// };

// export default Sidebar;

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
import { MdOutlineSecurity, MdDashboard } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { CloudCircle, Insights, ExpandLess, ExpandMore } from "@mui/icons-material";
import { GoTools } from "react-icons/go";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null); // track which menu is open

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  const navItems = [
    { icon: <MdDashboard />, label: "Dashboard", path: "/" },
    { icon: <Insights />, label: "IAM Insights", badge: true, path: "/iam_insights" },
    {
      icon: <MdOutlineSecurity />,
      label: "Security Group",
      path: "/securitygroup",
      // subMenu: [
      //   { label: "Orthpanel", path: "/securitygroup/orthpanel" },
      //   { label: "SSH", path: "/securitygroup/ssh" }
      // ]
    },
    { icon: <CloudCircle />, label: "Cloud Trail", path: "/cloud_trail" },
    { icon: <GoTools />, label: "Security Tools", path: "/security_tools" }
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
          pt: 5,
          pl: 2,
          fontSize: 30
        }}
      >
        {navItems.map((item, index) => {
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
                      <Typography variant="body1" noWrap sx={{ color: "inherit" }}>
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
                    pl: isExpanded ? 4 : 0,
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
