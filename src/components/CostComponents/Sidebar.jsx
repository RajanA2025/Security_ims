// // src/components/Sidebar.jsx
// import React from "react";
// import { Badge, Tooltip, Button, Typography } from "antd";
// import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// import { useNavigate, useLocation } from "react-router-dom";
// import { GrMoney, GrCompliance } from "react-icons/gr";
// import { MdOutlineSavings } from "react-icons/md";
// import { FaMoneyCheckDollar } from "react-icons/fa6";
// import { CgPerformance } from "react-icons/cg";

// const { Text } = Typography;

// const Sidebar = ({ isExpanded, setIsExpanded }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const toggleSidebar = () => setIsExpanded((prev) => !prev);

//   const navItems = [
//     { icon: FaMoneyCheckDollar, label: "Cost Overview", path: "/Dashboard", badge: false },
//     { icon: GrMoney, label: "Cost Deepdrive", path: "/cost-deepdrive", badge: false },
//     { icon: MdOutlineSavings, label: "Saving Opportunity", path: "/Savings", badge: false },
//     { icon: GrCompliance, label: "Compliance", path: "/compliance", badge: false },
//     // { icon: CgPerformance, label: "Optimization", path: "/optimization", badge: false },
//   ];

//   const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

//   return (
//     <div
//       style={{
//         width: isExpanded ? 200 : 90,
//         backgroundColor: "#4f46e5",
//         height: "100%",
//         borderRight: "1px solid #ddd",
//         position: "relative",
//         transition: "width 0.3s ease",
//         paddingTop: 16,
//         overflow: "visible",
//         fontFamily,
//       }}
//     >
//       {/* Toggle button */}
//       <Button
//         onClick={toggleSidebar}
//         style={{
//           position: "absolute",
//           top: 10,
//           right: -15,
//           backgroundColor: "white",
//           color: "#6a82fb",
//           zIndex: 20,
//           padding: 4,
//           borderRadius: "50%",
//         }}
//       >
//         {isExpanded ? <IoIosArrowBack size={24} /> : <IoIosArrowForward size={24} />}
//       </Button>

//       {/* Navigation items */}
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: 8,
//           // paddingTop: 40,
//           paddingLeft: 12,
//         }}
//       >
//         {navItems.map((item, index) => {
//           const IconComponent = item.icon;
//           const isActive = location.pathname === item.path;

//           return (
//             <Tooltip key={index} title={item.label} placement="right" arrow>
//               <div
//                 onClick={() => navigate(item.path)}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 12,
//                   color: isActive ? "#6a82fb" : "#fff",
//                   cursor: "pointer",
//                   position: "relative",
//                   transition: "all 0.2s ease",
//                   padding: "6px 8px",
//                   borderRadius: 4,
//                   minHeight: 40,
//                 }}
//               >
//                 {/* Icon */}
//                 {!isExpanded && (
//                   <div style={{ fontSize: 28, minWidth: 30, display: "flex", justifyContent: "center" }}>
//                     {item.badge ? (
//                       <Badge dot>
//                         <IconComponent size={28} color={isActive ? "#fff" : "#6a82fb"} />
//                       </Badge>
//                     ) : (
//                       <IconComponent size={28} color={isActive ? "#fff" : "#6a82fb"} />
//                     )}
//                   </div>
//                 )}

//                 {/* Label */}
//                 {/* Label with smooth fade */}
//                 <Text
//                   style={{
//                     color: isActive ? "#fff" : "#6a82fb",
//                     fontWeight: 500,
//                     fontFamily,
//                     fontSize: 16,
//                     whiteSpace: "nowrap",
//                     opacity: isExpanded ? 1 : 0,
//                     width: isExpanded ? "auto" : 0,
//                     overflow: "hidden",
//                     transition: "opacity 0.3s ease, width 0.3s ease",
//                   }}
//                 >
//                   {item.label}
//                 </Text>
//               </div>
//             </Tooltip>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
