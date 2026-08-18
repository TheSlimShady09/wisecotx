import { COMPANY } from "./site.js";

/* ============================================================
   Lead delivery — to the WCG inbox, with photo attachments.

   Uses FormSubmit (https://formsubmit.co) by default: a free,
   no-signup form-to-email relay that supports file attachments,
   so the inspection photos arrive in the inbox. The FIRST
   submission triggers a one-time activation email to
   COMPANY.email — click the link in it once and every later
   submission (photos included) is delivered.

   Set FORM_ENDPOINT to override with your own handler / another
   service (it must accept multipart/form-data with files).
   ============================================================ */
export const FORM_ENDPOINT = "";

const FORMSUBMIT = `https://formsubmit.co/${encodeURIComponent(COMPANY.email)}`;

const KV = (rows) =>
  rows
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
    .map(([k, v]) => `${k}: ${v}`);

export function buildEmailBody(values, summaryRows = []) {
  const lines = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.phone ? `Phone: ${values.phone}` : null,
    `Location: ${values.location}`,
    `Enquiry: ${values.module}`,
  ].filter(Boolean);

  if (values.message) lines.push("", "Message:", values.message);
  if (summaryRows.length) lines.push("", "— Attached configuration —", ...KV(summaryRows));

  lines.push("", "Sent from the WCG website inspection form.");
  return lines.join("\n");
}

export function mailtoLink(values, summaryRows = []) {
  const subject = `Inspection request — ${values.name || "Website enquiry"}`;
  const body = buildEmailBody(values, summaryRows);
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Sends the enquiry (and any photos) to the WCG inbox.
 * @param {object} values form fields
 * @param {Array<[string, string]>} summaryRows attached configuration
 * @param {File[]} files inspection photos
 * @returns {Promise<{via: "form"}>}
 */
export async function sendEnquiry(values, summaryRows = [], files = []) {
  const endpoint = FORM_ENDPOINT || FORMSUBMIT;

  const data = new FormData();
  data.append("name", values.name);
  data.append("email", values.email);
  if (values.phone) data.append("phone", values.phone);
  data.append("location", values.location);
  data.append("enquiry", values.module);
  if (values.message) data.append("message", values.message);
  const config = KV(summaryRows).join("; ");
  if (config) data.append("configuration", config);

  // FormSubmit control fields
  data.append("_subject", `Inspection request — ${values.name}`);
  data.append("_captcha", "false");
  data.append("_template", "table");

  files.forEach((file, i) => data.append(`photo_${i + 1}`, file, file.name));

  // no-cors: FormSubmit processes and emails the multipart body (files
  // included); the opaque response can't be read, which is fine — a
  // network failure still rejects and is caught by the caller.
  await fetch(endpoint, { method: "POST", mode: "no-cors", body: data });
  return { via: "form" };
}
