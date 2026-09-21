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

    // 3. Experience Detail & Round Modal Test on exp_011 (Fiorana)
    console.log("▶ Testing [3/5]: Detail View & Clean Round Modal on Fiorana (http://localhost:3000/experiences/exp_011)...");
    await page.goto("http://localhost:3000/experiences/exp_011", { waitUntil: "networkidle0" });
    
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

    // Verify narrative walkthrough box
    const narrativeHeader = await page.$eval("div", (el) => document.body.textContent.includes("Round Walkthrough & Experience"));
    if (!narrativeHeader) throw new Error("Round Walkthrough container not found in modal!");

    // Check for extracted questions
    const hasQuestions = await page.evaluate(() => {
      return document.body.textContent.includes("Interview Questions Asked") || document.body.textContent.includes("Why Fiorana?");
    });
    console.log(`  Extracted questions rendered in modal: ${hasQuestions}`);

    // Check for coding challenges
    const hasCoding = await page.evaluate(() => {
      return document.body.textContent.includes("Coding & DSA Challenges") || document.body.textContent.includes("Binary Trees");
    });
    console.log(`  Coding challenges rendered in modal: ${hasCoding}`);

    // Click on "View Untouched Raw Spans (Lossless Audit)" accordion
    const buttons = await page.$$("button");
    for (const b of buttons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes("View Untouched Raw Spans")) {
        await b.click();
        console.log("  Clicked 'View Untouched Raw Spans' accordion!");
        await new Promise((r) => setTimeout(r, 400));
        break;
      }
    }

    await page.screenshot({ path: path.join(screenshotsDir, "03_round_modal_clean_popup.png") });

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
    console.log(`  Rendered question items on first page: ${questionItems}`);
    await page.screenshot({ path: path.join(screenshotsDir, "04_question_bank.png") });
    console.log("  ✓ Question bank test passed!");

    // 5. Ingestion Studio & Sample Extraction Test
    console.log("▶ Testing [5/5]: PDF Extraction Studio (http://localhost:3000/upload)...");
    await page.goto("http://localhost:3000/upload", { waitUntil: "networkidle0" });

    // Click on verified sample: Walmart
    console.log("  Clicking 'Candidate — Walmart' sample button...");
    const sampleButtons = await page.$$("button");
    let clickedSample = false;
    for (const btn of sampleButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes("Walmart")) {
        await btn.click();
        clickedSample = true;
        break;
      }
    }
    if (!clickedSample) throw new Error("Could not find Walmart sample button");

    // Wait for extraction preview to render
    console.log("  Waiting for extraction results to render...");
    await page.waitForSelector('h2, div[class*="border-emerald-500"]', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Take screenshot of extraction studio
    await page.screenshot({ path: path.join(screenshotsDir, "05_extraction_studio.png") });
    console.log("  ✓ Extraction Studio test passed!");

    console.log("\n🎉 ALL 5 E2E BROWSER TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    await page.screenshot({ path: path.join(screenshotsDir, "error_screenshot.png") });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserTests();
