import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelected } from "../store/useSection";
import { useUser } from "../store/useStore";
import CustomAvatar from "./CustomAvatar";
import { supabase } from "../lib/supabaseClient";
import ChatPlatform from './ChatPlatform';

function MessageResponsive() {
  const { selectedItem, setSelectedItem, setEmail, email } = useSelected();
  const { user } = useUser();
  const [chatUsers, setChatUsers] = useState([]);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const toggleView = () => {
    if (email === null) {
      setSelectedItem("");
    } else {
      setEmail(null);
    }
  };

  // Fetch chat history and users
  useEffect(() => {
    const displayAllUsers = async () => {
      try {
        const { data, error } = await supabase.from("users").select("email");
        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchChatHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("sender, recipient, content, timestamp")
          .or(`sender.eq.${user.email},recipient.eq.${user.email}`)
          .order("timestamp", { ascending: false });

        if (error) throw error;

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

  // Handle search input change
  const handleSearch = (value) => {
    setSearch(value);
  };

  // Filtered chat users based on search input
  const filteredChatUsers = chatUsers.filter((chatUser) =>
    chatUser.email.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered all users based on search input
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Message Overlay */}
      {selectedItem === "Messages" && (
        <div className="lg:hidden lg:w-72 xl:w-80 h-full w-full overflow-y-auto fixed right-0 top-20 rounded-lg p-4 bg-gray-800 z-50">
          <div className="flex items-center mb-4 justify-start gap-2">
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

              {/* Display list of users with chat history */}
              {hasChatHistory ? (
                filteredChatUsers.map((chatUser, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-start mb-2 bg-slate-800 rounded-lg p-2 hover:bg-slate-700 hover:cursor-pointer"
                    onClick={() => setEmail(chatUser.email)}
                  >
                    <CustomAvatar email={chatUser.email} />
                    <div className="ml-8">
                      <div className="text-slate-400 text-sm truncate">{chatUser.lastMessage}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col space-x-2 gap-4">
                  {/* Display stacked avatars if no chat history */}
                  {filteredUsers.map((user, idx) => (
                    <div
                      key={idx}
                      className="hover:bg-slate-600 cursor-pointer p-3 rounded-lg"
                      onClick={() => setEmail(user.email)}
                    >
                      <CustomAvatar email={user.email} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageResponsive;
