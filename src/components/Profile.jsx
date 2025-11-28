import React from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Divider,
  Button,
  Grid,
} from "@mui/material";
import { Edit, Logout } from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Profile = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Read token from localStorage
  const token = localStorage.getItem("auth_token");

  // If token is "admin-auth" → show admin profile
  const isAdmin = token === "admin-auth";

  const adminProfile = {
    fullName: "System Administrator",
    email: "admin@jit.com",
    phone: "+91 9000000000",
    role: "Admin",
    employeeId: "ADMIN001",
    department: "Head Office",
    joinDate: "01 Jan 2024",
    location: "Chennai",
    lastLogin: "Today, 10:15 AM",
    bio: "Responsible for managing the entire platform, company accounts, and operational structure.",
  };

  const companyProfile = {
    fullName: user?.adminName || user?.username || "Company Admin",
    email: user?.email || "company@example.com",
    phone: user?.phone || "+91 9876543210",
    role: "Company Admin",
    employeeId: user?.cid || "COMP-001",
    department: user?.industry || "Operations",
    joinDate: user?.created_at || "Not Available",
    location: user?.location || "Company Location",
    lastLogin: user?.lastLogin || "Today",
    bio:
      user?.bio ||
      "Manages company dashboards, cost optimization, and cloud infrastructure insights.",
  };

  // Choose profile based on token
  const profile = isAdmin ? adminProfile : companyProfile;


  return (
    <Box sx={{ maxWidth: 900, margin: "auto", mt: 5, p: 3 }}>
      <Card sx={{ borderRadius: 4, p: 3, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#2563eb",
                fontSize: 40,
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              }}
            >
              {profile.fullName[0]}
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={700}>
                {profile.fullName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {profile.role} — {profile.department}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Details */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <ProfileItem label="Full Name" value={profile.fullName} />
              <ProfileItem label="Email" value={profile.email} />
              <ProfileItem label="Phone Number" value={profile.phone} />
              <ProfileItem label="Employee ID" value={profile.employeeId} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ProfileItem label="Department" value={profile.department} />
              <ProfileItem label="Join Date" value={profile.joinDate} />
              <ProfileItem label="Location" value={profile.location} />
              <ProfileItem label="Last Login" value={profile.lastLogin} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Bio */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            About / Bio
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {profile.bio}
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Edit />}
              sx={{ textTransform: "none", borderRadius: 2, px: 4, py: 1.2 }}
            >
              Edit Profile
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              sx={{ textTransform: "none", borderRadius: 2, px: 4, py: 1.2 }}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Reusable profile item
const ProfileItem = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Box>
);

export default Profile;
