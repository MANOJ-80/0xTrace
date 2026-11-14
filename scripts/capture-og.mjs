// Rebuild the static link preview from the live homepage.
//
// The homepage hero includes a carousel of candidate records. Company names
// must not appear in the social preview, so this script hides the carousel,
// widens the copy column, and captures a 1200x630 PNG.
//
// Usage:
//   node scripts/capture-og.mjs
//   node scripts/capture-og.mjs http://localhost:3000/ /tmp/preview.png
//
// Requires Google Chrome (or CHROME_BIN) and Node 22+ for the global WebSocket.

import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const url = process.argv[2] || "https://0x-trace.vercel.app/";
const out = process.argv[3] || "apps/web/public/og-home.png";
const port = 9333;
const chrome = process.env.CHROME_BIN || "google-chrome";

const proc = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    "--remote-allow-origins=*",
    "about:blank",
  ],
  { stdio: "ignore" }
);

const cleanup = () => {
  try {
    proc.kill("SIGKILL");
  } catch {
    // Chrome already exited.
  }
};
process.on("exit", cleanup);

async function waitForChrome() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {
      // The debugging port is not open yet.
    }
    await sleep(250);
  }
  throw new Error("Chrome did not expose the debugging port");
}

await waitForChrome();

const target = await fetch(
  `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
  { method: "PUT" }
).then((res) => res.json());

const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();

ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const waiter = pending.get(message.id);
  if (!waiter) return;
  pending.delete(message.id);
  if (message.error) waiter.reject(new Error(message.error.message));
  else waiter.resolve(message.result);
});

await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1200,
  height: 630,
  deviceScaleFactor: 1,
  mobile: false,
});

await send("Page.navigate", { url });
await sleep(3500);

const css = `
  .hero-visual { display: none !important; }
  .landing-hero {
    grid-template-columns: minmax(0, 1fr) !important;
    min-height: 0 !important;
    padding: 26px 0 30px !important;
    gap: 0 !important;
  }
  .hero-copy { max-width: 780px !important; }
  .hero-copy h1 { font-size: 56px !important; }
  .hero-description { max-width: 620px !important; }
  .proof-strip { padding: 16px 0 18px !important; }
`;

await send("Runtime.evaluate", {
  expression: `(() => {
    const style = document.createElement("style");
    style.textContent = ${JSON.stringify(css)};
    document.head.appendChild(style);
    window.scrollTo(0, 0);
  })()`,
});

await sleep(600);

const shot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: false,
});

writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log(`wrote ${out}`);

ws.close();
cleanup();
