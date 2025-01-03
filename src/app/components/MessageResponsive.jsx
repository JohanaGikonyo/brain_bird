import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "react-toastify"; 
import { useSelected } from "../store/useSection";
import { useUser } from "../store/useStore";
import CustomAvatar from "./CustomAvatar";
import { supabase } from "../lib/supabaseClient";
import ChatPlatform from "./ChatPlatform";
function MessageResponsive() {
  const { setSelectedItem, selectedItem, setEmail, email } = useSelected();
  const { user } = useUser();
  const [chatUsers, setChatUsers] = useState([]);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const toggleView = () => {
    if (email !== null) {
      setEmail(null);
    } else {
      setSelectedItem("");
    }
  }; // Fetch users and chat history
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
          .select("sender, recipient, content, timestamp, is_read")
          .or(`sender.eq.${user.email},recipient.eq.${user.email}`)
          .order("timestamp", { ascending: false });
        if (error) throw error;
        const usersMap = {};
        const unreadMap = {};
        data.forEach((msg) => {
          const otherUser = msg.sender === user.email ? msg.recipient : msg.sender;
          if (!usersMap[otherUser]) {
            usersMap[otherUser] = { email: otherUser, lastMessage: msg.content };
          }
          if (!msg.is_read && msg.sender === user.email) {
            if (!unreadMap[otherUser]) {
              unreadMap[otherUser] = 0;
            }
            unreadMap[otherUser] += 1;
          }
        });
        setChatUsers(Object.values(usersMap));
        setHasChatHistory(Object.keys(usersMap).length > 0);
        setUnreadCounts(unreadMap);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    displayAllUsers();
    fetchChatHistory();
    const channel = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new;
        if (newMsg.sender === user.email || newMsg.recipient === user.email) {
          fetchChatHistory();
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.email]);

  useEffect(() => {
    Object.entries(unreadCounts).forEach(([email, count]) => {
      if (count > 0) {
        toast(`You have ${count} unread messages from ${email}`); // Trigger notification
      }
    });
  }, [unreadCounts]);
  const filteredChatUsers = chatUsers.filter((user) => user.email.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(search.toLowerCase()));
  const handleSearch = (value) => {
    setSearch(value);
  };
  return (
    <div>
      {selectedItem === "Messages" && (
        <div className="lg:hidden lg:w-72 xl:w-80 w-full h-screen fixed right-0 top-0 rounded-lg p-4  bg-gray-800 z-50">
          <div
            className={
              email
                ? "fixed lg:top-20 p-2 bg-gray-800 flex items-center w-full justify-around gap-2"
                : "flex items-center mb-0 justify-between gap-2"
            }
          >
            <ArrowBackIcon className="text-slate-400 cursor-pointer" onClick={toggleView} />
            <h2 className="text-xl text-slate-200 font-bold ml-2">
              {email ? <CustomAvatar email={email} /> : "Chat With"}
            </h2>
            <MoreVertIcon className="text-slate-400" />
          </div>
          {email ? (
            <ChatPlatform userEmail={user.email} />
          ) : (
            <div>
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-4 p-2 rounded-lg bg-slate-300 text-slate-950 focus:outline-0"
              />
                   <button className="bottom-0 right-0 ml-2  sticky z-50 text-blue-400 px-3 py-1 border border-blue-500 rounded-lg" onClick={()=>setHasChatHistory(!hasChatHistory)}>All</button>

              <div className="max-h-80 overflow-y-scroll">
                {hasChatHistory ? (
                  filteredChatUsers.length > 0 ? (
                    filteredChatUsers.map((chatUser, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-start mb-2 bg-slate-800 rounded-lg p-2 hover:bg-slate-700 hover:cursor-pointer"
                        onClick={() => {
                          setEmail(chatUser.email);
                          setUnreadCounts((prevCounts) => ({
                            ...prevCounts,
                            [chatUser.email]: 0,
                          }));
                        }}
                      >
                        <CustomAvatar email={chatUser.email} />
                        <div className="ml-8 flex justify-between w-full pr-4">
                          <div
                            className={`text-slate-400 text-sm truncate ${
                              unreadCounts[chatUser.email] ? "font-bold" : ""
                            }`}
                          >
                            {chatUser.lastMessage}
                          </div>
                          {unreadCounts[chatUser.email] > 0 && (
                          <div className="bg-blue-500 text-white rounded-full px-2 mr-6 text-xs">
                            {unreadCounts[chatUser.email]}
                          </div>
                        )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">No matching users found</div>
                  )
                ) : (
                  <div className="flex flex-col gap-4">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, idx) => (
                        <div
                          key={idx}
                          className="hover:bg-slate-600 cursor-pointer p-3 rounded-lg"
                          onClick={() => setEmail(user.email)}
                        >
                          <CustomAvatar email={user.email} />
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400">No matching users found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageResponsive;
