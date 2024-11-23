import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { TextField, Button, Box, List, ListItem, ListItemText } from "@mui/material";
import { useUser } from "../store/useStore";
import CustomAvatar from "./CustomAvatar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AllMembers from "./AllMembers";
import PostContent from "./PostContent";
import { format, isToday, isYesterday } from "date-fns";
// import { useShowTop } from "../store/useStore";

function GroupChat({ group, setSelectedGroup }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [viewAll, setViewAll] = useState(null);
  // const { showTop } = useShowTop();
  
  // Create a ref for the messages container
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch messages for the group
        const { data: messagesData, error } = await supabase
          .from("groupmessages")
          .select("*")
          .eq("group_id", group.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Update is_read field to true for all messages in the group
        await supabase.from("groupmessages").update({ is_read: true }).eq("group_id", group.id).is("is_read", false); // Only update unread messages (is_read = false)

        // Set the messages in state
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching or updating messages:", error);
      }
    };

    fetchMessages();
  }, [group.id]);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages

    try {
      const { error } = await supabase
        .from("groupmessages")
        .insert([{ group_id: group.id, user_email: user.email, content: newMessage }]);

      if (error) throw error;
      setNewMessage(""); // Clear the input field

      // Re-fetch messages or add the new message to the list
      setMessages((prevMessages) => [
        ...prevMessages,
        { user_email: user.email, content: newMessage, created_at: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (viewAll) {
    return <AllMembers group={viewAll} setViewAll={setViewAll} />;
  }

  function formatMessageDate(date) {
    const messageDate = new Date(date);
  
    if (isToday(messageDate)) {
      return `Today, ${format(messageDate, "p")}`; // e.g., "Today, 2:30 PM"
    } else if (isYesterday(messageDate)) {
      return `Yesterday, ${format(messageDate, "p")}`; // e.g., "Yesterday, 2:30 PM"
    } else {
      return format(messageDate, "MMM dd, p"); // e.g., "Nov 23, 2:30 PM"
    }
  }

  return (
    <div className={`flex flex-col h-full overflow-y-auto scrollbar-hide fixed mb-10 bottom-10 lg:top-10 top-0 z-50 lg:z-0 rounded-lg  bg-[#e5ddd5] lg:mt-10 w-full lg:w-auto `}>
      {/* Group Name Header */}
      <div className="bg-[#25D366]  text-white w-full p-4 flex items-center gap-5 text-center text-xl font-bold">
        <div onClick={() => setSelectedGroup(null)} className='hover:cursor-pointer'>
          <ArrowBackIcon />
        </div>
        <h2 onClick={() => setViewAll(group)} className='hover:cursor-pointer'>{group.name} Group</h2>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} className={`mb-3 flex ${message.user_email === user.email ? "justify-end" : ""}`}>
              <div className="flex items-center gap-2 flex-col">
                {/* Avatar */}
                <CustomAvatar email={message.user_email} color={"text-slate-700"} />

                {/* Message Bubble */}
                <div className={`rounded-lg p-3 max-w-[80%] ${message.user_email === user.email ? "bg-[#dcf8c6] text-black" : "bg-white text-black"}`}>
                  <ListItemText
                    primary={
                      <>
                        <PostContent content={message.content} />
                        <div className="text-gray-400 text-xs">{formatMessageDate(message.created_at)}</div>
                      </>
                    }
                    className={`whitespace-pre-line ${message.user_email === user.email ? "text-center" : ""}`}
                  />
                </div>
              </div>
            </ListItem>
          ))}
          {/* Scroll reference element */}
          <div ref={messagesEndRef} />
        </List>
      </div>
      <div className="flex-none lg:p-1  rounded-lg w-full sticky bottom-0 mb-0 lg:bottom-6 lg:mb-16">

      {/* Input Bar at the Bottom */}
      <Box className="p-4 bg-white border-t-2 border-gray-300 w-full flex gap-2">
        <TextField
          label="Type a message..."
          variant="outlined"
          fullWidth
          multiline
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="rounded-full"
          InputProps={{
            classes: { notchedOutline: "border-none" },
            style: { borderRadius: "20px" },
          }}
        />
       <div> <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          className="ml-2 rounded-full"
          style={{ backgroundColor: "#25D366", borderRadius: "20px" }}
        >
          Send
        </Button>
        </div>
      </Box>
      </div>
    </div>
  );
}

export default GroupChat;