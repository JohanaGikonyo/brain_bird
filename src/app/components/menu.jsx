// components/Menu.js
import React from "react";
import { useSelected } from "../store/useSection";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import CloudIcon from "@mui/icons-material/Cloud";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import GroupsIcon from "@mui/icons-material/Groups";
import Divider from "@mui/material/Divider";
import UserAvatar from "./UserAvatar";
import { supabase } from "../lib/supabaseClient";
import logo from "../../../public/brain_bird_logo.png";
import Image from "next/image";
function Menu({ open }) {
  const { setSelectedItem } = useSelected();

  // Handle the logout process
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Supabase sign out method
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("Successfully logged out");
      window.location.href = "/auth/login"; // Redirect to login page
    }
  };

  return (
    <div
      className={
        open
          ? `text-slate-900`
          : `m-2 mt-14 mb-10 text-slate-100 shadow-lg p-6 rounded-lg flex flex-col items-center space-y-4`
      }
    >
      <Image alt="logo image" src={logo} width={100} height={50} />
      <Divider />
      <button
        onClick={() => setSelectedItem("")}
        className="text-xl hover:text-slate-800 hover:bg-gray-300 font-bold p-2 w-full rounded-lg flex items-center gap-3 hover:cursor-pointer transition"
      >
        <HomeIcon className="w-6 h-6" />
        <span>Home</span>
      </button>
      <button
        onClick={() => setSelectedItem("Stocks")}
        className="text-2xl p-2 w-full rounded-lg hover:text-slate-800 hover:bg-gray-300 flex items-center gap-3 transition"
      >
        <InventoryIcon className="w-6 h-6" />
        <span>Stocks</span>
      </button>
      <button
        onClick={() => setSelectedItem("Weather")}
        className="text-2xl p-2 w-full rounded-lg hover:text-slate-800 hover:bg-gray-300 flex items-center gap-3 transition"
      >
        <CloudIcon className="w-6 h-6" />
        <span>Weather</span>
      </button>
      <button
        onClick={() => setSelectedItem("Sports")}
        className="text-2xl p-2 w-full rounded-lg hover:text-slate-800 hover:bg-gray-300 flex items-center gap-3 transition"
      >
        <SportsHandballIcon className="w-6 h-6" />
        <span>Sports</span>
      </button>
      <button
        onClick={() => setSelectedItem("Groups")}
        className="text-2xl p-2 w-full rounded-lg hover:text-slate-800 hover:bg-gray-300 flex items-center gap-3 transition"
      >
        <GroupsIcon className="w-6 h-6" />
        <span>Groups</span>
      </button>
      <button
        onClick={() => setSelectedItem("Account")}
        className="my-4 text-xl text-white bg-blue-500 px-4 py-3 w-full rounded-3xl hover:text-slate-200 hover:bg-blue-700 flex items-center justify-center gap-3 transition"
      >
        Post
      </button>

      <Divider className="w-full bg-slate-400 my-2" />

      {/* User Profile Section */}
      <div
        className={
          open
            ? `hover:bg-slate-200 flex items-center space-x-4 p-3 rounded-3xl hover:cursor-pointer`
            : `flex items-center space-x-4 p-3 rounded-3xl hover:cursor-pointer hover:bg-slate-800`
        }
        onClick={() => setSelectedItem("profile")}
      >
        <UserAvatar />
      </div>
      <Divider />
      <div className="py-3 my-3  flex justify-center items-center">
        <button
          className="text-blue-500 border border-blue-500 rounded-xl px-3 py-1"
          onClick={handleLogout} // Add logout functionality here
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Menu;
