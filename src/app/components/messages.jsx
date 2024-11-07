import React  from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelected } from "../store/useSection";
function Messages() {
  const {selectedItem, setSelectedItem}=useSelected()

  const toggleView = () => {
    setSelectedItem("")
  };

  return (
    <div>
    

      {/* Message Overlay */}
      {(selectedItem==="Messages" ) && (
        <div className="hidden lg:block lg:w-72 xl:w-80 h-full overflow-y-auto fixed right-0 top-20 rounded-lg p-4 bg-slate-950 z-50">
          <div className="flex items-center mb-4 justify-between">
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

export default Messages;
