import { useEffect, useState } from "react";

import { waLink, briefToMessage } from "../lib/whatsapp.js";

/* Kept monochrome on purpose: the brief is a strictly grayscale
   palette, so the mark is drawn in the page's own ink rather than
   WhatsApp green. Swap the fill for #25D366 if brand recognition
   matters more than palette discipline. */
export function WhatsAppGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.16-1.35a9.9 9.9 0 0 0 4.88 1.25h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.22 8.22 0 0 1-1.26-4.39c0-4.55 3.7-8.25 8.25-8.25 2.2 0 4.28.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.84c0 4.55-3.7 8.23-8.26 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.04s.87 2.37 1 2.53c.12.17 1.72 2.62 4.16 3.68.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

/**
 * Opens WhatsApp with the visitor's configuration already written out.
 * `summary` is the same [label, value] shape the quote form uses.
 */
export function WhatsAppButton({ module, summary, label = "Message us on WhatsApp", className = "", variant = "" }) {
  return (
    <a
      className={`btn ${variant} ${className}`}
      href={waLink(briefToMessage(module, summary))}
      target="_blank"
      rel="noopener noreferrer"
    >
      <WhatsAppGlyph />
      {label}
    </a>
  );
}

/** Persistent reach-out, revealed once the visitor is past the fold. */
export function WhatsAppFab() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      className={`wa-fab ${shown ? "is-shown" : ""}`}
      href={waLink(briefToMessage("construction"))}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
    >
      <WhatsAppGlyph size={19} />
      <span className="wa-fab__text">WhatsApp</span>
    </a>
  );
}
