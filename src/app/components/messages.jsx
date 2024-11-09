import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelected } from "../store/useSection";
import { useUser } from "../store/useStore";
import CustomAvatar from "./CustomAvatar";
import { supabase } from "../lib/supabaseClient"; // Assuming you have Supabase setup for fetching user and message data
import ChatPlatform from './ChatPlatform';

function Messages() {
  const { setSelectedItem, setEmail, email } = useSelected();
  const { user } = useUser();
  const [chatUsers, setChatUsers] = useState([]);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const toggleView = () => {
    if (email !== null) {
      setEmail(null);
    } else {
      setSelectedItem("");
    }
  };

  // Fetch users and chat history
  useEffect(() => {
    const displayAllUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("email");

        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchChatHistory = async () => {
      try {
        // Fetch all messages where the current user is either the sender or recipient
        const { data, error } = await supabase
          .from("messages")
          .select("sender, recipient, content, timestamp")
          .or(`sender.eq.${user.email},recipient.eq.${user.email}`)
          .order("timestamp", { ascending: false });

        if (error) throw error;

        // Process data to create unique list of users with whom there is a chat history
        const usersMap = {};
        data.forEach((msg) => {
          const otherUser = msg.sender === user.email ? msg.recipient : msg.sender;
          if (!usersMap[otherUser]) {
            usersMap[otherUser] = { email: otherUser, lastMessage: msg.content };
          }
        });

        setChatUsers(Object.values(usersMap));
        setHasChatHistory(Object.keys(usersMap).length > 0);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    displayAllUsers();
    fetchChatHistory();
  }, [user.email]);

  const handleSearch = (value) => {
    setSearch(value);
  };

  // Filtering the chat users based on search input
  const filteredChatUsers = chatUsers.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // Filtering the all users based on search input
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Message Overlay */}
      <div className="hidden lg:block lg:w-72 xl:w-80 h-full overflow-y-auto fixed right-0 top-20 rounded-lg p-4 bg-gray-800 z-50">
        <div className="flex items-center mb-4 justify-between">
          <ArrowBackIcon className="text-slate-400 cursor-pointer" onClick={toggleView} />
          <h2 className="text-xl text-slate-200 font-bold ml-2">{email ? <CustomAvatar email={email} /> : "Chat With"}</h2>
          <MoreVertIcon className="text-slate-400" />
        </div>
        {email ? (
          <ChatPlatform userEmail={user.email} />
        ) : (
          <div>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="mb-4 p-2 rounded-lg bg-slate-300 text-slate-950 focus:outline-0"
            />

            {/* Display list of users with chat history or all users */}
            {hasChatHistory ? (
              filteredChatUsers.length > 0 ? (
                filteredChatUsers.map((chatUser, index) => (
                  <div key={index} className="flex flex-col items-start mb-2 bg-slate-800 rounded-lg p-2 hover:bg-slate-700 hover:cursor-pointer" onClick={() => setEmail(chatUser.email)}>
                    <CustomAvatar email={chatUser.email} />
                    <div className="ml-8">
                      <div className="text-slate-400 text-sm truncate">{chatUser.lastMessage}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400">No matching users found</div>
              )
            ) : (
              <div className="flex flex-col space-x-2 gap-4">
                {/* Display stacked avatars if no chat history */}
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <div key={idx} className="hover:bg-slate-600 cursor-pointer p-3 rounded-lg" onClick={() => setEmail(user.email)}>
                      <CustomAvatar email={user.email} />
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400">No matching users found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
