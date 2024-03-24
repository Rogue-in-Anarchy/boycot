const puppeteer = require("puppeteer");

try {
  (async () => {
    try {
      //setting up puppeteer
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const navigationPromise = page.waitForNavigation();

      // opening the boycot-zionism website ans setting up the page
      await page.goto("https://www.boycotzionism.com/", {
        waitUntil: "networkidle0",
      });

      await page.setViewport({ width: 1050, height: 1050 });

      await navigationPromise;

      let previousItemCount = 0;
      let currentItemCount = 0;

      let contents = await page.$$(
        ".container > .infinite-scroll-component__outerdiv > .infinite-scroll-component > .grid > .react-card-flip > .react-card-flipper > .react-card-front > .border-slate-200 > .gap-1 > .bg-red-700"
      );

      previousItemCount = contents.length;
      // Iterating and counting the total items on the page

      while (previousItemCount !== currentItemCount) {
        previousItemCount = currentItemCount;

        // Scroll to the bottom of the page
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });

        // Wait for a brief moment for potential new items to load
        try {
          await page.waitForFunction(
            `document.querySelectorAll('.container > .infinite-scroll-component__outerdiv > .infinite-scroll-component > .grid > .react-card-flip > .react-card-flipper > .react-card-front > .border-slate-200 > .gap-1 > .bg-red-700').length > ${currentItemCount}`
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

        // clicking to show details of a specific item
        await content.click();

        await navigationPromise;

        // saving the details of each item
        const name = await page.evaluate(() => {
          return document.querySelector(
            "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .border-solid > h3"
          ).innerText;
        });

        const details = await page.evaluate(() => {
          return document.querySelector(
            "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .flex-auto > .markdown > p"
          ).innerText;
        });

        const logo = await page.evaluate(() => {
          return document
            .querySelector(
              "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .flex-auto > .justify-center > img"
            )
            .getAttribute("src");
        });

        const source = await page.evaluate(() => {
          return document
            .querySelector(
              "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .justify-end > a"
            )
            .getAttribute("href");
        });

        // clicking to close the details modal an opened item
        await page.click(
          "[data-focus-lock-disabled='false'] > .z-50 > .mx-auto > .justify-end > button"
        );

        // creating an object of all the necessary iformations on the item and pushing them into the next array
        next.push({
          _name: name,
          _details: details,
          _logo: logo,
          _source: source,
        });

        start = start + 1050;
        end = end + 1050;
      }

      try {
        // navigating to the npoint page where we past all the item information as json
        await page.goto("https://www.npoint.io/", {
          waitUntil: "networkidle0",
        });

        await page.setViewport({ width: 1050, height: 653 });

        await navigationPromise;

        // logging into npoint
        const nPoint = await page.$(
          ".header > .header-container > .user-info-container > .slide-down-component"
        );

        await nPoint.click();

        const Email = "nehemarya@gmail.com";
        const Password = "Neveragain@app";

        await page.type('[type="email"]', Email);
        await page.type('[type="password"]', Password);

        await page.click(
          ".login-component > .spaced-children > .justify-end > .button-group > .primary"
        ),
          await page.waitForResponse((response) => response.status() === 200);

        await navigationPromise;

        // navigating to the json page
        await page.goto("https://www.npoint.io/docs/fe2363344f2e0980e914", {
          waitUntil: "networkidle0",
        });

        await navigationPromise;

        // focusing and clearing the input field
        await page.click("#brace-editor > textarea");
        await page.keyboard.down("Control");
        await page.keyboard.press("A");
        await page.keyboard.up("Control");
        await page.keyboard.press("Backspace");

        await page.click("#brace-editor > textarea");

        // stringifying and copying the next array to clipboard
        await page.evaluate((next) => {
          return navigator.clipboard.writeText(
            `{ "data": ${JSON.stringify(next)}}`
          );
        }, next);

        // pasting the array in the input field
        await page.keyboard.down("Control");
        await page.keyboard.press("v");
        await page.keyboard.up("Control");

        // saving the updated json
        await page.click(
          ".document-page > .document-page-header > .header > .header-container > .cta"
        );

        // closing the page
        await page.close();

        console.log("done");

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
