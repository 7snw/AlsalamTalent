import React, { useState } from 'react';
import '../../Style/Admin/FreelancerMessages.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';

const mockChats = [
  { name: 'Husain Alnahash', lastMessage: 'Likewise Husain thank you...' },
  { name: 'Sarah Ahmed Isa', lastMessage: 'The project needs some...' },
  { name: 'Maryam Jassim Ali', lastMessage: 'I received your work th...' },
  { name: 'Faisal Isa Fahad', lastMessage: 'Please send me your...' },
  { name: 'Ahmed Mohamed', lastMessage: 'The project will need...' }
];

const AdminMessages = () => {
  const [selectedChat, setSelectedChat] = useState(mockChats[0].name);

  return (
    <div className="messages-page">
      <Navbar links={NavConfig4} />
      <div className="messages-container">
        <div className="chat-sidebar">
          <h2>Messages</h2>
          <ul>
            {mockChats.map((chat, idx) => (
              <li key={idx} className={selectedChat === chat.name ? 'active' : ''} onClick={() => setSelectedChat(chat.name)}>
                <div className="profile-icon">👤</div>
                <div>
                  <strong>{chat.name}</strong>
                  <p>{chat.lastMessage}</p>
                </div>
              </li>
            ))}
          </ul>
          <button className="new-chat-btn">New chat</button>
        </div>

        <div className="chat-window">
          <div className="chat-header">{selectedChat}</div>
          <div className="chat-messages">
            <p className="msg-left">Good morning Fatima. The prototypes will be sent after the holiday. Thank you.</p>
            <p className="msg-right">Alright Husain! Looking forward.</p>
            <p className="msg-left">Eid Mubarak and enjoy your vacation!</p>
            <p className="msg-right">Likewise Husain thank you.</p>
          </div>
          <div className="chat-input">
            <button className="plus-btn">+</button>
            <input type="text" placeholder="Type a message..." />
            <button className="send-btn">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
