const projectsData = {
  deitailes: [
    {
      title: 'Re-branding social media presence',
      name: 'Sarah Ahmed Isa',
      image: require('../Assets/Projects/banner.png'),
      status: 'ongoing',
      category: 'Marketing',
      description: 'Refreshing branding of social media channels...',
      budget: '50 BHD',
      duration: '2 weeks',
      startDate: '2024-06-01',
      endDate: '2024-06-14',
      statuss: 'Open',
      coverImage: require('../Assets/Projects/banner.png'),
      files: '/files/rebranding-project.zip',
      docs: '/files/rebranding-contract.pdf',
      progress: '70%'
    },
    {
      title: 'Platform App UI Design',
      name: 'Khalid Omar',
      image: require('../Assets/Projects/Design.png'),
      status: 'ongoing',
      category: 'Graphic Design',
      description: 'UI/UX revamp for mobile application...',
      budget: '30 BHD',
      duration: '3 weeks',
      startDate: '2024-06-10',
      endDate: '2024-07-01',
      statuss: 'Closed',
      coverImage: require('../Assets/Projects/Design.png'),
      files: '/files/uiux-app.zip',
      docs: '/files/uiux-contract.pdf',
      progress: '100%'
    },
    {
      title: '3D Product Illustration',
      name: 'Aisha Noor',
      image: require('../Assets/Projects/illustration.png'),
      status: 'pending',
      category: 'Illustration',
      description: '3D illustrations for product marketing...',
      budget: '40 BHD',
      duration: '1 month',
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      statuss: 'Open',
      coverImage: require('../Assets/Projects/illustration.png'),
      files: '/files/3d-product.zip',
      docs: '/files/3d-product-contract.pdf',
      progress: '30%'
    },
    {
      title: 'Landing Page for Product',
      name: 'Lama Hassan',
      image: require('../Assets/Projects/Design.png'),
      status: 'open',
      category: 'Web Design',
      description: 'Design and develop a responsive landing page...',
      budget: '45 BHD',
      duration: '10 days',
      startDate: '2024-06-20',
      endDate: '2024-06-30',
      statuss: 'Open',
      coverImage: require('../Assets/Projects/Design.png'),
      files: '/files/landing-page.zip',
      docs: '/files/landing-contract.pdf',
      progress: '10%'
    },
    {
      title: 'Social Media Ads Campaign',
      name: 'Nada AlKhater',
      image: require('../Assets/Projects/socialmedia.png'),
      status: 'ongoing',
      category: 'Marketing',
      description: 'Create graphics and captions for social campaigns...',
      budget: '60 BHD',
      duration: '2 weeks',
      startDate: '2024-06-18',
      endDate: '2024-07-01',
      statuss: 'Open',
      coverImage: require('../Assets/Projects/socialmedia.png'),
      files: '/files/social-campaign.zip',
      docs: '/files/social-contract.pdf',
      progress: '45%'
    },
    {
      title: 'Packaging Redesign',
      name: 'Yousif AlHassan',
      image: require('../Assets/Projects/packaging.png'),
      status: 'ongoing',
      category: 'Product Design',
      description: 'Redesigning packaging to align with eco-friendly branding goals...',
      budget: '55 BHD',
      duration: '3 weeks',
      startDate: '2024-06-05',
      endDate: '2024-06-25',
      statuss: 'Open',
      coverImage: require('../Assets/Projects/packaging.png'),
      files: '/files/eco-packaging.zip',
      docs: '/files/eco-contract.pdf',
      progress: '20%'
    },
    {
      title: 'Illustrated Book Cover',
      name: 'Ameenah AlFarsi',
      image: require('../Assets/Projects/illustration.png'),
      status: 'ongoing',
      category: 'Illustration',
      description: 'Creating a custom hand-drawn book cover for a children’s fantasy novel...',
      budget: '70 BHD',
      duration: '3 weeks',
      startDate: '2024-06-15',
      endDate: '2024-07-05',
      statuss: 'Open',
      coverImage: require('../Assets/Projects/illustration.png'),
      files: '/files/book-cover.zip',
      docs: '/files/book-contract.pdf',
      progress: '50%'
    },
    {
      title: 'Web Development for Local Business',
      name: 'Ahmed Salman',
      image: require('../Assets/Projects/banner.png'),
      status: 'open',
      category: 'Web Design',
      description: 'Build a static site for a Bahraini coffee shop, with contact form and map...',
      budget: '100 BHD',
      duration: '1 month',
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      statuss: 'Open',
      coverImage: require('../Assets/Projects/banner.png'),
      files: '/files/web-bahrain.zip',
      docs: '/files/web-contract.pdf',
      progress: '5%'
    },
    {
      title: 'Brand Identity for New Startup',
      name: 'Nour AlQahtani',
      image: require('../Assets/Projects/Design.png'),
      status: 'ongoing',
      category: 'Graphic Design',
      description: 'Complete brand identity including logo, palette, typography, and mockups...',
      budget: '80 BHD',
      duration: '4 weeks',
      startDate: '2024-06-10',
      endDate: '2024-07-10',
      statuss: 'Open',
      coverImage: require('../Assets/Projects/Design.png'),
      files: '/files/branding-kit.zip',
      docs: '/files/branding-contract.pdf',
      progress: '65%'
    },
    {
      title: 'Ad Copywriting for E-commerce',
      name: 'Fatima Mahdi',
      image: require('../Assets/Projects/socialmedia.png'),
      status: 'closed',
      category: 'Marketing',
      description: 'Creating short, persuasive copy for e-commerce social media ads...',
      budget: '35 BHD',
      duration: '10 days',
      startDate: '2024-06-01',
      endDate: '2024-06-11',
      statuss: 'Closed',
      coverImage: require('../Assets/Projects/socialmedia.png'),
      files: '/files/copywriting.zip',
      docs: '/files/copywriting-contract.pdf',
      progress: '100%'
    }    
  ]
  ,

  submitted: [
    {
      title: 'Re-branding social media presence',
      name: 'Sarah Ahmed Isa',
      progress: '70%' ,
      image: require('../Assets/Projects/Design.png'),
    },
    {
      title: 'New in-house Platform app idea',
      name: 'Khalid Omar Mohamed',
      image: require('../Assets/Projects/socialmedia.png'),
    },
    {
      title: 'Filming High Quality Content',
      name: 'Safa Abdulla',
      image: require('../Assets/Projects/Design.png'),
    },
    {
      title: 'Posts for socials',
      name: 'Sarah Ahmed Isa',
      image: require('../Assets/Projects/illustration.png'),
    },
    {
      title: 'Creating variations of merch branding',
      name: 'Ahmed Jassim Salah',
      image: require('../Assets/Projects/socialmedia.png'),
    },
    {
      title: 'Phase one of a new project platform',
      name: 'Abdullah Qasim',
      image: require('../Assets/Projects/Design.png'),
    },
  ],

  applied: [
    {
      title: 'Website UX Redesign',
      client: 'Noura Salman',
      image: require('../Assets/Projects/illustration.png'),
      status: 'pending',
      appliedDate: '2024-06-01'
    },
    {
      title: 'Summer Ads Social Posts',
      client: 'Ali Rashed',
      image: require('../Assets/Projects/socialmedia.png'),
      status: 'pending',
      appliedDate: '2024-06-03'
    },
    {
      title: 'Summer Ads Social Posts',
      client: 'Ali Rashed',
      image: require('../Assets/Projects/socialmedia.png'),
      status: 'pending',
      appliedDate: '2024-06-03'
    },
    {
      title: 'Summer Ads Social Posts',
      client: 'Ali Rashed',
      image: require('../Assets/Projects/socialmedia.png'),
      status: 'pending',
      appliedDate: '2024-06-03'
    },
    {
      title: 'Summer Ads Social Posts',
      client: 'Ali Rashed',
      image: require('../Assets/Projects/socialmedia.png'),
      status: 'pending',
      appliedDate: '2024-06-03'
    }
  ],
};


export default projectsData;
//hhh