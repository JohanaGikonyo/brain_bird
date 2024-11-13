import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useUser } from "../store/useStore";
import { supabase } from "../lib/supabaseClient";

const getInitials = (email) => {
  if (!email) return "G"; // Default to "G" if no email is provided
  return email[0].toUpperCase(); // Get the first letter of the email
};

// Function to map initials to specific colors
const getColorForInitial = (initial) => {
  const colorMap = {
    A: "#1E90FF", B: "#FFD700", C: "#FF4500", D: "#8A2BE2",
    E: "#32CD32", F: "#FF6347", G: "#FF69B4", H: "#FF8C00",
    I: "#00CED1", J: "#9400D3", K: "#4B0082", L: "#00FF7F",
    M: "#4682B4", N: "#FF00FF", O: "#DA70D6", P: "#40E0D0",
    Q: "#B0E0E6", R: "#7FFF00", S: "#FFA500", T: "#FF1493",
    U: "#DC143C", V: "#00FA9A", W: "#F08080", X: "#9932CC",
    Y: "#87CEEB", Z: "#4169E1", default: "#808080",
  };
  return colorMap[initial] || colorMap.default;
};

const UserAvatar = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the full name and avatar URL
  const fullName = profileData?.username || user.user_metadata?.full_name || "User";
  const avatarUrl = profileData?.profile_pic || user.user_metadata?.avatar_url;

  const fetchProfileData = async (email) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("profile")
        .eq("email", email)
        .single();

      if (error) {
        throw error;
      }

      return data.profile;
    } catch (error) {
      setError(error.message);
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const data = await fetchProfileData(user.email);
      setProfileData(data);
      setLoading(false);
    };

    if (user.email) {
      fetchProfile();
    }
  }, [user.email]);

  // Determine initials and background color if avatar does not exist
  const initials = !avatarUrl ? getInitials(user.email) : "";
  const backgroundColor = initials ? getColorForInitial(initials) : "inherit";

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <CircularProgress size={24} style={{ marginRight: "8px" }} />
        <Typography variant="body1" style={{ color: "" }} className="lg:text-slate-50 text-slate-400">
          Loading...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body1" style={{ color: "red" }} className="lg:text-slate-50 text-slate-400">
          Error: {error}
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Avatar
        alt="User Avatar"
        src={avatarUrl}
        sx={{
          bgcolor: backgroundColor,
          color: "white",
          fontSize: "1.5rem",
          marginRight: "8px",
        }}
      >
        {!avatarUrl && initials}
      </Avatar>
      <Typography variant="body1" style={{ color: "" }} className="lg:text-slate-50 text-slate-400">
        {fullName}
      </Typography>
    </div>
  );
};

export default UserAvatar;
