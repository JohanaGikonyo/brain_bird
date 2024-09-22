import React, { useState } from "react";
import ChatIcon from "@mui/icons-material/Chat";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function MessageResponsive() {
  const [view, setView] = useState(false);

  const toggleView = () => {
    setView((prev) => !prev);
  };

  return (
    <div>
      {/* Chat Icon */}
      {!view && (
        <div className="text-slate-50 hover:cursor-pointer flex flex-end justify-end" onClick={toggleView}>
          <ChatIcon />
        </div>
      )}

      {/* Message Overlay */}
      {view && (
        <div className="fixed inset-0 bg-gray-950  flex flex-col p-4 z-50">
          <div className="flex items-center mb-4 justify-between">
            {/* Back Icon */}
            <ArrowBackIcon className="text-white cursor-pointer" onClick={toggleView} />
            <h2 className="text-xl text-slate-50 font-bold ml-2">Messages</h2>
            <div></div>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search messages..."
            className="mb-4 p-2 rounded-lg text-gray-800 focus:outline-0"
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
