const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ctrlz.bh';

const colors = {
  navy:'#0f1b2d', bg:'#82b5c4ff', card:'#ffffff', text:'#0f1b2d',
  sub:'#4c576d', line:'#d0d6e2', orange:'#f1633a', sky:'#cbe4ee', back:'#e7f1f4ff',
};

const base = {
 
  body: `margin:0;padding:24px;background:none;
         font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;`,

  box: `width:100%;max-width:660px;margin:0 auto;
        background:${colors.back};background-color:${colors.back};
        border-radius:10px;overflow:hidden;`,
  p:`margin:0 0 12px;line-height:1.5;color:${colors.text};font-size:16px;`,
  small:`color:${colors.sub};font-size:12px;`,
  btn:`display:inline-block;padding:8px 14px;border-radius:10px;text-decoration:none;
       font-weight:500;background:${colors.orange};background-color:${colors.orange};color:#fff;`,
  k:`margin:0;font-weight:700;color:${colors.text};`,
  v:`margin:0;color:${colors.text};`,
  hr:`border:none;border-top:1px solid ${colors.line};margin:18px 0;`,
};

const headerWavesSVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 640 140" width="640" height="140" preserveAspectRatio="none">
  <defs>
    <style>
      .logoText { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-weight: 700; }
    </style>
  </defs>

  <!-- Navy header -->
  <rect x="0" y="0" width="640" height="140" fill="${colors.navy}"/>

  <!-- ctrlZ vector logo (top-left) -->
  <g transform="translate(18,12)">
    <!-- "ctrl" -->
    <text x="0" y="0" class="logoText" fill="#ffffff" font-size="27" margin-top="30px" margin-left="14px" dominant-baseline="hanging">ctrl</text>

    <!-- orange rounded square with "Z" -->
    <rect x="50" y="0" width="24" height="24" rx="5" ry="5"  fill="${colors.orange}"/>
    <text x="62" y="12" class="logoText" fill="#ffffff" padding-top="20px" font-size="23" margin-top="20px" text-anchor="middle" dominant-baseline="middle">Z</text>
  </g>

  <!-- Light background wave (deep left, high right) -->
  <path d="M0,104 C 92,142 230,156 322,112 430,62 522,38 640,94 L640,140 L0,140 Z"
        fill="${colors.back}"/>

  <!-- Thin sky line -->
  <path d="M0,100 C 100,135 200,136 300,100 450,40 530,30 640,90"
        fill="none" stroke="${colors.sky}" stroke-width="3"
        stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>

  <!-- Thin orange line -->
  <path d="M0,95 C 95,139 220,145 310,108 445,45 520,32 640,92"
        fill="none" stroke="${colors.orange}" stroke-width="3"
        stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
