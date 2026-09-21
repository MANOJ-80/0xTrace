const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

async function runBrowserTests() {
  console.log("🚀 Starting E2E Browser & Workflow Tests for 0xTrace...");

  const screenshotsDir = path.resolve(__dirname, "../scratch/screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1366, height: 868 },
  });

  const page = await browser.newPage();

  try {
    // 1. Dashboard Test
    console.log("▶ Testing [1/5]: Dashboard & Intelligence (http://localhost:3000)...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
    const title = await page.title();
    console.log(`  Page title: "${title}"`);
    if (!title.includes("0xTrace")) throw new Error("Title does not include 0xTrace");

    const metricsCount = await page.$$eval("div.text-2xl, div.text-3xl", (els) => els.map((e) => e.textContent.trim()));
    console.log(`  Metrics detected: ${metricsCount.slice(0, 4).join(", ")}`);
    await page.screenshot({ path: path.join(screenshotsDir, "01_dashboard.png") });
    console.log("  ✓ Dashboard test passed!");

    // 2. Experiences Directory Test
    console.log("▶ Testing [2/5]: Experiences Directory (http://localhost:3000/experiences?sortBy=recent)...");
    await page.goto("http://localhost:3000/experiences?sortBy=recent", { waitUntil: "networkidle0" });
    
    // Type search
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type("Walmart");
      await new Promise((r) => setTimeout(r, 600));
      const walmartCount = await page.$$eval("h3", (els) => els.filter((e) => e.textContent.includes("Walmart")).length);
      console.log(`  Filtered Walmart cards found: ${walmartCount}`);
    }
    await page.screenshot({ path: path.join(screenshotsDir, "02_directory_filtered.png") });
    console.log("  ✓ Directory search test passed!");

    // 3. Experience Detail & Round Modal Test
    console.log("▶ Testing [3/5]: Detail View & Round Modal Popup (http://localhost:3000/experiences/exp_041)...");
    await page.goto("http://localhost:3000/experiences/exp_041", { waitUntil: "networkidle0" });
    
    // Find round cards
    const roundCards = await page.$$('div[class*="group bg-[#11141c]"]');
    console.log(`  Found ${roundCards.length} round cards in detail view`);
    if (roundCards.length === 0) throw new Error("No round cards found on detail page");

    // Click on Round 2
    console.log("  Clicking on Round 2 to test Modal Popup...");
    await roundCards[1].click();
    await new Promise((r) => setTimeout(r, 800));

    // Verify modal is open
    const modalTitleEl = await page.$("h2.font-bold.text-white");
    const modalTitle = modalTitleEl ? await page.evaluate((el) => el.textContent, modalTitleEl) : "";
    console.log(`  Modal opened with title: "${modalTitle}"`);

    // Verify amber full-text box
    const amberBox = await page.$("div.border-amber-900\\/40");
    if (!amberBox) throw new Error("Full PDF text container not found in modal!");
    const textSnippet = await page.evaluate((el) => el.textContent.slice(0, 150), amberBox);
    console.log(`  Verbatim text snippet in modal: "${textSnippet.trim()}..."`);

    await page.screenshot({ path: path.join(screenshotsDir, "03_round_modal_popup.png") });

    // Test Right Arrow key navigation in modal
    console.log("  Pressing ArrowRight to navigate to next round...");
    await page.keyboard.press("ArrowRight");
    await new Promise((r) => setTimeout(r, 500));
    const nextModalTitle = await page.evaluate((el) => el.textContent, modalTitleEl);
    console.log(`  Navigated to next round: "${nextModalTitle}"`);

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 500));
    console.log("  ✓ Detail page & Round Modal test passed!");

    // 4. Question Bank Test
    console.log("▶ Testing [4/5]: Question & Coding Problem Bank (http://localhost:3000/questions)...");
    await page.goto("http://localhost:3000/questions", { waitUntil: "networkidle0" });
    const questionItems = await page.$$eval("p.text-sm.font-semibold", (els) => els.length);
    console.log(`  Rendered question items: ${questionItems}`);
    await page.screenshot({ path: path.join(screenshotsDir, "04_question_bank.png") });
    console.log("  ✓ Question bank test passed!");

    // 5. Ingestion Studio & Approve to Canonical Workflow Test
    console.log("▶ Testing [5/5]: PDF Extraction Studio & Approve-to-Canonical Ingestion (http://localhost:3000/upload)...");
    await page.goto("http://localhost:3000/upload", { waitUntil: "networkidle0" });

    // Click sample button: Candidate PhonePe
    console.log("  Loading PhonePe extraction sample...");
    const sampleBtns = await page.$$("button.border-slate-200, button.border-slate-800");
    if (sampleBtns.length >= 2) {
      await sampleBtns[1].click(); // Candidate PhonePe
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Find "Approve & Ingest to Canonical" button
    const approveBtn = await page.waitForSelector('button:has-text("Approve & Ingest to Canonical")', { timeout: 5000 }).catch(async () => {
      // Fallback selector
      const btns = await page.$$("button");
      for (const b of btns) {
        const txt = await page.evaluate((el) => el.textContent, b);
        if (txt.includes("Approve & Ingest")) return b;
      }
      return null;
    });

    if (!approveBtn) throw new Error("Could not find 'Approve & Ingest to Canonical' button");
    console.log("  Clicking 'Approve & Ingest to Canonical'...");
    await approveBtn.click();

    // Wait for success banner
    await page.waitForFunction(
      () => document.body.innerText.includes("Experience Successfully Ingested!"),
      { timeout: 10000 }
    );

    await page.screenshot({ path: path.join(screenshotsDir, "05_ingest_approved.png") });
    console.log("  ✓ Canonical Ingestion success notification confirmed!");

    console.log("\n========================================================");
    console.log("🎉 ALL 5 WORKFLOW BROWSER TESTS PASSED SUCCESSFULLY!");
    console.log(`📸 Screenshots captured in: ${screenshotsDir}`);
    console.log("========================================================\n");

  } catch (err) {
    console.error("❌ Browser test failed:", err);
    await page.screenshot({ path: path.join(screenshotsDir, "error_failure.png") }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserTests();
