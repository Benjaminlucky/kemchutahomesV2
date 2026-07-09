/**
 * utils/notifications.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual-channel notification system: Email (Resend) + SMS (Termii).
 *
 * SMS PROVIDER: Termii — https://termii.com
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY TERMII OVER TWILIO FOR NIGERIA:
 *   • Termii is Nigerian-native — onboard in under 10 minutes, no business
 *     registration document required to start testing.
 *   • DND (Do-Not-Disturb) channel: delivers to ALL Nigerian numbers including
 *     those registered on the NCC DND list. Twilio cannot do this without
 *     complex carrier-level workarounds.
 *   • Significantly cheaper per SMS unit for Nigerian local numbers.
 *   • No npm package needed — pure fetch to their REST API.
 *
 * HOW TO GET STARTED WITH TERMII (takes ~10 minutes):
 *   1. Sign up at https://termii.com — email only, no docs needed
 *   2. Dashboard → Settings → API Keys → copy your key → TERMII_API_KEY
 *   3. Dashboard → Messaging → Sender ID → apply for a name (e.g. "KemchutaHM")
 *      While pending approval, use channel "generic" — once approved use "dnd"
 *   4. Add to .env:
 *        TERMII_API_KEY=your_key_here
 *        TERMII_SENDER_ID=KemchutaHM
 *        TERMII_CHANNEL=dnd
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY client-facing event fires BOTH channels simultaneously:
 *   • Email — rich HTML with PDFs attached where applicable (Resend, unchanged)
 *   • SMS   — concise plain-text to the client's phone (Termii)
 *
 * Required .env variables:
 *   RESEND_API_KEY        — email (already present)
 *   ADMIN_EMAIL           — admin notifications (already present)
 *   FRONTEND_URL          — e.g. https://kemchutahomesltd.com
 *   TERMII_API_KEY        — from termii.com dashboard
 *   TERMII_SENDER_ID      — approved sender name, max 11 chars e.g. "KemchutaHM"
 *   TERMII_CHANNEL        — "dnd" (recommended) or "generic" while pending approval
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Resend } from "resend";

// ── Lazy-init Resend client ──────────────────────────────────────────────────
let _resend = null;
function getResend() {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) return null;
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// ── Constants ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = () =>
  process.env.ADMIN_EMAIL || "info@kemchutahomesltd.com";
const FRONTEND = () =>
  process.env.FRONTEND_URL || "https://kemchutahomesltd.com";

// ── Formatters ────────────────────────────────────────────────────────────────
export const fmtNGN = (n = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

const shortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─────────────────────────────────────────────────────────────────────────────
// SMS — Termii REST API (no npm package required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * normalizePhone — converts any Nigerian phone format to Termii international format.
 * Termii requires: 2348012345678  (234 + 10 digits, no leading +)
 *   08012345678      → 2348012345678
 *   +2348012345678   → 2348012345678
 *   2348012345678    → 2348012345678 (already correct)
 */
function normalizePhone(phone) {
  if (!phone) return null;
  const d = String(phone).replace(/\D/g, ""); // digits only
  if (d.startsWith("234") && d.length >= 13) return d;
  if (d.startsWith("0") && d.length === 11) return "234" + d.slice(1);
  if (d.length === 10) return "234" + d;
  return d.length >= 10 ? d : null;
}

/** truncate — keeps SMS under 160 chars (1 billing unit) */
function truncate(str, max = 155) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

/**
 * sendSMS — sends a plain-text SMS via Termii.
 * Silent no-op if TERMII_API_KEY is missing (email still fires).
 * @param {string} to  — any Nigerian phone format (auto-normalised)
 * @param {string} msg — message body (kept under 160 chars)
 */
