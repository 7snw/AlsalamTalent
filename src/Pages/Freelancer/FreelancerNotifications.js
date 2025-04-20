import React from 'react';
import '../../Style/Freelancer/FreelancerNotifications.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';

const notifications = [
  'Updates and revision are needed for the progress of recent completed projects.',
  'The project "Editing for Summer Ads Content" by Sarah Jassim Ali has been submitted.',
  'New freelancers just registered to the platform, check them out !!',
  "Reminder: You haven't checked on recent project applications, don't forget to check them out !!",
  'When was the last time you visited the chat tab? There are 15 pending messages in the chat, have a look at them to not miss any important updates.',
  'The analytics graph has been looking promising, visit the analytics tab to make sure you’re on track.'
];

const FreelancerNotifications = () => {
  return (
    <div className="notifications-page">
      <Navbar links={NavConfig2} />
      <div className="notifications-container2">
        <h2>Notifications</h2>
        <ul className="notification-list">
          {notifications.map((note, idx) => (
            <li key={idx}>
              <span className="bell-icon">🔔</span>
              <p>{note}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FreelancerNotifications;