</svg>`);

function shell({ title, greeting, bodyHTML }) {
  return `<!doctype html><html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <!-- Tell Apple Mail/iOS Mail to keep LIGHT colors -->
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <style>
      :root { color-scheme: light; supported-color-schemes: light; }
    </style>
    <title>${title}</title></head>
  <body style="${base.body}">
    <!-- Outer wrapper with bgcolor fallback -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${colors.back}"
           style="background:none;background-color:none;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" bgcolor="${colors.back}"
                 style="${base.box}">
            <tr>
              <td><img alt="" src="data:image/svg+xml;utf8,${headerWavesSVG}" width="640" height="140"
                       style="display:block;width:100%;height:auto;border:0;"/></td>
            </tr>
            <tr><td style="padding:8px 24px 4px 24px;"><p style="${base.p}">Hi ${greeting},</p></td></tr>
            <tr><td style="padding:4px 24px 0 24px;">${bodyHTML}</td></tr>
            <tr><td style="padding:6px 24px 0 24px;"><hr style="${base.hr}"/></td></tr>
            <tr><td style="padding:0 24px 24px 24px;">
              <p style="${base.small}">This is an automated message from ctrlZ. Please do not reply.</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body></html>`;
}



function paymentApproved({ name, projectTitle, amountBHD, method, iban }) {
  const body = `
    <p style="${base.p}">Your client has <strong>approved the payment</strong> for the project <strong>${projectTitle || ''}</strong>.</p>
    <p style="${base.p}">You’ll receive the payment soon.</p>
    <p style="${base.p}"><a href="${FRONTEND_URL}/payments/history" style="${base.btn}">Payments → History</a></p>
    <div style="margin-top:18px;padding-top:6px;">
  
    </div>`;
  return shell({ title:'Your payment was approved', greeting: name || 'there', bodyHTML: body });
}

function verificationCode({ name, code }) {
  const body = `
    <p style="${base.p}">Use the verification code below to continue:</p>
    <div style="margin:14px 0 8px 0;">
      <div style="display:inline-block;font-size:22px;font-weight:700;letter-spacing:3px;padding:10px 18px;border-radius:10px;background:${colors.sky};color:${colors.text};border:1px solid ${colors.line};">${String(code || '').replace(/\s+/g,'')}</div>
    </div>
    <p style="${base.small}">This code will expire in 10 minutes.</p>`;
  return shell({ title:'Your verification code', greeting: name || 'there', bodyHTML: body });
}

// To the freelancer
function applicationSubmitted({ name, projectTitle, projectLink }) {
  const body = `
    <p style="${base.p}">
      Your application to <strong>${projectTitle || 'the project'}</strong> was submitted successfully.
    </p>
    <p style="${base.p}">
      We’ve notified the client. You’ll get an update when they review it. You can check the project here:
    </p>
    <p style="${base.p}">
      <a href="${projectLink}" style="${base.btn}">View Project</a>
    </p>`;
  return shell({ title: 'Application submitted', greeting: name || 'there', bodyHTML: body });
}

// To the client
function newApplicationReceived({ name, freelancerName, projectTitle, reviewLink }) {
  const body = `
    <p style="${base.p}">
      <strong>${freelancerName || 'A freelancer'}</strong> has applied to your project
      <strong>${projectTitle || 'Project'}</strong>.
    </p>
    <p style="${base.p}">
      Review the application and take action:
    </p>
    <p style="${base.p}">
      <a href="${reviewLink}" style="${base.btn}">Review Applications</a>
    </p>`;
  return shell({ title: 'New application received', greeting: name || 'there', bodyHTML: body });
}

function assignmentAssigned({ name, projectTitle, projectLink }) {
  const body = `
    <p style="${base.p}">
      You’ve been <strong>assigned</strong> to the project
      <strong>${projectTitle || 'a new project'}</strong>.
    </p>
    <p style="${base.p}">
      Click below to open the project and get started:
    </p>
    <p style="${base.p}">
      <a href="${projectLink}" style="${base.btn}">Open Project</a>
    </p>`;
  return shell({ title: 'New project assigned', greeting: name || 'there', bodyHTML: body });
}



function newProjectAvailable({ name, projectTitle, projectLink, projectType }) {
  const body = `
    <p style="${base.p}">
      A new ${projectType || 'project'} titled
      <strong>${projectTitle || 'project'}</strong> has been posted.
    </p>

    <p style="${base.p}">
      <a href="${projectLink}" style="${base.btn}">View Project</a>
    </p>`;
  return shell({
    title: 'New Project Available!',
    greeting: name || 'there',
    bodyHTML: body,
  });
}

function studentWelcomePending({ name, dashboardLink }) {
  const body = `
    <p style="${base.p}">
     <strong> Welcome to ctrlZ!</strong> 
    </p>
    <p style="${base.p}">
      Start Your freelancing Journey Now
    </p>
    <p style="${base.p}">
      <a href="${dashboardLink}" style="${base.btn}">Explore Projects</a>
    </p>`;
  return shell({
    title: 'Welcome to ctrlZ!',
    greeting: name || 'there',
    bodyHTML: body,
  });
}

function adminNewStudentRegistered({
  adminName,
  fullName,
  studentId,
  email,
  phone,
  major,
  iban
}) {

  const row = (label, value) => `
    <tr>
      <td style="padding:2px 0; font-size:14px; line-height:1.4; color:${colors.text}; vertical-align:top;">
        <span style="display:inline-block; min-width:40px; font-weight:700;">${label}:</span>
        <span style="vertical-align:top;">${value || '-'}</span>
      </td>
    </tr>`;

  const body = `
    <p style="${base.p}">
      <strong>A new student has registered and is awaiting verification.</strong>
    </p>
    <div style="margin-top:8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
        ${row( studentId)}
        ${row(fullName)}
        ${row( email)}
        ${row(phone)}
        ${row( major)}
        ${row(iban)}
    
      </table>
    </div>`;

  return shell({
    title: 'New Student Registration - Verification Needed',
    greeting: adminName || 'Team',
    bodyHTML: body,
  });
}



function graduateWelcomePending({ name, dashboardLink }) {
  const body = `
    <p style="${base.p}">
      <strong> Welcome to ctrlZ!</strong> 
    </p>
    <p style="${base.p}">
      Start Your freelancing Journey Now
    </p>
    <p style="${base.p}">
      <a href="${dashboardLink}" style="${base.btn}">Explore Projects</a>
    </p>`;
  return shell({
    title: 'Welcome to ctrlZ!',
    greeting: name || 'there',
    bodyHTML: body,
  });
}

function adminNewGraduateRegistered({
  adminName,
  fullName,
  studentId,
  email,
  phone,
  major,
  iban
}) {
 
  const row = (label, value) => `
    <tr>
      <td style="padding:2px 0; font-size:14px; line-height:1.4; color:${colors.text}; vertical-align:top;">
        <span style="display:inline-block; min-width:40px; font-weight:700;">${label}:</span>
        <span style="vertical-align:top;">${value || '-'}</span>
      </td>
    </tr>`;

  const body = `
    <p style="${base.p}">
      <strong>A new graduate has registered and is awaiting verification.</strong>
    </p>
    <div style="margin-top:8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
     ${row( studentId)}
        ${row(fullName)}
        ${row( email)}
        ${row(phone)}
        ${row( major)}
        ${row(iban)}
      </table>
    </div>`;

  return shell({
    title: 'New Graduate Registration - Verification Needed',
    greeting: adminName || 'Team',
    bodyHTML: body,
  });
}


function accountVerified({ name, userType, dashboardLink }) {
  const body = `
    <p style="${base.p}">
      Great news! <br>
      Your account has been <strong>verified</strong>.
    </p>
    <p style="${base.p}">
      You can now explore projects
    </p>
    <p style="${base.p}">
      <a href="${dashboardLink}" style="${base.btn}">Go to Platform</a>
    </p>`;
  return shell({
    title: 'Your Account Has Been Verified!',
    greeting: name || 'there',
    bodyHTML: body,
  });
}

function invoiceForClient({ name, projectTitle, freelancerName, amountBHD, iban, method }) {
  const body = `
    <p style="${base.p}">
      Here are the invoice details of the freelancer for <strong>${projectTitle || 'your project'} project</strong>.
    </p>

    <div style="margin-top:12px;padding-top:6px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;${base.v}">${freelancerName || '—'}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">BHD ${Number(amountBHD || 0)}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">${method || 'Bank Transfer'}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">${iban || '—'}</td></tr>
      </table>
    </div>

    <p style="${base.p}"><a href="${FRONTEND_URL}/payments" style="${base.btn}">Payments Details</a></p>
  `;
  return shell({
    title: 'Invoice details',
    greeting: name || 'there',
    bodyHTML: body,
  });
}




function bookingConfirmedFreelancer({ name, space, dateISO, timeRange, studentId, notes }) {
  const body = `
    <p style="${base.p}">
      Your ${space || 'space'} booking is <strong>confirmed</strong>.
    </p>
    <div style="margin-top:12px;padding-top:6px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;${base.v}">${dateISO || '—'}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">${timeRange || '—'}</td></tr>
        ${notes ? `<tr><td style="padding:8px 0;${base.k}">Notes:</td><td style="padding:8px 0;${base.v}">${notes}</td></tr>` : ''}
      </table>
    </div>
    <p style="${base.p}">
   
    </p>`;
  return shell({ title: 'Booking confirmed', greeting: name || 'there', bodyHTML: body });
}


function bookingNewForClient({ name, space, dateISO, timeRange, freelancerName, freelancerEmail, studentId, notes }) {
  const body = `
    <p style="${base.p}">
      A new ${space || 'space'} booking has been made.
    </p>
    <div style="margin-top:12px;padding-top:6px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;${base.v}">${space || '—'}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">${dateISO || '—'}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">${timeRange || '—'}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">${freelancerName || '—'}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">${freelancerEmail || '—'}</td></tr>
        <tr><td style="padding:8px 0;${base.v}">${studentId || '—'}</td></tr>
        ${notes ? `<tr><td style="padding:8px 0;${base.k}">Notes:</td><td style="padding:8px 0;${base.v}">${notes}</td></tr>` : ''}
      </table>
    </div>
    <p style="${base.p}">
      <a href="${FRONTEND_URL}/bookings" style="${base.btn}">Open Bookings</a>
    </p>`;
  return shell({ title: 'New booking', greeting: name || 'there', bodyHTML: body });
}



function stageKeyToNice(stage) {
  if (stage === 'initial') return 'Initial Concept';
  if (stage === 'half') return '50% of the work';
  if (stage === 'final') return 'Final Submission';
  return 'Submission';
}

function stageSubmittedForClient({ name, projectTitle, stage, reviewLink, freelancerName }) {
  const body = `
    <p style="${base.p}">
      <strong>${freelancerName || 'Your freelancer'}</strong> has submitted files for
      <strong>${stageKeyToNice(stage)}</strong> in <strong>${projectTitle || 'your project'}</strong>.
    </p>
    <p style="${base.p}">
      Please review the submission and leave feedback:
    </p>
    <p style="${base.p}">
      <a href="${reviewLink}" style="${base.btn}">Review now</a>
    </p>`;
  return shell({ title: 'New stage submitted', greeting: name || 'there', bodyHTML: body });
}


function stageReviewedForFreelancer({ name, projectTitle, stage, status, feedback, openLink }) {
  const nice = stageKeyToNice(stage);
const pretty =
   status === 'reviewed'
     ? 'approved (reviewed)'
     : status === 'revision_requested'
     ? 'revision requested'
    : status === 'declined'
     ? 'declined'
     : status;

 const title =
   status === 'revision_requested'
     ? `Client requested revisions for your ${nice}`
     : `Client ${pretty} your ${nice}`;

  const body = `
    <p style="${base.p}">
    Your <strong>${nice}</strong> submission for <strong>${projectTitle || ''}</strong>
     ${status === 'revision_requested'
        ? 'requires <strong>revisions</strong>.'
        : `was <strong>${pretty}</strong>.`
     }
    </p>
    ${feedback ? `<p style="${base.p}"><strong>Client feedback:</strong><br>${feedback}</p>` : ''}
    <p style="${base.p}">
      <a href="${openLink}" style="${base.btn}">Open project</a>
    </p>`;
 return shell({ title, greeting: name || 'there', bodyHTML: body });
}


function finalRatedForFreelancer({ name, projectTitle, rating, feedback, openLink }) {
  const body = `
    <p style="${base.p}">
      Congratulations! Your <strong>Final Submission</strong> for <strong>${projectTitle || ''}</strong>
      was <strong>approved</strong>.
    </p>
    <p style="${base.p}">
      Client rating: <strong>${rating} / 5</strong>
    </p>
    ${feedback ? `<p style="${base.p}"><strong>Client feedback:</strong><br>${feedback}</p>` : ''}
    <p style="${base.p}">
      <a href="${openLink}" style="${base.btn}">View project</a>
    </p>`;
  return shell({ title: 'Final approved', greeting: name || 'there', bodyHTML: body });
}


function newChatMessageEmail({ name, fromName, openLink }) {
  const body = `
    <p style="${base.p}">
      You received a new message from <strong>${fromName || 'someone'}</strong>.
    </p>
    <p style="${base.p}">
      <a href="${openLink}" style="${base.btn}">Open chat</a>
    </p>`;
  return shell({ title: 'New message on ctrlZ', greeting: name || 'there', bodyHTML: body });
}


module.exports = {

  paymentApproved,
  verificationCode,
  applicationSubmitted,
  newApplicationReceived,
  assignmentAssigned,
  newProjectAvailable,
  studentWelcomePending,
  adminNewStudentRegistered,
  graduateWelcomePending,
  adminNewGraduateRegistered,
  accountVerified,
  invoiceForClient,
  bookingConfirmedFreelancer,
  bookingNewForClient,
  stageSubmittedForClient,
  stageReviewedForFreelancer,
  finalRatedForFreelancer,
  newChatMessageEmail
};

