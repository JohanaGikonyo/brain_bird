import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelected } from "../store/useSection";
function MessageResponsive() {
  const {selectedItem, setSelectedItem}=useSelected()

  const toggleView = () => {
    setSelectedItem("")
  };

  return (
    <div>
    

      {/* Message Overlay */}
      {(selectedItem==="Messages" ) && (
        <div className="fixed inset-0 bg-gray-950  flex flex-col p-4 z-50 mt-0 lg:hidden ">
          <div className="flex items-center mb-4 justify-between">
            {/* Back Icon */}
            <ArrowBackIcon className="text-slate-400 cursor-pointer" onClick={toggleView} />
            <h2 className="text-xl text-slate-200 font-bold ml-2">Messages</h2>
            <div className="text-slate-400">
              <MoreVertIcon />
            </div>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search messages..."
            className="mb-4 p-2 rounded-lg  bg-slate-300 text-slate-950 focus:outline-0"
          />

          {/* Message Buttons */}
          <button className="text-white p-2 mb-2 rounded-lg hover:bg-red-300 transition">Messages</button>
          <button className="text-white p-2 mb-2 rounded-lg hover:bg-red-300 transition">Kids Messages</button>
          <button className="text-white p-2 mb-2 rounded-lg hover:bg-red-300 transition text-center">
            Wife/Husband Messages
          </button>
        </div>
      )}
    </div>
  );
}

export default MessageResponsive;
