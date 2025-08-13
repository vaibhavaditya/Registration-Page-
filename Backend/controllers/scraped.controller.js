import puppeteer from "puppeteer";
import { asyncHandler } from "../utils/asyncHandler.js";

const registrationDetails = asyncHandler(async (req, res) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://udyamregistration.gov.in/UdyamRegistration.aspx", {
        waitUntil: "networkidle2",
    });

    await page.waitForSelector("#ctl00_ContentPlaceHolder1_txtadharno");

    // Extract Step 1 form elements
    const step1Elements = await page.evaluate(() => {
        const selectors = [
            "#ctl00_ContentPlaceHolder1_txtadharno",
            "#ctl00_ContentPlaceHolder1_txtownername",
            "#ctl00_ContentPlaceHolder1_btnValidateAadhaar"
        ];

        return selectors.map(sel => {
            const el = document.querySelector(sel);
            if (!el) return null;

            return {
                tag: el.tagName.toLowerCase(),
                label: el.labels?.[0]?.innerText || el.getAttribute("placeholder") || el.value || "",
                name: el.getAttribute("name"),
                id: el.id,
                type: el.type || "",
                value: el.value || "",
                maxlength: el.getAttribute("maxlength") || null,
                tabindex: el.getAttribute("tabindex") || null,
                class: el.getAttribute("class") || "",
                autocomplete: el.getAttribute("autocomplete") || "",
                required: el.hasAttribute("required"),
                pattern: el.getAttribute("pattern") || null
            };
        }).filter(Boolean);
    });

    // Extract consent checkbox
    const consentCheckbox = await page.evaluate(() => {
        const checkbox = document.querySelector("#ctl00_ContentPlaceHolder1_chkDecarationA");
        if (!checkbox) return null;

        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        const consentText = label?.innerText || checkbox.parentElement.innerText.trim();
        return {
            tag: checkbox.tagName.toLowerCase(),
            type: checkbox.type,
            name: checkbox.name,
            id: checkbox.id,
            checked: checkbox.checked,
            tabindex: checkbox.getAttribute("tabindex"),
            text: consentText
        };
    });

    // Extract dropdowns from nav menu
    const dropdowns = await page.evaluate(() => {
        const nav = document.querySelector("nav.nav-menu");
        if (!nav) return [];

        const dropdownItems = [];
        const dropDownElements = nav.querySelectorAll("li.drop-down");

        dropDownElements.forEach(drop => {
            const mainLink = drop.querySelector("a")?.innerText || "Unnamed";
            const subLinks = Array.from(drop.querySelectorAll("ul li a")).map(a => ({
                text: a.innerText,
                href: a.href
            }));

            dropdownItems.push({
                label: mainLink,
                subItems: subLinks
            });
        });

        return dropdownItems;
    });

    await browser.close();

    // Send the scraped data as response
    res.json({
        step1: step1Elements,
        consent: consentCheckbox,
        dropdowns
    });
});

export { registrationDetails };
