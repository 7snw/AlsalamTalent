import React, { useState, useEffect, useRef } from "react";
import "../Style/Messages.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaTrash, FaPaperPlane } from "react-icons/fa";
import { FiPaperclip} from "react-icons/fi";
import userIcon from "../Assets/ProfileImage.png";
import { showAlert } from "../utils/toastMessages";
import ConfirmationModal from "../Components/ConfirmationModal";

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
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [preview, setPreview] = useState({ open: false, url: "", name: "" });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const capitalize = (str) =>
    str?.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  /* -------- Load user, recent chats -------- */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const parsed = JSON.parse(stored);
    setUser(parsed);

    if (location.state?.userToChat) setRecipient(location.state.userToChat);

    axios
      .get(`http://localhost:5000/api/messages/latest/${parsed._id}`)
      .then((res) => {
        const recent = (res.data || []).map((msg) => {
          const isSender = msg.senderId === parsed._id;
          return {
            _id: isSender ? msg.receiverId : msg.senderId,
            fullName: isSender ? msg.receiverName : msg.senderName,
            role: isSender ? msg.receiverRole : msg.senderRole,
            profileImageUrl: isSender
              ? msg.receiverProfileImage
              : msg.senderProfileImage,
            preview: msg.content,
            timestamp: msg.timestamp,
          };
        });
        recent.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setContacts(recent);
        if (!location.state?.userToChat && recent.length > 0) {
          setRecipient(recent[0]);
        }
      })
      .catch((err) => console.error("Failed to load recent chats", err));
  }, [location.state]);

  /* -------- Load messages for active conversation -------- */
  useEffect(() => {
    if (!user || !recipient) return;
    const roomId = [user._id, recipient._id].sort().join("-");
    socket.emit("joinRoom", roomId);

    axios
      .get(`http://localhost:5000/api/messages/${roomId}`)
      .then((res) => setMessages(res.data || []))
      .catch((err) => console.error("Failed to load messages:", err));
  }, [user, recipient]);

  /* -------- Realtime receive -------- */
  useEffect(() => {
    const handleReceive = (msg) => {
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
    return () => socket.off("receiveMessage", handleReceive);
  }, []);

  /* -------- Auto scroll -------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  /* -------- Send text message -------- */
  const sendMessage = () => {
    if (!messageInput.trim() || !user || !recipient) return;

    if (
      user.role.toLowerCase() === "freelancer" &&
      recipient.role?.toLowerCase() === "admin"
    ) {
      showAlert("Freelancers cannot send messages to the platform admin.");
      return;
    }

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
        profileImageUrl: recipient.profileImageUrl,
        preview: msgData.content,
        timestamp,
      };
      const others = prev.filter((c) => c._id !== recipient._id);
      return [updated, ...others];
    });

    setMessageInput("");
  };

  /* -------- Upload & send attachments -------- */
  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user || !recipient) return;

    if (
      user.role.toLowerCase() === "freelancer" &&
      recipient.role?.toLowerCase() === "admin"
    ) {
      showAlert("Freelancers cannot send messages to the platform admin.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("attachments", file));

    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload-message-files",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploaded = res.data.files || [];
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

      socket.emit("sendMessage", msgData);
      // Clear file input so same file can be re-selected if desired
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Attachment upload failed:", err);
      showAlert("Failed to upload file.");
    }
  };

  /* -------- New chat flow -------- */
  const handleNewChat = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/all");
      let others = (res.data || []).filter((u) => u._id !== user._id);

      if (user.role.toLowerCase() === "freelancer") {
        others = others.filter((u) => u.role.toLowerCase() !== "admin");
      }

      setAllUsers(others);
      setShowAll(true);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleConfirmDelete = async () => {
    const c = confirmDelete;
    if (!c || !user) return;

    try {
      const roomId = [user._id, c._id].sort().join("-");
      await axios.delete(`http://localhost:5000/api/messages/room/${roomId}`);
      setContacts((prev) => prev.filter((contact) => contact._id !== c._id));
      if (recipient?._id === c._id) {
        setRecipient(null);
        setMessages([]);
      }
    } catch (err) {
      showAlert("Failed to delete chat.");
    } finally {
      setConfirmDelete(null);
    }
  };

  /* -------- Navbar config -------- */
  const getNavbar = () => {
    if (!user || !user.role) return [];
    switch (user.role.toLowerCase()) {
      case "admin":
        return NavConfig4;
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

      <div className="title">
        <p>Messages</p>
      </div>

      <div className="messages-container2">
        {/* Sidebar */}
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
                    (u.fullName || u.email || "")
                      .toLowerCase()
                      .includes(searchContact.toLowerCase())
                  )
                  .map((u) => (
                    <li
                      key={u._id}
                      className="new-chat-item1"
                      onClick={async () => {
                        try {
                          const res = await axios.get(
                            `http://localhost:5000/api/users/${u._id}`
                          );
                          const fullUser = res.data;
                          setRecipient({
                            _id: fullUser._id,
                            fullName: fullUser.fullName,
                            email: fullUser.email,
                            role: fullUser.role,
                            profileImageUrl: fullUser.profileImageUrl,
                          });
                          setShowAll(false);
                        } catch (err) {
                          console.error("Failed to fetch user profile:", err);
                        }
                      }}
                    >
                      <img
                        src={
                          u.profileImageUrl
                            ? u.profileImageUrl.startsWith("http")
                              ? u.profileImageUrl
                              : `http://localhost:5000${u.profileImageUrl}`
                            : userIcon
                        }
                        alt="Profile"
                        className="new-chat-user-img1"
                      />
                      <span>{u.fullName || u.email}</span>
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
                      <img
                        src={
                          c.profileImageUrl
                            ? c.profileImageUrl.startsWith("http")
                              ? c.profileImageUrl
                              : `http://localhost:5000${c.profileImageUrl}`
                            : userIcon
                        }
                        alt="Profile"
                        className="chat-contact-img"
                      />
                      <div className="chat-texts">
                        <div className="chat-name">{c.fullName || c.email}</div>
                        <div className="last-msg">
                          {(c.preview || "").slice(0, 25)}
                          {(c.preview || "").length > 25 ? "…" : ""}
                        </div>
                      </div>
                    </div>

                    <button
                      className="delete-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(c);
                      }}
                      title="Delete chat"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>

              <button className="new-chat-btn" onClick={handleNewChat}>
                New chat
              </button>
            </>
          )}
        </aside>

        {/* Chat window */}
        <div className="chat-window3">
          <div className="chat-header">
            {recipient ? (
              <div className="chat-header-content">
                {recipient.profileImageUrl && (
                  <img
                    src={
                      recipient.profileImageUrl.startsWith("http")
                        ? recipient.profileImageUrl
                        : `http://localhost:5000${recipient.profileImageUrl}`
                    }
                    alt="Profile"
                    className="recipient-profile-img"
                  />
                )}
                <span>{recipient.fullName || recipient.email}</span>
              </div>
            ) : (
              "Select a contact to start chatting"
            )}
          </div>

          <div className="chat-messages3">
            {messages.map((msg, i) => {
              const mine = user && msg.senderId === user._id;
              const hasText = msg.content && msg.content !== "[Attachment]";
              const attachments = msg.attachments || [];

              return (
                <div
                  key={i}
                  className={`message-group ${mine ? "rightt" : "leftt"}`}
                >
                  {hasText && (
                    <div className={`bubble ${mine ? "rightt" : "leftt"}`}>
                      <p>{msg.content}</p>
                    </div>
                  )}

                  {!!attachments.length && (
                    <div className="attach-row">
                      {attachments.map((file, j) => {
                        const url = file.url?.startsWith("http")
                          ? file.url
                          : `http://localhost:5000${file.url}`;
                        const isImg = /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(
                          file.url || ""
                        );

                        return (
                          <div key={j} className="attachment-item">
                            {isImg ? (
                              <img
                                src={url}
                                alt={file.name}
                                className="chat-attachment-image"
                                onClick={() =>
                                  setPreview({
                                    open: true,
                                    url,
                                    name: file.name || "image",
                                  })
                                }
                                title="Click to view"
                              />
                            ) : (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="chat-attachment-link"
                                download={file.name || true}
                                title="Open / Download"
                              >
                                <FiPaperclip className="paperclip-icon" />
                                {file.name || "File"}
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleAttachmentUpload}
            style={{ display: "none" }}
          />

          {/* Input row */}
          {recipient && (
            <div className="chat-input2">
              <button
                className="plus-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
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

              <button className="send-btn" onClick={sendMessage} title="Send">
                <FaPaperPlane />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <ConfirmationModal
          message={`Are you sure you want to delete your chat with ${confirmDelete.fullName}?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Image preview modal */}
      {preview.open && (
        <div
          className="img-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview({ open: false, url: "", name: "" })}
        >
          <div
            className="img-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
         

            <img src={preview.url} alt={preview.name} className="img-modal-img" />

          
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Messages;