export async function sendSMS(to, msg) {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || "KemchutaHM";
  const channel = process.env.TERMII_CHANNEL || "dnd";

  if (!apiKey) {
    // Graceful skip — SMS is additive, never blocks email
    console.warn("⚠️  TERMII_API_KEY not set — SMS skipped (email still sent)");
    return { success: false, reason: "TERMII_API_KEY missing" };
  }

  const recipient = normalizePhone(to);
  if (!recipient) {
    console.warn(`⚠️  SMS skipped — could not normalise phone: ${to}`);
    return { success: false, reason: "Invalid phone" };
  }

  try {
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        to: recipient,
        from: senderId,
        sms: truncate(msg),
        type: "plain",
        channel,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.code === "error") {
      throw new Error(data?.message || `HTTP ${res.status}`);
    }

    console.log(`✅ SMS → ${recipient} [${data?.message_id || "ok"}]`);
    return { success: true, messageId: data?.message_id };
  } catch (err) {
    console.error(`❌ SMS failed → ${recipient}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL — Resend (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * sendEmail — sends HTML email with optional PDF attachments via Resend.
 * attachments: [{ filename, content (base64 string), contentType }]
 */
export async function sendEmail({ to, subject, html, attachments }) {
  const resend = getResend();
  if (!resend) {
    console.warn("⚠️  RESEND_API_KEY not set — email skipped");
    return { success: false, reason: "RESEND_API_KEY missing" };
  }
  try {
    const toArr = Array.isArray(to) ? to : [to];
    const payload = {
      from: "Kemchuta Homes <onboarding@khlrealtorsportal.com>",
      to: toArr,
      subject,
      html,
    };
    if (attachments?.length) {
      payload.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        type: a.contentType || "application/pdf",
      }));
    }
    const { data, error } = await resend.emails.send(payload);
    if (error) throw new Error(error.message);
    console.log(
      `✅ EMAIL → ${toArr.join(", ")} [${data.id}] attach:${attachments?.length || 0}`,
    );
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error(`❌ EMAIL failed → ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL HTML BASE TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
const baseHtml = (badge, headlineHtml, bodyHtml) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  body{font-family:'Inter',Arial,sans-serif;background:#f5f5f5;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
  .wrapper{width:100%;background:#f5f5f5;padding-bottom:40px;}
  .main{background:#fff;width:100%;max-width:600px;margin:20px auto 0;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);}
  .header{background:linear-gradient(135deg,#3F0C91,#700CEB);padding:44px 20px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;text-transform:uppercase;}
  .badge{display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;margin-top:10px;letter-spacing:1px;}
  .content{padding:36px 32px;color:#262626;line-height:1.7;}
  .content h2{color:#000;font-size:20px;margin-top:0;font-weight:700;}
  .content p{font-size:15px;color:#525252;}
  table.data{width:100%;border-collapse:collapse;margin:20px 0;}
  table.data td{padding:10px 0;border-bottom:1px solid #eee;font-size:13px;}
  table.data td:first-child{color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.05em;width:38%;}
  table.data td:last-child{color:#0f0a1e;font-weight:700;}
  .btn-wrapper{text-align:center;margin:32px 0;}
  .btn{background:#700CEB;color:#fff!important;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(112,12,235,0.25);}
  .notice{background:rgba(112,12,235,0.06);border-left:3px solid #700CEB;border-radius:6px;padding:14px 18px;margin:24px 0;}
  .notice p{margin:0;font-size:13px;color:#700CEB;font-weight:600;}
  .footer{background:#171717;padding:28px;text-align:center;color:#a3a3a3;font-size:13px;}
  .footer a{color:#bd80f8;text-decoration:none;font-weight:600;}
  .footer p{margin:7px 0;}
  .divider{height:1px;background:#404040;margin:18px auto;width:80%;}
</style></head><body>
<div class="wrapper"><div class="main">
<div class="header">
  <h1>Kemchuta Homes</h1>
  ${badge ? `<span class="badge">${badge}</span>` : ""}
</div>
<div class="content">
  ${headlineHtml}
  ${bodyHtml}
</div>
<div class="footer">
  <p><a href="${FRONTEND()}">Website</a> &nbsp;|&nbsp; <a href="#">Instagram</a> &nbsp;|&nbsp; <a href="#">Support</a></p>
  <div class="divider"></div>
  <p>&copy; ${new Date().getFullYear()} Kemchuta Homes Ltd. All rights reserved.</p>
  <p>Lekki, Lagos &nbsp;·&nbsp; Asaba, Delta State</p>
</div>
</div></div></body></html>`;

const dataRows = (rows) =>
  `<table class="data">${rows.map(([l, v]) => `<tr><td>${l}</td><td>${v || "—"}</td></tr>`).join("")}</table>`;

// ─────────────────────────────────────────────────────────────────────────────
// ── 1. INSPECTION BOOKED ─────────────────────────────────────────────────────
// Fired when a client submits the inspection booking form.
// Sends: admin email + client email + client SMS
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyInspectionBooked(inspection) {
  const {
    estateName,
    firstName,
    lastName,
    email,
    phone,
    inspectionDate,
    persons,
  } = inspection;
  const fullName = `${firstName} ${lastName}`;
  const dateStr = fmtDate(inspectionDate);
  const dateShrt = shortDate(inspectionDate);
  const persStr = `${persons} person${persons > 1 ? "s" : ""}`;

  const adminHtml = baseHtml(
    "NEW INSPECTION",
    `<h2>New Site Inspection Booked 📅</h2>
     <p>A new inspection has been requested. Please confirm within 24 hours.</p>`,
    `${dataRows([
      ["Estate", estateName],
      ["Client", fullName],
      ["Email", email],
      ["Phone", phone],
      ["Date", dateStr],
      ["Persons", persStr],
    ])}
    <div class="notice"><p>Contact the client within 24 hours to confirm this booking.</p></div>`,
  );

  const clientHtml = baseHtml(
    "INSPECTION RECEIVED",
    `<h2>Inspection Booking Received 🏡</h2>
     <p>Hi ${firstName}, your inspection request has been received. Our team will contact you shortly to confirm.</p>`,
    `${dataRows([
      ["Estate", estateName],
      ["Date", dateStr],
      ["Persons", persStr],
    ])}
    <div class="notice"><p>Our team will call you within 24 hours to confirm your visit.</p></div>
    <div class="btn-wrapper"><a href="${FRONTEND()}/developments" class="btn">Explore More Estates</a></div>`,
  );

  await Promise.allSettled([
    sendEmail({
      to: ADMIN_EMAIL(),
      subject: `New Inspection: ${estateName} — ${fullName}`,
      html: adminHtml,
    }),
    sendEmail({
      to: email,
      subject: `Inspection Booking Received — ${estateName}`,
      html: clientHtml,
    }),
    sendSMS(
      phone,
      `Hi ${firstName}, your inspection for ${estateName} on ${dateShrt} has been received. Our team will call you within 24hrs to confirm. - Kemchuta Homes`,
    ),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 2. INSPECTION STATUS CHANGED ─────────────────────────────────────────────
// Fired when admin updates inspection status to confirmed/cancelled/completed.
// Sends: client email + client SMS
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyInspectionStatusChanged(inspection) {
  const { estateName, firstName, email, phone, inspectionDate, status } =
    inspection;
  const dateStr = fmtDate(inspectionDate);
  const dateShrt = shortDate(inspectionDate);

  const messages = {
    confirmed: {
      badge: "CONFIRMED",
      heading: "Your Inspection is Confirmed! ✅",
      body: `Great news, ${firstName}! Your site visit for <strong>${estateName}</strong> on ${dateStr} is <strong>confirmed</strong>.`,
      notice: "Please arrive 10 minutes early and bring a valid ID.",
      subject: `✅ Inspection Confirmed — ${estateName}`,
      sms: `Hi ${firstName}, your ${estateName} inspection on ${dateShrt} is CONFIRMED. Arrive 10 mins early with a valid ID. - Kemchuta Homes`,
    },
    cancelled: {
      badge: "CANCELLED",
      heading: "Inspection Cancelled",
      body: `Hi ${firstName}, your inspection for <strong>${estateName}</strong> on ${dateStr} has been cancelled. Please contact us to reschedule.`,
      notice: "Call us on +234 800 000 0001 to book a new date.",
      subject: `Inspection Cancelled — ${estateName}`,
      sms: `Hi ${firstName}, your ${estateName} inspection on ${dateShrt} has been cancelled. Call us to reschedule. - Kemchuta Homes`,
    },
    completed: {
      badge: "COMPLETED",
      heading: "Thank You for Visiting! 🙏",
      body: `Hi ${firstName}, thank you for visiting <strong>${estateName}</strong>! We hope you loved what you saw. Ready to subscribe and own your plot?`,
      notice: "Our team is ready to walk you through flexible payment plans.",
      subject: `How Was Your Visit? — ${estateName}`,
      sms: `Hi ${firstName}, thanks for visiting ${estateName}! Ready to own a plot? Call us or visit kemchutahomesltd.com. Plots are going fast! - Kemchuta Homes`,
    },
  };

  const m = messages[status];
  if (!m) return;

  const html = baseHtml(
    m.badge,
    `<h2>${m.heading}</h2><p>${m.body}</p>`,
    `${dataRows([
      ["Estate", estateName],
      ["Date", dateStr],
      ["Status", status.charAt(0).toUpperCase() + status.slice(1)],
    ])}
    <div class="notice"><p>${m.notice}</p></div>
    <div class="btn-wrapper"><a href="${FRONTEND()}/contact" class="btn">Contact Us</a></div>`,
  );

  await Promise.allSettled([
    sendEmail({ to: email, subject: m.subject, html }),
    sendSMS(phone, m.sms),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 3. INSPECTION REMINDER (cron — day before) ───────────────────────────────
// Sends: client email + client SMS
// ─────────────────────────────────────────────────────────────────────────────
export async function sendInspectionReminder(inspection) {
  const { firstName, email, phone, estateName, inspectionDate } = inspection;
  const dateStr = fmtDate(inspectionDate);
  const dateShrt = shortDate(inspectionDate);

  const html = baseHtml(
    "REMINDER",
    `<h2>Your Inspection is Tomorrow! 📅</h2>
     <p>Hi ${firstName}, just a friendly reminder that your site visit for <strong>${estateName}</strong> is scheduled for tomorrow.</p>`,
    `${dataRows([
      ["Estate", estateName],
      ["Date", dateStr],
    ])}
    <div class="notice"><p>Arrive 10 minutes early and bring a valid ID. We look forward to seeing you!</p></div>
    <div class="btn-wrapper"><a href="${FRONTEND()}/contact" class="btn">Contact Us</a></div>`,
  );

  await Promise.allSettled([
    sendEmail({
      to: email,
      subject: `Reminder: Inspection Tomorrow — ${estateName}`,
      html,
    }),
    sendSMS(
      phone,
      `Reminder: Hi ${firstName}, your ${estateName} site inspection is TOMORROW (${dateShrt}). Arrive 10 mins early with valid ID. - Kemchuta Homes`,
    ),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 4. POST-INSPECTION FOLLOW-UP (cron — 3 days after) ───────────────────────
// Sends: client email + client SMS
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPostInspectionFollowUp(inspection) {
  const { firstName, email, phone, estateName } = inspection;

  const html = baseHtml(
    "FOLLOW UP",
    `<h2>How Was Your Visit? 🏡</h2>
     <p>Hi ${firstName}, we hope you enjoyed visiting <strong>${estateName}</strong>! We'd love to help you take the next step toward land ownership.</p>`,
    `<p style="font-size:15px;color:#525252;">Our team is available to walk you through our flexible payment plans — outright or instalments.</p>
    <div class="btn-wrapper"><a href="${FRONTEND()}/developments" class="btn">View Payment Plans</a></div>`,
  );

  await Promise.allSettled([
    sendEmail({
      to: email,
      subject: `Still Interested in ${estateName}? Let's Talk 🏡`,
      html,
    }),
    sendSMS(
      phone,
      `Hi ${firstName}, how was your visit to ${estateName}? Ready to own a plot? Call us or visit kemchutahomesltd.com — plots are going fast! - Kemchuta Homes`,
    ),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 5. NEW SUBSCRIPTION SUBMITTED ────────────────────────────────────────────
// Sends: admin email + client email + client SMS
// ─────────────────────────────────────────────────────────────────────────────
export async function notifySubscriptionSubmitted(sub) {
  const fullName = `${sub.title || ""} ${sub.firstName} ${sub.lastName}`.trim();
  const amount = fmtNGN(sub.totalAmount);

  const adminHtml = baseHtml(
    "NEW SUBSCRIPTION",
    `<h2>New Land Subscription 📋</h2>
     <p>A new subscription has been submitted. Review and contact the subscriber within 24 hours.</p>`,
    dataRows([
      ["Estate", sub.estateName],
      ["Subscriber", fullName],
      ["Email", sub.email],
      ["Phone", sub.phone],
      ["Plot Type", sub.plotType],
      ["Plot Size", sub.plotSize],
      ["No. of Plots", String(sub.numberOfPlots)],
      ["Payment Plan", sub.paymentPlan],
      ["Total Amount", amount],
    ]),
  );

  const clientHtml = baseHtml(
    "SUBSCRIPTION RECEIVED",
    `<h2>Subscription Received! 🎉</h2>
     <p>Hi ${sub.firstName}, thank you for subscribing to <strong>${sub.estateName}</strong>. Your application is under review.</p>`,
    `${dataRows([
      ["Reference", sub.referenceNumber || "Pending"],
      ["Estate", sub.estateName],
      ["Plot Type", sub.plotType],
      ["Payment Plan", sub.paymentPlan],
      ["Total Amount", amount],
    ])}
    <div class="notice"><p>Our team will contact you within <strong>24–48 hours</strong>. Keep your phone reachable!</p></div>
    <div class="btn-wrapper"><a href="${FRONTEND()}/client/portal" class="btn">Track Your Application</a></div>`,
  );

  await Promise.allSettled([
    sendEmail({
      to: ADMIN_EMAIL(),
      subject: `New Subscription: ${sub.estateName} — ${fullName}`,
      html: adminHtml,
    }),
    sendEmail({
      to: sub.email,
      subject: `Subscription Received — ${sub.estateName}`,
      html: clientHtml,
    }),
    sendSMS(
      sub.phone,
      `Hi ${sub.firstName}, your subscription for ${sub.estateName} (Ref: ${sub.referenceNumber || "pending"}) has been received. We'll call you within 24hrs. - Kemchuta Homes`,
    ),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 6. PAYMENT REMINDER (cron — instalment plans) ────────────────────────────
// Sends: client email + client SMS
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPaymentReminder(sub) {
  const nextInst = sub.instalmentSchedule?.find((s) => !s.isPaid);
  const amount = nextInst ? fmtNGN(nextInst.amount) : fmtNGN(sub.totalAmount);
  const dueDate = nextInst ? shortDate(nextInst.dueDate) : "soon";

  const html = baseHtml(
    "PAYMENT REMINDER",
    `<h2>Payment Reminder 💳</h2>
     <p>Hi ${sub.firstName}, this is a friendly reminder about your upcoming instalment payment for <strong>${sub.estateName}</strong>.</p>`,
    `${dataRows([
      ["Estate", sub.estateName],
      ["Reference", sub.referenceNumber],
      ["Amount Due", amount],
      ["Due Date", dueDate],
      ["Total Paid", fmtNGN(sub.amountPaid || 0)],
      ["Balance", fmtNGN(sub.totalAmount - (sub.amountPaid || 0))],
    ])}
    <div class="notice"><p>Please make payment before the due date to avoid delays in your plot allocation.</p></div>
    <div class="btn-wrapper"><a href="${FRONTEND()}/client/portal" class="btn">View My Portal</a></div>`,
  );

  await Promise.allSettled([
    sendEmail({
      to: sub.email,
      subject: `Payment Reminder — ${sub.estateName} [${sub.referenceNumber}]`,
      html,
    }),
    sendSMS(
      sub.phone,
      `Hi ${sub.firstName}, your ${sub.estateName} instalment (${amount}) is due on ${dueDate}. Ref: ${sub.referenceNumber}. Pay now to avoid delays. - Kemchuta Homes`,
    ),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 7. REALTOR WELCOME ────────────────────────────────────────────────────────
// Email handled by sendWelcomeEmail() in utils/email.js (preserved).
// This adds the SMS welcome alongside it.
// Sends: client SMS only (email is from the existing welcome email function)
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyRealtorWelcomeSMS({
  firstName,
  phone,
  referralCode,
  referralLink,
}) {
  await sendSMS(
    phone,
    `Welcome to Kemchuta Homes, ${firstName}! Your referral code is ${referralCode}. Start earning commissions: ${referralLink || FRONTEND()} - KHL`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 8. BUY2SELL — INVESTMENT SUBMITTED ───────────────────────────────────────
// Sends: client SMS (email is handled directly in buy2sell.controller.js)
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyB2SSubmitted({
  fullName,
  phone,
  referenceNumber,
  duration,
  principalAmount,
}) {
  await sendSMS(
    phone,
    `Hi ${fullName.split(" ")[0]}, your Buy2Sell investment of ${fmtNGN(principalAmount)} for ${duration} (Ref: ${referenceNumber}) has been received. Check your email for details. - Kemchuta Homes`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 9. BUY2SELL — INVESTMENT ACTIVATED (full payment confirmed) ───────────────
// Sends: client SMS (email is handled directly in buy2sell.controller.js)
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyB2SActivated({
  fullName,
  phone,
  referenceNumber,
  duration,
  maturityDate,
}) {
  await sendSMS(
    phone,
    `Great news ${fullName.split(" ")[0]}! Your Buy2Sell investment (${referenceNumber}) is now ACTIVE. Duration: ${duration}. Matures: ${shortDate(maturityDate)}. - Kemchuta Homes`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 10. BUY2SELL — INVESTMENT MATURED ────────────────────────────────────────
// Sends: client SMS (email is handled in followUp.js auto-maturity cron)
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyB2SMatured({
  fullName,
  phone,
  referenceNumber,
  expectedPayout,
}) {
  await sendSMS(
    phone,
    `Congratulations ${fullName.split(" ")[0]}! Your Buy2Sell investment (${referenceNumber}) has MATURED. Payout of ${fmtNGN(expectedPayout)} is being processed. - Kemchuta Homes`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 11. BUY2SELL — PAYOUT PROCESSED ──────────────────────────────────────────
// Sends: client SMS (email is handled directly in buy2sell.controller.js)
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyB2SPaidOut({
  fullName,
  phone,
  referenceNumber,
  actualPayout,
}) {
  await sendSMS(
    phone,
    `Hi ${fullName.split(" ")[0]}, your Buy2Sell payout of ${fmtNGN(actualPayout)} (Ref: ${referenceNumber}) has been sent to your account! Thank you for investing with us. - Kemchuta Homes`,
  );
}
