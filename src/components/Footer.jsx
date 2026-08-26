import { COMPANY } from "../lib/site.js";

/* A single base line — the notices that have to appear somewhere and
   belong nowhere else on the page. */
export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell foot__base">
        <span className="anno--dim">
          © {new Date().getFullYear()} {COMPANY.name}
        </span>
        <span className="anno--dim">{COMPANY.license}</span>
        <a className="anno--dim foot__powered" href="https://neolink.al" target="_blank" rel="noopener noreferrer">
          Powered by Neolink
        </a>
      </div>
    </footer>
  );
}
