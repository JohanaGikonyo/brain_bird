import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSelected } from '../store/useSection';
import SendIcon from '@mui/icons-material/Send';
import PostContent from './PostContent';
function ChatPlatform({ userEmail }) {
  const { email } = useSelected();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select('sender, recipient, content, timestamp, is_read')
          .or(`sender.eq.${email},recipient.eq.${email}`)
          .or(`sender.eq.${userEmail},recipient.eq.${userEmail}`)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        setMessages(data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    const markAsRead = async () => {
      try {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .or(`recipient.eq.${email},sender.eq.${userEmail}`);

        if (error) throw error;
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    fetchMessages().then(markAsRead);

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new;
        if (
          (newMsg.sender === userEmail && newMsg.recipient === email) ||
          (newMsg.sender === email && newMsg.recipient === userEmail)
        ) {
          setMessages((prevMessages) => [...prevMessages, newMsg]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail, email]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          sender: email,
          recipient: userEmail,
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // const handleKeyDown = (event) => {
  //   if (event.key === 'Enter') {
  //     sendMessage(); 
  //   }
  // };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col lg:flex-grow flex-grow h-full lg:h-full  bg-gray-800 text-white pt-5">
      <div className="flex-grow p-4 overflow-y-auto scrollbar-hide  pt-10" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {loading ? (
          <p className="text-center">Loading messages...</p>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === email ? 'justify-end' : 'justify-start'} items-start space-x-2`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs text-white break-words ${
                    message.sender === email ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                <PostContent content={message.content}/>  
                </div>
                <div className="text-gray-400 text-xs">{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="flex-none lg:p-1 bg-gray-600 rounded-lg w-full sticky bottom-0 lg:bottom-4 lg:mb-14">
        <div className="flex items-center space-x-2">
          <textarea
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            // onKeyDown={handleKeyDown}
            multiple
            
            placeholder="Type a message..."
            className="flex-grow p-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none resize-none overflow-hidden"
            />
          <button
            onClick={sendMessage}
            className="px-4 py-2 text-blue-500 rounded-lg hover:bg-gray-600 focus:outline-none"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPlatform;
