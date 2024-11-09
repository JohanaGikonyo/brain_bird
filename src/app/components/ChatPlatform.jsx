import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSelected } from '../store/useSection';

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
          .select('sender, recipient, content, timestamp')
          .or(`sender.eq.${email},recipient.eq.${email}`)
          .or(`sender.eq.${userEmail},recipient.eq.${userEmail}`)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        setMessages(data);
        setLoading(false);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        if (payload.new.sender === email || payload.new.recipient === email) {
          setMessages(prevMessages => [...prevMessages, payload.new]);
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
        console.log(userEmail)
        console.log(email)
      const { error } = await supabase.from('messages').insert([
        {
          sender: userEmail,
          recipient: email,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-800 text-white">
     
      <div className="flex-grow p-4 overflow-y-auto">
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
                  {message.content}
                </div>
                <div className="text-gray-400 text-xs">{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="flex-none p-4 bg-gray-900">
        <div className="flex items-center space-x-2 bottom-1 fixed lg:mr-4 lg:ml-1 lg:right-1 ">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPlatform;
