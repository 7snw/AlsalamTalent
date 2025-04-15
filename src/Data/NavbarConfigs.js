// src/Data/NavbarConfigs.js

export const NavConfig1 = [
  { label: 'Home', path: '/landingpage' },
  { label: 'About us', path: '/aboutUs' }
];

export const NavConfig2 = Object.assign([
  { label: 'Home', path: '/freelancer-home' },
  {
    label: 'Projects', 
    //path: '/all-projects',
    dropdown: [
      { label: 'Browse Projects', path: '/all-projects' },
      { label: 'My Projects', path: '/my-projects' },
      { label: 'Saved Projects', path: '/saved-projects' },
      { label: 'My Applications', path: '/my-applications' },
      { label: 'Submit a Project', path: '/submit-project' }
    ]
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'About us', path: '/freelanceraboutus' }
], {
  showIcons: true,
  hideSignIn: true
});



export const NavConfig3 = Object.assign([
  { label: 'Home', path: '/clienthome' },
  {
    label: 'Projects',
    dropdown: [
      { label: 'Browse Projects', path: '/browseprojects' },
      { label: 'Post Project Brief', path: '/PostProject' },
      { label: 'Assigned Projects', path: '/AssignedProject' },
      { label: 'Submitted Projects', path: '/submittedprojects' },
      { label: 'Project Applications', path: '/project-applications' }
    ]
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'Analytics', path: '/AnalyticsClient' }
], { 
  showIcons: true,
  hideSignIn: true 
});


export const NavConfig4 = Object.assign([
  { label: 'Home', path: '/analyticsadmin' },
  {
    label: 'Projects', path: '/adminallprojects' 
   
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'Users', path: '/userslist' }
], {
  showIcons: true,
  hideSignIn: true
});

