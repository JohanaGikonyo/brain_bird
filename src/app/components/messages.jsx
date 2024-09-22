import React from "react";
// import { useSelected } from "../store/useSection";

function Messages() {
  //   const { selected, setSelectedItem } = useSelected();
  return (
    <div className="flex flex-col my-7 items-center   text-slate-100 shadow-lg p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      <button className=" text-white  p-2 mb-2 rounded-lg hover:bg-red-300 transition ">Messages</button>
      <button className=" text-white  p-2 mb-2 rounded-lg hover:bg-red-300 transition ">Kids Messages</button>
      <button className="text-white p-2 mb-2 rounded-lg hover:bg-red-300 transition   text-center">
        Wife/Husband Messages
      </button>
    </div>
  );
}

export default Messages;
