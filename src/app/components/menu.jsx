// components/Menu.js
import React, { useEffect, useState } from "react";
import { useSelected } from "../store/useSection";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import CloudIcon from "@mui/icons-material/Cloud";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import GroupsIcon from "@mui/icons-material/Groups";
import Divider from "@mui/material/Divider";
import UserName from "./userName";
import UserAvatar from "./UserAvatar";
import { supabase } from "../lib/supabaseClient";
import { getNameFromEmail } from "../utils/userUtils";
function Menu({ open }) {
  const { setSelectedItem } = useSelected();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    // Fetch the current user session
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        // Check for avatar from Google profile if user used Google sign-in
        const googleAvatarUrl = session.user?.user_metadata?.avatar_url;

        if (googleAvatarUrl) {
          setAvatarUrl(googleAvatarUrl); // Use Google avatar if available
        } else {
          // Fetch avatar from your own profiles table if available
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", session.user.id)
            .single();
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <div
      className={
        open ? `text-slate-900` : `m-2 text-slate-100 shadow-lg p-6 rounded-lg flex flex-col items-center space-y-4`
      }
    >
      {/* Menu Items */}
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
        <UserAvatar avatarUrl={avatarUrl} name={user ? getNameFromEmail(user.email) : "G"} />
        <UserName email={user ? `${user.email}` : ""} />
      </div>
    </div>
  );
}

export default Menu;
