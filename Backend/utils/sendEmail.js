const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("sib-api-v3-sdk");

// ---------- SMTP builder (fallback) ----------
function buildTransport() {
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure =
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,                  // false for 587 (STARTTLS), true for 465
      requireTLS: port === 587,
      auth: {
        user: (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim(),
        pass: (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").trim(),
      },
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
  client.basePath = "https://api.sendinblue.com/v3"; // explicit
  client.authentications["api-key"].apiKey = (process.env.BREVO_API_KEY || "").trim();
  brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
  console.log("[mail] Using Brevo API. From:", (process.env.FROM_EMAIL || "").trim());
}

// ---------- Main helper ----------
/**
 * sendEmail({ to, subject, text, html, cc, bcc, replyTo, attachments })
 */
async function sendEmail({ to, subject, text, html, cc, bcc, replyTo, attachments }) {
  if (!to) return;

  const fromEmail = (process.env.FROM_EMAIL || process.env.EMAIL_USER || "control@ctrlz.bh").trim();
  const fromName  = (process.env.FROM_NAME || "ctrlZ").trim();

  // prefer Brevo API
  if (brevoApi) {
    const normalize = (v) => {
      if (!v) return undefined;
      const arr = Array.isArray(v) ? v : String(v).split(",");
      return arr.map(s => ({ email: String(typeof s === "string" ? s : s.email).trim() }))
                .filter(x => x.email);
    };

    const mappedAttachments = (attachments || []).map(att => {
      if (att.path && /^https?:\/\//i.test(att.path)) return { url: att.path, name: att.filename };
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

    const payload = new SibApiV3Sdk.SendSmtpEmail();
    payload.sender  = { email: fromEmail, name: fromName };
    payload.to      = normalize(to) || [];
    if (cc)  payload.cc  = normalize(cc);
    if (bcc) payload.bcc = normalize(bcc);
    if (replyTo) payload.replyTo = { email: String(replyTo).trim() };
    payload.subject = subject || "(no subject)";
    if (html) payload.htmlContent = html;
    if (text) payload.textContent = text;
    if (mappedAttachments.length) payload.attachment = mappedAttachments;

    try {
      const res = await brevoApi.sendTransacEmail(payload);
      return { provider: "brevo", id: res?.messageId || res?.messageIds?.[0], raw: res };
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.text || err?.response?.body || err.message;
      console.error(`[mail] Brevo API error (status ${status || "n/a"}):`, body);
      // fall back to SMTP
    }
  }

  // SMTP fallback (or primary if API disabled)
  const transporter = buildTransport();
  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to, cc, bcc, replyTo, subject, text, html, attachments,
  });
}

module.exports = sendEmail;
