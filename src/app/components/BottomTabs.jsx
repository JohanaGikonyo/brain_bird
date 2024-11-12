// components/Menu.js
import React from "react";
import { useSelected } from "../store/useSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from '@mui/icons-material/Search';import CloudIcon from "@mui/icons-material/Cloud";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import { useSearch } from "../store/useStore";

function BottomTabs() {
  const { setSelectedItem, selectedItem } = useSelected();
const {setSearch}=useSearch();

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
        
           `lg:hidden text-slate-400 sticky bottom-0 bg-slate-900  z-20   shadow-lg p-1  flex flex-row items-center  justify-around space-x-4`
      }
    >
      
      <button
        onClick={() => {setSelectedItem(""); setSearch("")}}
        className="text-xl hover:text-slate-800 hover:bg-gray-400 rounded-lg font-bold p-1 w-full  flex items-center gap-3 hover:cursor-pointer transition"
      >
        <HomeIcon className="w-6 h-6" />
      </button>
      <button
        onClick={() =>{setSearch("stock");setSelectedItem("")}}
        className="text-2xl p-1 w-full rounded-lg hover:text-slate-800 hover:bg-gray-400 flex items-center gap-3 transition"
      >
        <SearchIcon className="w-6 h-6" />
      </button>
      <button
        onClick={() =>{setSearch("Weather");setSelectedItem("")}}
        className="text-2xl p-1 w-full rounded-lg hover:text-slate-800 hover:bg-gray-400 flex items-center gap-3 transition"
      >
        <CloudIcon className="w-6 h-6" />
      </button>
      <button
        onClick={() => handleMessagesSet()}
        className="text-2xl p-1 w-full rounded-lg hover:text-slate-800 hover:bg-gray-400 flex items-center gap-3 transition"
      >
        <ChatIcon className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => {setSearch("sports"); setSelectedItem("")}}
        className="text-2xl p-1 w-full rounded-lg hover:text-slate-800 hover:bg-gray-400 flex items-center gap-3 transition"
      >
        <SportsHandballIcon className="w-6 h-6" />
      </button>
      <button
        onClick={() => setSelectedItem("Groups")}
        className="text-2xl p-1 w-full rounded-lg hover:text-slate-800 hover:bg-gray-400 flex items-center gap-3 transition"
      >
        <GroupsIcon className="w-6 h-6" />
      </button>
     


      
      
    </div>
  );
}

export default BottomTabs;
