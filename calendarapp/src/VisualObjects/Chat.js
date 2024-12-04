
import React, { useState } from "react";
import "./Chat.css"; // Create a separate CSS file for styling

const Chat = ({ group, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setMessages([...messages, inputMessage]);
      setInputMessage("");
    }
  };

  return (
    <div className="chat-popup" style={{zIndex:1000}}>
      <div className="chat-header">
        <h3 class="chatName">Chat: {group.name}</h3>
        <button className="closeButton" onClick={onClose}>Close</button>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="submit" type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
