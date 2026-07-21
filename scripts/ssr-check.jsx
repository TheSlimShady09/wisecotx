import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.jsx";
import { QuoteProvider } from "../src/lib/QuoteContext.jsx";

const routes = ["/", "/construction", "/repair", "/insurance", "/quote", "/nope"];
let failed = 0;

for (const route of routes) {
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[route]}>
        <QuoteProvider>
          <App />
        </QuoteProvider>
      </MemoryRouter>,
    );
    const anchors=["construction","repair","insurance"].filter((a)=>html.includes(`id="${a}"`));
    const extra = route === "/" ? ` anchors:[${anchors.join(",")}]` : "";
    console.log(`OK   ${route.padEnd(15)} ${html.length} chars${extra}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${route.padEnd(15)} ${error.message}`);
    console.log(error.stack?.split("\n").slice(0, 6).join("\n"));
  }
}

process.exit(failed ? 1 : 0);
