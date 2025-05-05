import React, { useState, useEffect, useRef } from "react";
import "../Style/Freelancer/FreelancerMessages.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig1, NavConfig2, NavConfig3 } from "../Data/NavbarConfigs";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Messages = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    setUser(parsed);
    socket.emit("joinRoom", parsed._id);
  }, []);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:5000/api/messages/${user._id}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to load messages:", err));
  }, [user]);

  useEffect(() => {
    const handleReceive = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim() || !user) return;

    const msgData = {
      senderId: user._id,
      receiverId: user._id,
      senderRole: capitalize(user.role),
      receiverRole: capitalize(user.role),
      content: messageInput.trim(),
      roomId: user._id,
      attachments: []
    };

    socket.emit("sendMessage", msgData);
    setMessageInput("");
  };

  if (!user) return <div>Loading user...</div>;

  const getNavbar = () => {
    if (!user || !user.role) return [];
    switch (user.role.toLowerCase()) {
      case "admin":
        return NavConfig1;
      case "client":
        return NavConfig3;
      case "freelancer":
        return NavConfig2;
      default:
        return [];
    }
  };

  return (
    <div className="messages-page">
      <Navbar links={getNavbar()} />
      <h2 className="page-title3">Messages</h2>

      <div className="messages-container2">
        <div className="chat-window">
          <div className="chat-header">Chat with Yourself</div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <p
                key={i}
                className={msg.senderId.toString() === user._id ? "msg-right" : "msg-left"}
                >
                {msg.content}
              </p>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <button className="plus-btn">+</button>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="send-btn" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Messages;
