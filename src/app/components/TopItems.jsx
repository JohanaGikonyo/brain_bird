import React from "react";
import { useTopStories } from "../store/useStore";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import {useSearch} from '../store/useStore'

function TopItems() {
  const { setTopStories } = useTopStories();
const {setSearch, search}=useSearch()
  const handleSearchChange = (e) => {

    setSearch(e.target.value)
  };

  const handleCancel = () => {
    setSearch(""); // Clear the input
  };

  return (
    <div className="flex flex-row flex-wrap justify-center gap-2 z-20 fixed top-0 w-full py-4 bg-slate-950 shadow-md border-b border-slate-800 items-center">
      
      <div className="flex gap-2  justify-around items-center">
        
        <button
          className="border border-slate-700 text-white px-4 py-2 rounded-2xl hover:bg-slate-700 hover:border-slate-500 transition duration-300"
          onClick={() => setTopStories(prev=>!prev)}
        >
         Top Stories
        </button>
        <button className="border border-slate-700 text-white px-4 py-2 rounded-2xl hover:bg-slate-700 hover:border-slate-500 transition duration-300">
          Ads
        </button>
        <button className="border border-slate-700 text-white px-4 py-2 rounded-2xl hover:bg-slate-700 hover:border-slate-500 transition duration-300">
          Kids Stories
        </button>
        
      </div>

      {/* Search Input */}
      <div className="relative flex items-center w-full max-w-xs sm:max-w-sm lg:max-w-md mt-4 lg:mt-0">
        <span className="absolute left-3 text-blue-500">
          <SearchIcon fontSize="small" />
        </span>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={handleSearchChange}
          className="pl-10 pr-4 py-2 rounded-full border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-slate-500 transition duration-300 w-full"
        />
        {search && (
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
