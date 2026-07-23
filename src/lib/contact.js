import { COMPANY } from "./site.js";

/* ============================================================
   Lead delivery — by email, not WhatsApp.

   Set FORM_ENDPOINT to a form-to-email service (e.g. a Formspree
   endpoint "https://formspree.io/f/xxxxxx", or your own handler)
   and submissions are POSTed there and delivered to your inbox
   server-side — the visitor never leaves the page.

   Left empty, the form falls back to opening the visitor's own
   email client pre-addressed to COMPANY.email with every field
   filled in, so it still lands in your inbox with no backend.
   ============================================================ */
export const FORM_ENDPOINT = "";

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

  if (summaryRows.length) {
    lines.push("", "— Attached configuration —", ...KV(summaryRows));
  }

  lines.push("", "Sent from the WCG website inspection form.");
  return lines.join("\n");
}

export function mailtoLink(values, summaryRows = []) {
  const subject = `Inspection request — ${values.name || "Website enquiry"}`;
  const body = buildEmailBody(values, summaryRows);
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Delivers the enquiry to the business inbox.
 * @returns {Promise<{via: "server" | "mailto"}>}
 * @throws if a configured server endpoint rejects the request
 */
export async function sendEnquiry(values, summaryRows = []) {
  if (FORM_ENDPOINT) {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        phone: values.phone,
        location: values.location,
        enquiry: values.module,
        message: values.message,
        configuration: KV(summaryRows).join("; "),
        _subject: `Inspection request — ${values.name}`,
      }),
    });
    if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
    return { via: "server" };
  }

  // No backend configured: hand off to the visitor's mail client.
  window.location.href = mailtoLink(values, summaryRows);
  return { via: "mailto" };
}
