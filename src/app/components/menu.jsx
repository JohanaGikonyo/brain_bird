// components/Menu.js
import React,{useState} from "react";
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
import ClearIcon from '@mui/icons-material/Clear';
import ChatIcon from "@mui/icons-material/Chat";

import {  CircularProgress,  } from "@mui/material";

import Image from "next/image";
function Menu({ open }) {
  const { setSelectedItem, selectedItem } = useSelected();
  const [loading, setLoading] = useState(false);

  // Handle the logout process
  const handleLogout = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut(); // Supabase sign out method
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("Successfully logged out");
      setLoading(false);

      window.location.href = "/auth/login"; // Redirect to login page
    }
  };
  const handleMessagesSet=()=>{
    if(selectedItem==="!Messages"){
      setSelectedItem("")
    }
    else{
      setSelectedItem("Messages")
    }
  }

  return (
    <div
      className={
        open
          ? `text-slate-200 m-2 mt-1 mb-10  shadow-lg p-6 rounded-lg flex flex-col items-center scrollbar-hide justify-center space-y-4`
          : `m-2 mt-14 mb-10 text-slate-100 shadow-lg p-6 rounded-lg flex flex-col scrollbar-hide items-center space-y-4`
      }
    >
      <div className="flex justify-between items-center text-slate-50 gap-10"><div className="mb-4 ml-4 rounded-full"><Image alt="logo image" src={logo} width={100} height={50} className="rounded-2xl" /></div><ClearIcon /></div>
      <div ><Divider className="text-slate-50 bg-slate-50 w-full"/></div>
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
        onClick={() => handleMessagesSet()}
        className="text-2xl p-2 w-full rounded-lg hover:text-slate-800 hover:bg-gray-300 flex items-center gap-3 transition"
      >
        <ChatIcon className="w-6 h-6" />
        <span>Messages</span>
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
        onClick={() => setSelectedItem("my posts")}
        className="my-4 text-xl text-white bg-blue-500 px-4 py-3 w-full rounded-3xl hover:text-slate-200 hover:bg-blue-700 flex items-center justify-center gap-3 transition"
      >
        My Posts
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
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          onClick={handleLogout} 
        >
            {loading && <CircularProgress size={24} className="mr-2" color="inherit" />}

          Log Out
        </button>
      </div>
    </div>
  );
}

export default Menu;
