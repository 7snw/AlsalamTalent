
const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("sib-api-v3-sdk");

// ---------- SMTP builder (fallback) ----------
function buildTransport() {
  if (process.env.SMTP_HOST) {
    const secure =
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
      Number(process.env.SMTP_PORT) === 465;

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  return nodemailer.createTransport({ jsonTransport: true });
}

// ---------- Brevo API client (primary) ----------
let brevoApi = null;
const USE_BREVO_API =
  (process.env.EMAIL_PROVIDER || "").toLowerCase() === "brevo_api" &&
  !!process.env.BREVO_API_KEY;

if (USE_BREVO_API) {
  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
  brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
  console.log("[mail] Using Brevo API. From:", process.env.FROM_EMAIL);
}

// ---------- Main helper ----------
/**
 * sendEmail({ to, subject, text, html, cc, bcc, replyTo, attachments })
 * attachments: nodemailer-style array: [{ filename, path } or { filename, content<Buffer|string> }]
 */
async function sendEmail({
  to,
  subject,
  text,
  html,
  cc,
  bcc,
  replyTo,
  attachments,
}) {
  if (!to) return;

// Always use the verified Brevo sender (trim removes stray CR/LF/spaces)
const fromEmail = (process.env.FROM_EMAIL || process.env.EMAIL_USER || 'control@ctrlz.bh').trim();
const fromName  = (process.env.FROM_NAME || 'ctrlZ').trim();

if (brevoApi) {
  const normalizeList = (value) => {
    if (!value) return undefined;
    const arr = Array.isArray(value) ? value : String(value).split(",");
    return arr
      .map(e => (typeof e === "string"
        ? { email: e.trim() }
        : { email: String(e.email || "").trim(), name: e.name?.trim() }))
      .filter(x => x.email);
  };

  const mappedAttachments = attachments && attachments.map(att => {
    if (att.path && /^https?:\/\//i.test(att.path)) return { url: att.path, name: att.filename || undefined };
    if (att.content) {
      const buf = Buffer.isBuffer(att.content) ? att.content : Buffer.from(String(att.content));
      return { name: att.filename || "attachment", content: buf.toString("base64") };
    }
    if (att.path) {
      const fs = require("fs"), path = require("path");
      const data = fs.readFileSync(att.path);
      return { name: att.filename || path.basename(att.path), content: data.toString("base64") };
    }
    return null;
  }).filter(Boolean);

  // Build SendSmtpEmail by assigning fields explicitly
  const payload = new SibApiV3Sdk.SendSmtpEmail();
  payload.sender      = { email: fromEmail, name: fromName };
  payload.to          = normalizeList(to) || [];
  if (cc)   payload.cc   = normalizeList(cc);
  if (bcc)  payload.bcc  = normalizeList(bcc);
  if (replyTo) payload.replyTo = { email: String(replyTo).trim() };
  payload.subject     = subject || "(no subject)";
  if (html) payload.htmlContent = html;
  if (text) payload.textContent = text;
  if (mappedAttachments?.length) payload.attachment = mappedAttachments;

  // sanity log
  console.log("[mail] Brevo payload sender:", JSON.stringify(payload.sender));

  try {
    const res = await brevoApi.sendTransacEmail(payload);
    return { provider: "brevo", id: res?.messageId || res?.messageIds?.[0], raw: res };
  } catch (err) {
    console.error("Brevo API error, falling back to SMTP:", err?.response?.text || err.message);
    const transporter = buildTransport();
    return transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to, cc, bcc, replyTo, subject, text, html, attachments,
    });
  }
}



  // --- Pure SMTP path (if API disabled) ---
  const transporter = buildTransport();
  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    cc,
    bcc,
    replyTo,
    subject,
    text,
    html,
    attachments,
  });
}

module.exports = sendEmail;
