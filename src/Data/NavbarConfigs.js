// src/Data/NavbarConfigs.js

//General
export const NavConfig1 = [
  { label: 'Home', path: '/landingpage' },
  { label: 'About us', path: '/aboutUs' }
];


//Freelancer
export const NavConfig2 = Object.assign([
  { label: 'Home', path: '/freelancer-home' },
  {
    label: 'Projects', 
    //path: '/all-projects',
    dropdown: [
      { label: 'Browse Projects', path: '/allprojects' },
      { label: 'My Projects', path: '/myprojects' },
      { label: 'Saved Projects', path: '/savedprojects' },
      { label: 'My Applications', path: '/myapplications' },
      { label: 'Submit a Project', path: '/submitproject' }
    ]
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'About us', path: '/aboutus' }
], {
  showIcons: true,
  hideSignIn: true
});


//Client
export const NavConfig3 = Object.assign([
  { label: 'Home', path: '/clienthome' },
  {
    label: 'Projects',
    dropdown: [
      { label: 'Browse Projects', path: '/browseprojects' },
      { label: 'Post Project Brief', path: '/PostProject' },
      { label: 'Assigned Projects', path: '/AssignedProject' },
      { label: 'Project Applications', path: '/project-applications' }
    ]
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'Analytics', path: '/AnalyticsClient' }
], { 
  showIcons: true,
  hideSignIn: true 
});

//Admin
export const NavConfig4 = Object.assign([
  { label: 'Home', path: '/analyticsadmin' },
  {
    label: 'Projects', path: '/adminallprojects' 
   
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'Clients', path: '/clientlist' }
], {
  showIcons: true,
  hideSignIn: true
});

