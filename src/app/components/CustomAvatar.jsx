import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import { supabase } from "../lib/supabaseClient";

// Function to get the initials from the email
const getInitials = (email) => {
  if (!email) return "U"; // Default to "U" if no email is provided
  const username = email.split("@")[0];
  const initials = username[0].toUpperCase(); // Get the first letter of the username
  return initials;
};

// Function to get username from email
const getUsernameFromEmail = (email) => {
  if (!email) return "@user";
  const username = email.split("@")[0];
  const cleanedUsername = username.replace(/\d+/g, "");
  return "@" + cleanedUsername;
};

// Function to fetch profile data
const fetchProfileData = async (email) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("profile")
      .eq("email", email)
      .single();
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    return data.profile;
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
};

// Function to map initials to specific colors
const getColorForInitial = (initial) => {
  const colorMap = {
    A: "#1E90FF",
    B: "#FFD700",
    C: "#FF4500",
    D: "#8A2BE2",
    E: "#32CD32",
    F: "#FF6347",
    G: "#FF69B4",
    H: "#FF8C00",
    I: "#00CED1",
    J: "#9400D3",
    K: "#4B0082",
    L: "#00FF7F",
    M: "#4682B4",
    N: "#FF00FF",
    O: "#DA70D6",
    P: "#40E0D0",
    Q: "#B0E0E6",
    R: "#7FFF00",
    S: "#FFA500",
    T: "#FF1493",
    U: "#DC143C",
    V: "#00FA9A",
    W: "#F08080",
    X: "#9932CC",
    Y: "#87CEEB",
    Z: "#4169E1",
    default: "#808080", // Default color
  };
  return colorMap[initial] || colorMap.default;
};

// eslint-disable-next-line react/display-name
const CustomAvatar = React.memo(({ email, avatarUrl, size }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const data = await fetchProfileData(email);
      setProfileData(data);
      setLoading(false);
    };

    if (email) {
      fetchProfile();
    }
  }, [email]);

  if (loading) {
    return (
      <Skeleton
        variant="circular"
        width={size}
        height={size}
        sx={{
          bgcolor: "linear-gradient(45deg, #FF4081, #FF80AB)",
        }}
      />
    );
  }

  const initials = !profileData?.profile_pic ? getInitials(email) : "";
  const backgroundColor = initials ? getColorForInitial(initials) : "inherit";

  return (
    <div className="flex items-center">
      <Avatar
        alt="User Avatar"
        src={profileData?.profile_pic || avatarUrl}
        sx={{
          bgcolor: backgroundColor,
          color: "white",
          fontSize: size || "1.5rem",
          width: size === "0.5rem" ? "20px" : "40px",
          height: size === "0.5rem" ? "20px" : "40px",
        }}
      >
        {!profileData?.profile_pic && initials}
      </Avatar>
      <span className="ml-2 font-bold">
        {profileData?.username || getUsernameFromEmail(email)}
      </span>
    </div>
  );
});

export default CustomAvatar;
