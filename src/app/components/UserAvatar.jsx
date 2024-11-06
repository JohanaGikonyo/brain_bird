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

  // Get the full name and avatar URL
  const fullName = profileData?.username || user.user_metadata?.full_name || "User";
  const avatarUrl = user.avatar_url;

  const fetchProfileData = async (email) => {
    const { data, error } = await supabase
      .from("users")
      .select("profile") // Fetch the profile column
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data.profile;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const data = await fetchProfileData(user.email);
      setProfileData(data);
      setLoading(false);
    };

    fetchProfile();
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

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Avatar
        alt="User Avatar"
        src={avatarUrl || profileData?.profile_pic}
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
        @{fullName}
      </Typography>
    </div>
  );
};

export default UserAvatar;
