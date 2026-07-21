import { COMPANY, MODULES } from "./site.js";

/**
 * wa.me needs the number in full international form, digits only —
 * no +, no spaces, no brackets.
 */
function digits(number) {
  return String(number).replace(/\D/g, "");
}

/**
 * @param {string} [message] pre-filled first message
 * @returns {string} a wa.me deep link that opens the app on mobile and
 *                   WhatsApp Web on desktop
 */
export function waLink(message) {
  const base = `https://wa.me/${digits(COMPANY.whatsapp)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

const OPENERS = {
  construction: "Hi Wise Co Group — I'd like a quote for a new roof.",
  repair: "Hi Wise Co Group — I need a roof repair looked at.",
  insurance: "Hello — I'm enquiring about roofing subcontract work for claims.",
};

/**
 * Turns a configurator result into a message the visitor can send
 * without typing anything. This is the point of the WhatsApp route:
 * the spec travels with the lead.
 *
 * @param {string} moduleId
 * @param {Array<[string, string]>} summary rows of [label, value]
 */
export function briefToMessage(moduleId, summary = []) {
  const lines = [OPENERS[moduleId] ?? OPENERS.construction];

  if (summary.length) {
    lines.push("", `— ${MODULES[moduleId]?.label ?? "Enquiry"} spec —`);
    for (const [label, value] of summary) {
      if (typeof value === "string" || typeof value === "number") {
        lines.push(`${label}: ${value}`);
      }
    }
  }

  lines.push("", "Sent from wisecogroup.com");
  return lines.join("\n");
}
