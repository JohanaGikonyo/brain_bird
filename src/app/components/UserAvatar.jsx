import React from "react";
import Avatar from "@mui/material/Avatar";

// Function to get the initials from the email
const getInitials = (email) => {
  if (!email) return "G"; // Default to "G" if no email is provided
  return email[0].toUpperCase(); // Get the first letter of the email
};

// Function to map initials to specific colors
const getColorForInitial = (initial) => {
  const colorMap = {
    A: "#1E90FF", // Blue
    B: "#FFD700", // Gold
    C: "#FF4500", // OrangeRed
    D: "#8A2BE2", // BlueViolet
    E: "#32CD32", // LimeGreen
    F: "#FF6347", // Tomato
    G: "#FF69B4", // HotPink
    H: "#FF8C00", // DarkOrange
    I: "#00CED1", // DarkTurquoise
    J: "#9400D3", // DarkViolet
    K: "#4B0082", // Indigo
    L: "#00FF7F", // SpringGreen
    M: "#4682B4", // SteelBlue
    N: "#FF00FF", // Magenta
    O: "#DA70D6", // Orchid
    P: "#40E0D0", // Turquoise
    Q: "#B0E0E6", // PowderBlue
    R: "#7FFF00", // Chartreuse
    S: "#FFA500", // Orange
    T: "#FF1493", // DeepPink
    U: "#DC143C", // Crimson
    V: "#00FA9A", // MediumSpringGreen
    W: "#F08080", // LightCoral
    X: "#9932CC", // DarkOrchid
    Y: "#87CEEB", // SkyBlue
    Z: "#4169E1", // RoyalBlue
    default: "#808080", // Default to Gray if no match
  };

  return colorMap[initial] || colorMap.default;
};

const UserAvatar = ({ avatarUrl, email }) => {
  const initials = !avatarUrl ? getInitials(email) : "";
  const backgroundColor = initials ? getColorForInitial(initials) : "inherit";

  return (
    <Avatar
      alt="User Avatar"
      src={avatarUrl}
      sx={{
        bgcolor: backgroundColor, // Keep background transparent
        color: "white",
        fontSize: "1.5rem",

        // border: () => `1px solid white`,
      }}
    >
      {!avatarUrl && initials}
    </Avatar>
  );
};

export default UserAvatar;
