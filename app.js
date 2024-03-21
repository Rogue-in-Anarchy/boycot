const puppeteer = require("puppeteer");

try {
  (async () => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const navigationPromise = page.waitForNavigation();

      await page.goto("https://www.boycotzionism.com/", {
        waitUntil: "networkidle0",
      });

      await page.setViewport({ width: 1050, height: 1050 });

      await navigationPromise;

      console.log("connected to boycot");

      let previousItemCount = 0;
      let currentItemCount = 0;
      let buttons = [];

      let contents = await page.$$(
        ".container > .infinite-scroll-component__outerdiv > .infinite-scroll-component > .grid > .react-card-flip > .react-card-flipper > .react-card-front > .border-slate-200 > .gap-1 > .bg-red-700"
      );

      previousItemCount = contents.length;

      while (previousItemCount !== currentItemCount) {
        previousItemCount = currentItemCount;

        // Scroll to the bottom of the page
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });

        // Wait for a brief moment for potential new items to load
        try {
          buttons.push(
            await page.waitForFunction(
              `document.querySelectorAll('.container > .infinite-scroll-component__outerdiv > .infinite-scroll-component > .grid > .react-card-flip > .react-card-flipper > .react-card-front > .border-slate-200 > .gap-1 > .bg-red-700').length > ${currentItemCount}`
            )
          );
        } catch {
          console.log("Timeout waiting for new items. Exiting loop.");
          contents = await page.$$(
            ".container > .infinite-scroll-component__outerdiv > .infinite-scroll-component > .grid > .react-card-flip > .react-card-flipper > .react-card-front > .border-slate-200 > .gap-1 > .bg-red-700"
          );
          break;
        }

        // Collect the newly loaded items
        const newItems = await page.$$(
          ".container > .infinite-scroll-component__outerdiv > .infinite-scroll-component > .grid > .react-card-flip > .react-card-flipper > .react-card-front > .border-slate-200 > .gap-1 > .bg-red-700"
        );

        // Update the count of total items collected so far
        currentItemCount = newItems.length;

        // Optionally, process or store the new items as needed
        // For example:
        for (const itemHandle of newItems) {
          const itemText = await page.evaluate(
            (item) => item.textContent,
            itemHandle
          );
        }
        console.log(currentItemCount, newItems.length, previousItemCount);
      }

      const next = [];

      for (const content of contents) {
        let start = 0;
        let end = 1050;
        // Scroll the page to bring the element into view
        await page.evaluate((start, end) => {
          window.scrollTo(start, end);
        });

        await navigationPromise;

        await content.click();

        await navigationPromise;

        page.screenshot({ path: "bocat.jpg" });
        const _name = await page.evaluate(() => {
          return document.querySelector(
            "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .border-solid > h3"
          ).innerText;
        });

        const _details = await page.evaluate(() => {
          return document.querySelector(
            "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .flex-auto > .markdown"
          ).innerHTML;
        });

        const _logo = await page.evaluate(() => {
          return document
            .querySelector(
              "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .flex-auto > .justify-center > img"
            )
            .getAttribute("src");
        });

        const _source = await page.evaluate(() => {
          return document
            .querySelector(
              "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .justify-end > a"
            )
            .getAttribute("href");
        });

        await page.click(
          "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .justify-end > button"
        );

        next.push({
          name: _name,
          details: _details,
          logo: _logo,
          source: _source,
        });

        start = start + 1050;
        end = end + 1050;
      }

      try {
        await page.goto("https://www.npoint.io/", {
          waitUntil: "networkidle0",
        });

        await page.setViewport({ width: 1050, height: 653 });

        await navigationPromise;

        const nPoint = await page.waitForSelector(
          ".header > .header-container > .user-info-container > .slide-down-component"
        );

        console.log("connected");

        await nPoint.click();

        const Email = "nehemarya@gmail.com";
        const Password = "Neveragain@app";

        await page.type('[type="email"]', Email);
        await page.type('[type="password"]', Password);

        await page.click(
          ".login-component > .spaced-children > .justify-end > .button-group > .primary"
        );
        console.log("logged in");

        await navigationPromise;

        await page.screenshot({ path: "startPoint.jpg" });

        await page.goto("https://www.npoint.io/docs/fe2363344f2e0980e914", {
          waitUntil: "networkidle0",
        });

        await navigationPromise;

        console.log("abt to type");
        await page.screenshot({ path: "startingPoint.jpg" });

        const input = await page.$("#brace-editor > textarea");

        console.log("abt to clear");

        // focus on the input field
        await page.click("#brace-editor > textarea");
        await page.keyboard.down("Control");
        await page.keyboard.press("A");
        await page.keyboard.up("Control");
        console.log("cleared");

        await input.type(`{"data" : ${JSON.stringify(next)}`);

        await page.screenshot({ path: "midPoint.jpg" });

        await page.click(
          ".document-page > .document-page-header > .header > .header-container > .cta"
        );

        // await page.evaluate(
        //   () => (document.querySelector("#brace-editor > textarea").value = "")
        // );

        await page.screenshot({ path: "npoint.jpg" });
        console.log("filled");

        // Neveragain@app
      } catch (e) {
        console.log("failed to save json:", e);
      }
    } catch (e) {
      console.log("Scrape failed:", e);
    }
  })();
} catch (e) {
  console.log("Scrape failed:", e);
}
