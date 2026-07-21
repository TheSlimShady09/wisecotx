import { createContext, useContext, useMemo, useState } from "react";

/* Carries whatever the visitor configured into the quote form, so
   the lead arrives with the spec attached instead of "hi, roof?". */
const QuoteContext = createContext(null);

export function QuoteProvider({ children }) {
  const [brief, setBrief] = useState(null);
  const value = useMemo(() => ({ brief, setBrief }), [brief]);
  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside <QuoteProvider>");
  return ctx;
}
