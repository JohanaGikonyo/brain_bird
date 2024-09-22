import React from "react";
import { useSelected } from "../store/useSection";
import { supabase } from "../lib/supabaseClient"; // Import the Supabase client

function TopItems() {
  const { setSelectedItem } = useSelected();

  // Handle the logout process
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Supabase sign out method
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("Successfully logged out");
      // Optionally, redirect the user after successful logout
      window.location.href = "/auth/login"; // Redirect to login page or homepage
    }
  };

  return (
    <div className="flex z-20 sticky  p-2 flex-row justify-between items-center border-b border-b-slate-800">
      <div className="flex justify-start gap-5 pb-4 mx-2">
        <button
          className="border border-white text-white px-3 py-1 rounded-lg hover:bg-slate-600 transition"
          onClick={() => setSelectedItem("")}
        >
          Stories
        </button>
        <button className="border border-white text-white px-3 py-1 rounded-lg hover:bg-slate-600 transition">
          Ads
        </button>
        <button className="border border-white text-white px-3 py-1 rounded-lg hover:bg-slate-600 transition">
          Kids Stories
        </button>
      </div>
      <div>
        <button
          className="text-blue-500 border border-blue-500 rounded-xl px-4 py-2"
          onClick={handleLogout} // Add logout functionality here
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default TopItems;
