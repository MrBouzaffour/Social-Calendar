import React, { useState } from "react";
import "./Chat.css"; // Ensure updated CSS for styling

const Chat = ({ group = { name: "Global Chat" }, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [position, setPosition] = useState({ bottom: 20, right: 20 }); // Initial position

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, sender: "You", timestamp: new Date() }]);
      setInputMessage("");
    }
  };

  const handleDragStart = (e) => {
    const offsetX = e.clientX - position.right;
    const offsetY = e.clientY - position.bottom;

    const onMouseMove = (event) => {
      const newRight = window.innerWidth - event.clientX - 350; // Chat width is 350px
      const newBottom = window.innerHeight - event.clientY - 500; // Chat height is 500px
      setPosition({ bottom: newBottom, right: newRight });
    };

    document.addEventListener("mousemove", onMouseMove);

    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", onMouseMove);
      },
      { once: true }
    );
  };

  return (
    <div
      className="draggable-chat-container"
      style={{
        position: "fixed",
        bottom: position.bottom,
        right: position.right,
        zIndex: 1000,
      }}
      onMouseDown={handleDragStart}
    >
      <div className="modern-chat-header">
        <h3>{group.name}</h3>
        {onClose && <button className="modern-chat-close" onClick={onClose}>&times;</button>}
      </div>
      <div className="modern-chat-body">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={`modern-chat-message ${message.sender === "You" ? "self" : "other"}`}>
              <p className="message-text">{message.text}</p>
              <span className="message-timestamp">{message.timestamp.toLocaleTimeString()}</span>
            </div>
          ))
        ) : (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        )}
      </div>
      <form className="modern-chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="modern-chat-input"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit" className="modern-chat-send">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
