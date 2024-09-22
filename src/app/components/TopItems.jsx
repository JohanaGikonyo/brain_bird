import React from "react";
import { useSelected } from "../store/useSection";
// import { supabase } from "../lib/supabaseClient"; // Import the Supabase client

function TopItems() {
  const { setSelectedItem } = useSelected();

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
    </div>
  );
}

export default TopItems;
