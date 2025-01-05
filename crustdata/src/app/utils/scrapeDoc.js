const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Target URLs
    const urls = [
      "https://www.notion.so/crustdata/Crustdata-Discovery-And-Enrichment-API-c66d5236e8ea40df8af114f6d447ab48",
      "https://www.notion.so/crustdata/Crustdata-Dataset-API-Detailed-Examples-b83bd0f1ec09452bb0c2cac811bba88c",
    ];

    const results = [];

    for (const url of urls) {
      await page.goto(url, { waitUntil: "networkidle2" });

      // Extract structured content inside page.evaluate
      const sections = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("*"))
          .filter((el) => {
            // Filter out script, style, meta, and hidden elements
            const tagName = el.tagName.toLowerCase();
            const isHidden = el.offsetParent === null; // Check if the element is visible
            return (
              !["script", "style", "meta", "link"].includes(tagName) && !isHidden
            );
          })
          .map((el) => {
            const text = el.innerText ? el.innerText.trim() : ""; // Safeguard against undefined
            return {
              tag: el.tagName,
              text,
            };
          })
          .filter((section) => section.text); // Exclude elements with empty text
      });

      results.push({ url, sections });
    }

    // Save results to a file
    fs.writeFileSync("apiDocs.json", JSON.stringify(results, null, 2));

    console.log("Scraping completed successfully!");
    await browser.close();
  } catch (error) {
    console.error("Error during scraping:", error);
  }
})();
