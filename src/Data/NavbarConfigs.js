// src/Data/NavbarConfigs.js

export const NavConfig1 = [
  { label: 'Home', path: '/' },
  { label: 'About us', path: '/aboutUs' }
];

export const NavConfig2 = Object.assign([
  { label: 'Home', path: '/freelancer-home' },
  {
    label: 'Projects',
    path: '/projects',
    dropdown: [
      { label: 'Browse Projects', path: '/browse-projects' },
      { label: 'My Projects', path: '/my-projects' },
      { label: 'Saved Projects', path: '/saved-projects' },
      { label: 'My Applications', path: '/my-applications' },
      { label: 'Submit a Project', path: '/submit-project' }
    ]
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'About us', path: '/aboutUs' }
], {
  showIcons: true,
  hideSignIn: true   // 👈 NEW FLAG
});

export const NavConfig3 = Object.assign([
  { label: 'Home', path: '/client-home' },
  {
    label: 'Projects',
    //path: '/',
    dropdown: [
      { label: 'Browse Projects', path: '/browse-projects' },
      { label: 'Post Project Brief', path: '/Clients/PostProject' },
      { label: 'Assigned Projects', path: '/Client/AssignedProject' },
      { label: 'Submitted Projects', path: '/submitted-projects' },
      { label: 'Project Applications', path: '/project-applications' }
    ]
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'Analytics', path: '/analytics' }
], { 
  showIcons: true,
  hideSignIn: true 
});

export const NavConfig4 = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'Users', path: '/users' }
];
