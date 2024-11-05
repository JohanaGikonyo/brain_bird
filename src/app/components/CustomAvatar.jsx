import React from "react";
import Avatar from "@mui/material/Avatar";

// Function to get the initials from the email
const getInitials = (email) => {
  if (!email) return "U"; // Default to "U" if no email is provided
  const username = email.split("@")[0];
  const initials = username[0].toUpperCase(); // Get the first letter of the username
  return initials;
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

const CustomAvatar = ({ email, avatarUrl }) => {
  const initials = !avatarUrl ? getInitials(email) : "";
  const backgroundColor = initials ? getColorForInitial(initials) : "inherit";

  return (
    <div className="flex ">
      <Avatar
        alt="User Avatar"
        src={avatarUrl}
        sx={{
          bgcolor: backgroundColor,
          color: "white",
          fontSize: "1.5rem",
        }}
      >
        {!avatarUrl && initials}
      </Avatar>
      {/* <span className="ml-2 font-bold">{`@${getInitials(email)}`}</span> */}
    </div>
  );
};

export default CustomAvatar;
