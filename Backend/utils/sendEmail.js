const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("sib-api-v3-sdk");

/* ============================================================
   🔧 SMTP Transport Builder (Fallback Only)
   ============================================================ */
function buildTransport() {
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure =
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
      port === 465;

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure, // false for 587, true for 465
      requireTLS: port === 587,
      auth: {
        user: (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim(),
        pass: (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").trim(),
      },
    });
  }

  // fallback to JSON transport (console only)
  return nodemailer.createTransport({ jsonTransport: true });
}

/* ============================================================
    Brevo API Client (Primary)
   ============================================================ */
let brevoApi = null;
const USE_BREVO_API =
  (process.env.EMAIL_PROVIDER || "").toLowerCase() === "brevo_api" &&
  !!process.env.BREVO_API_KEY;

if (USE_BREVO_API) {
  const client = SibApiV3Sdk.ApiClient.instance;
  client.basePath = "https://api.sendinblue.com/v3";
  client.authentications["api-key"].apiKey = (process.env.BREVO_API_KEY || "").trim();
  brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
  console.log("[mail] Using Brevo API. From:", (process.env.FROM_EMAIL || "").trim());
}

/* ============================================================
   📬 Helper: Normalize Recipients / Attachments
   ============================================================ */
const normalizeRecipients = (v) => {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : String(v).split(",");
  return arr
    .map((s) => ({ email: String(typeof s === "string" ? s : s.email).trim() }))
    .filter((x) => x.email);
};

const mapAttachments = (attachments = []) => {
  const fs = require("fs");
  const path = require("path");

  return attachments
    .map((att) => {
      if (att.path && /^https?:\/\//i.test(att.path))
        return { url: att.path, name: att.filename };

      if (att.content) {
        const buf = Buffer.isBuffer(att.content)
          ? att.content
          : Buffer.from(String(att.content));
        return { name: att.filename || "attachment", content: buf.toString("base64") };
      }

      if (att.path) {
        const data = fs.readFileSync(att.path);
        return {
          name: att.filename || path.basename(att.path),
          content: data.toString("base64"),
        };
      }

      return null;
    })
    .filter(Boolean);
};

/* ============================================================
   Main Function
   ============================================================ */
/**
 * sendEmail({ to, subject, text, html, cc, bcc, replyTo, attachments })
 */
async function sendEmail({ to, subject, text, html, cc, bcc, replyTo, attachments }) {
  if (!to) return;

  const fromEmail =
    (process.env.FROM_EMAIL || process.env.EMAIL_USER || "control@ctrlz.bh").trim();
  const fromName = (process.env.FROM_NAME || "ctrlZ").trim();

  /* ------------------------------------------------------------
     Try Brevo API (Primary)
     ------------------------------------------------------------ */
  if (brevoApi) {
    const payload = new SibApiV3Sdk.SendSmtpEmail();
    payload.sender = { email: fromEmail, name: fromName };
    payload.to = normalizeRecipients(to);
    if (cc) payload.cc = normalizeRecipients(cc);
    if (bcc) payload.bcc = normalizeRecipients(bcc);
    if (replyTo) payload.replyTo = { email: String(replyTo).trim() };
    payload.subject = subject || "(no subject)";
    if (html) payload.htmlContent = html;
    if (text) payload.textContent = text;

    const mappedAttachments = mapAttachments(attachments);
    if (mappedAttachments.length) payload.attachment = mappedAttachments;

    // 🔹 Send asynchronously, non-blocking
    (async () => {
      console.time("brevo_send_time");
      try {
        const res = await brevoApi.sendTransacEmail(payload);
        console.timeEnd("brevo_send_time");
        console.log(
          `[mail]  Brevo sent → ${payload.to.map((r) => r.email).join(", ")}`
        );
        return {
          provider: "brevo",
          id: res?.messageId || res?.messageIds?.[0],
          raw: res,
        };
      } catch (err) {
        console.timeEnd("brevo_send_time");
        const status = err?.response?.status;
        const body = err?.response?.text || err?.response?.body || err.message;
        console.error(`[mail] Brevo API error (${status || "n/a"}):`, body);
        console.log("[mail] ↩ Falling back to SMTP...");
        try {
          const transporter = buildTransport();
          await transporter.sendMail({
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
          console.log("[mail] SMTP fallback succeeded.");
        } catch (smtpErr) {
          console.error("[mail]  SMTP fallback failed:", smtpErr.message);
        }
      }
    })();

    // Return immediately (non-blocking)
    return { provider: "brevo", status: "queued" };
  }

  /* ------------------------------------------------------------
     If Brevo API not enabled → use SMTP directly
     ------------------------------------------------------------ */
  try {
    const transporter = buildTransport();
    await transporter.sendMail({
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
    console.log("[mail] SMTP mail sent.");
    return { provider: "smtp", status: "sent" };
  } catch (smtpErr) {
    console.error("[mail]  SMTP send failed:", smtpErr.message);
    throw smtpErr;
  }
}

module.exports = sendEmail;
