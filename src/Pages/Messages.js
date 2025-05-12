import React, { useState, useEffect, useRef } from "react";
import "../Style/Messages.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaTrash, FaPaperPlane } from "react-icons/fa";
import { FiPaperclip } from "react-icons/fi";

const socket = io("http://localhost:5000");

const Messages = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [searchContact, setSearchContact] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const capitalize = (str) => {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) return;
  const parsed = JSON.parse(stored);
  setUser(parsed);

  if (location.state?.userToChat) {
    setRecipient(location.state.userToChat);
  }

  axios
    .get(`http://localhost:5000/api/messages/latest/${parsed._id}`)
    .then((res) => {
      const recent = res.data.map((msg) => {
        const isSender = msg.senderId === parsed._id;
        return {
          _id: isSender ? msg.receiverId : msg.senderId,
          fullName: isSender ? msg.receiverName : msg.senderName,
          role: isSender ? msg.receiverRole : msg.senderRole,
          preview: msg.content,
          timestamp: msg.timestamp,
        };
      });
      recent.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setContacts(recent);

      //  Automatically select latest contact if none selected
      if (!location.state?.userToChat && recent.length > 0) {
        setRecipient(recent[0]);
      }
    })
    .catch((err) => console.error("Failed to load recent chats", err));
}, [location.state]);


  useEffect(() => {
    if (!user || !recipient) return;
    const roomId = [user._id, recipient._id].sort().join("-");
    socket.emit("joinRoom", roomId);
    axios
      .get(`http://localhost:5000/api/messages/${roomId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to load messages:", err));
  }, [user, recipient]);

useEffect(() => {
  const handleReceive = (msg) => {
    // Prevent duplicates by checking the message ID and timestamp
    setMessages((prev) => {
      const isDuplicate = prev.some(
        (m) =>
          m.senderId === msg.senderId &&
          m.receiverId === msg.receiverId &&
          m.timestamp === msg.timestamp &&
          m.content === msg.content
      );
      return isDuplicate ? prev : [...prev, msg];
    });
  };

  socket.on("receiveMessage", handleReceive);

  return () => {
    socket.off("receiveMessage", handleReceive);
  };
}, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior:"smooth",block:"nearest" });
    }
  }, [messages]);

  const sendMessage = () => {
  if (!messageInput.trim() || !user || !recipient) return;

  const roomId = [user._id, recipient._id].sort().join("-");
  const timestamp = new Date().toISOString();

  const msgData = {
    senderId: user._id,
    receiverId: recipient._id,
    senderRole: capitalize(user.role),
    receiverRole: capitalize(recipient.role || "freelancer"),
    senderName: user.fullName,
    receiverName: recipient.fullName,
    content: messageInput.trim(),
    roomId,
    attachments: [],
    timestamp,
  };

  socket.emit("sendMessage", msgData);

  setContacts((prev) => {
    const updated = {
      _id: recipient._id,
      fullName: recipient.fullName,
      role: recipient.role,
      preview: msgData.content,
      timestamp,
    };
    const others = prev.filter((c) => c._id !== recipient._id);
    return [updated, ...others];
  });

  setMessageInput("");
};


const handleAttachmentUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length || !user || !recipient) return;

  const formData = new FormData();
  files.forEach((file) => formData.append("attachments", file));

  try {
    const res = await axios.post("http://localhost:5000/api/upload-message-files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const uploaded = res.data.files;
    const roomId = [user._id, recipient._id].sort().join("-");
    const timestamp = new Date().toISOString();

    const msgData = {
      senderId: user._id,
      receiverId: recipient._id,
      senderRole: capitalize(user.role),
      receiverRole: capitalize(recipient.role || "freelancer"),
      senderName: user.fullName,
      receiverName: recipient.fullName,
      content: "[Attachment]",
      roomId,
      attachments: uploaded,
      timestamp,
    };

    socket.emit("sendMessage", msgData); // No direct setMessages
  } catch (err) {
    console.error("Attachment upload failed:", err);
    alert("Failed to upload file.");
  }
};

  const handleNewChat = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/all");
      const others = res.data.filter((u) => u._id !== user._id);
      setAllUsers(others);
      setShowAll(true);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const getNavbar = () => {
    if (!user || !user.role) return [];
    switch (user.role.toLowerCase()) {
      case "admin": return NavConfig4;
      case "client": return NavConfig3;
      case "freelancer": return NavConfig2;
      default: return [];
    }
  };

  return (
    <div className="messages-page">
      <Navbar links={getNavbar()} />
      <div className="title"><p> Messages</p></div>
      <div className="messages-container2">
        <aside className="chat-sidebar">
          <h3>{showAll ? "Start New Chat" : "Chats"}</h3>
          {showAll ? (
            <>
              <input
                type="text"
                placeholder="Search users..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="contact-search"
              />
              <ul>
                {allUsers
                  .filter((u) =>
                    (u.fullName || u.email).toLowerCase().includes(searchContact.toLowerCase())
                  )
                  .map((u) => (
                    <li key={u._id} onClick={() => {
                      setRecipient(u);
                      setShowAll(false);
                    }}>
                      {u.fullName || u.email}
                    </li>
                  ))}
              </ul>
            </>
          ) : (
            <>
              <ul>
                {contacts.map((c, i) => (
                  <li key={i} className="chat-item">
                    <div className="chat-info" onClick={() => setRecipient(c)}>
                      <div className="chat-name">{c.fullName || c.email}</div>
                      <div className="last-msg">{c.preview?.slice(0, 25)}...</div>
                    </div>
                    <button className="delete-chat-btn" onClick={async (e) => {
                      e.stopPropagation();
                      const roomId = [user._id, c._id].sort().join("-");
                      if (window.confirm("Are you sure you want to delete this chat?")) {
                        try {
                          await axios.delete(`http://localhost:5000/api/messages/room/${roomId}`);
                          setContacts((prev) => prev.filter((contact) => contact._id !== c._id));
                          if (recipient?._id === c._id) setRecipient(null);
                        } catch (err) {
                          alert("Failed to delete chat.");
                        }
                      }
                    }}>
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
              <button className="new-chat-btn" onClick={handleNewChat}>New chat</button>
            </>
          )}
        </aside>

        <div className="chat-window3">
          <div className="chat-header">
            {recipient
              ? `Chat with ${recipient.fullName || recipient.email}`
              : "Select a contact to start chatting"}
          </div>

          <div className="chat-messages3">
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.senderId === user._id ? "msg-right3" : "msg-left3"}`}>
                {msg.content && msg.content !== "[Attachment]" && (
                  <p>{msg.content}</p>
                )}
                {msg.attachments?.length > 0 && (
                  <div className="attachment-list">
                    {msg.attachments.map((file, j) => (
                      <div key={j} className="attachment-item">
                        {/\.(jpg|jpeg|png|gif|webp)$/i.test(file.url) ? (
                          <img
                            src={`http://localhost:5000${file.url}`}
                            alt={file.name}
                            className="chat-attachment-image"
                          />
                        ) : (
                          <a
                            href={`http://localhost:5000${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chat-attachment-link"
                          >
                            <FiPaperclip className="paperclip-icon" />
                            {file.name}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* ✅ Hidden input and upload handler */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleAttachmentUpload}
            style={{ display: "none" }}
          />

          {recipient && (
            <div className="chat-input">
              <button
                className="plus-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiPaperclip />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="send-btn" onClick={sendMessage}>
                <FaPaperPlane />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
