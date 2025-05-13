import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "../Style/ChatBox.css";

const socket = io("http://localhost:5000");

const ChatBox = ({ userId, otherUserId, role, assignmentId, closeChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const roomId = assignmentId ? `assignment-${assignmentId}` : null;

  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", roomId);

    const loadMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${roomId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to load chat history:", err);
      }
    };

    loadMessages();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!userId || !otherUserId || !roomId) {
      console.error("❌ senderId, receiverId, or roomId is missing!");
      return;
    }

    const message = {
      senderId: userId,
      receiverId: otherUserId,
      content: input,
      roomId,
      senderRole: role,
      receiverRole: role === "Client" ? "Freelancer" : "Client"
    };

    socket.emit("sendMessage", message);
    setInput("");
  };

  return (
    <div className="chatbox">
      <div className="chat-header">
        <span>Project Chat</span>
        <button className="close-btn" onClick={closeChat}>✖</button>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.senderId === userId ? "chat-message own" : "chat-message other"}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
