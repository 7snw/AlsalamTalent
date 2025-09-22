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
       { label: 'Assigned Projects', path: '/Assignedprojects' }, 
       { label: 'My Applications', path: '/myapplications' },
      { label: 'Saved Projects', path: '/savedprojects' },
     

    ]
  },
  { label: 'Freelancers', path: '/freelancers' },
    { label: 'Library', path: '/library' },
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
      { label: 'Post Projects', path: '/PostProject' },
      { label: 'Post Resources', path: '/resources' },
      { label: 'Assigned Projects', path: '/AssignedProject' },
      { label: 'Project Applications', path: '/project-applications' },
      { label: 'Payments', path: '/payments' }

    ]
  },
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'Analytics', path: '/AnalyticsClient' },
    { label: 'Bookings', path: '/bookingsTable' },
    { label: 'Library', path: '/library' }
], { 
  showIcons: true,
  hideSignIn: true 
});

//Admin
export const NavConfig4 = Object.assign([
  { label: 'Home', path: '/analyticsadmin' },
  { label: 'Projects', path: '/adminallprojects' },
 { label: 'Freelancers',
     dropdown: [
      { label: 'Freelncers List', path: '/freelancers' },
       { label: 'Freelancers Details', path: '/freelancersDetails' }
    ] },
  { label: 'Clients', path: '/clientlist' }
], {
  showIcons: true,
  hideSignIn: true
});

