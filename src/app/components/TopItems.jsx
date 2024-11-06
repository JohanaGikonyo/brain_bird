import React, { useState } from "react";
import { useSelected } from "../store/useSection";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import Drawer from "./Drawer";
import MessageResponsive from "./MessageResponsive";

function TopItems() {
  const { setSelectedItem } = useSelected();
  const [searchItem, setSearchItem] = useState("");

  const handleSearchChange = (e) => {
    setSearchItem(e.target.value);
  };

  const handleCancel = () => {
    setSearchItem(""); // Clear the input
  };

  return (
    <div className="flex flex-row flex-wrap justify-center gap-2 z-20 fixed top-0 w-full py-4 bg-slate-950 shadow-md border-b border-slate-800 items-center">
      
      <div className="flex gap-2  justify-around items-center">
        <div className="lg:hidden">
          <Drawer />
        </div>
        <button
          className="border border-slate-700 text-white px-4 py-2 rounded-2xl hover:bg-slate-700 hover:border-slate-500 transition duration-300"
          onClick={() => setSelectedItem("")}
        >
          Stories
        </button>
        <button className="border border-slate-700 text-white px-4 py-2 rounded-2xl hover:bg-slate-700 hover:border-slate-500 transition duration-300">
          Ads
        </button>
        <button className="border border-slate-700 text-white px-4 py-2 rounded-2xl hover:bg-slate-700 hover:border-slate-500 transition duration-300">
          Kids Stories
        </button>
        <div className="lg:hidden">
          <MessageResponsive />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center w-full max-w-xs sm:max-w-sm lg:max-w-md mt-4 lg:mt-0">
        <span className="absolute left-3 text-blue-500">
          <SearchIcon fontSize="small" />
        </span>
        <input
          type="text"
          placeholder="Search..."
          value={searchItem}
          onChange={handleSearchChange}
          className="pl-10 pr-4 py-2 rounded-full border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-slate-500 transition duration-300 w-full"
        />
        {searchItem && (
          <span className="absolute right-3 text-red-500 cursor-pointer" onClick={handleCancel}>
            <CancelIcon fontSize="small" />
          </span>
        )}
      </div>
      {/* </div> */}
    </div>
  );
}

export default TopItems;
