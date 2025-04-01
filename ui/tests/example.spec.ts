import { test, expect } from "@playwright/test";

test("Home Page", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await expect(page).toHaveTitle("T&T Verify");
});

test("Multiple cycles of QR code verification and result display with download and view details modal" ,async ({
  page,
}) => {
  // Function to perform verification steps and check results
  async function verifyQRCodeAndCheckResults() {
    // Step 1: Ensure "Upload QR Code" tab is selected by default
    const uploadTab = await page.locator("#upload-qr-code-tab");
    await expect(uploadTab).toHaveClass(/bg-default_theme-gradient/);

    // Step 2: Click on the "Upload QR Code" tab
    await uploadTab.click();

    // Step 3: Locate and use the file input
    const fileInput = await page.locator('input[type="file"]');
    const filePath = "C:/Users/pkumarm/Downloads/qrcode.png";
    await fileInput.setInputFiles(filePath);

    // Step 4: Wait for loader
    const loader = page.locator("div.mx-auto.mt-\\[30vh\\]");
    await expect(loader).toBeVisible();
    await expect(loader).toBeHidden();

    // Step 5: Verify stepper structure
    const expectedClasses = [
      "text-center",
      "rounded-full",
      "w-6",
      "h-6",
      "flex",
      "items-center",
      "justify-center",
      "font-normal",
      "text-normal",
      "text-smallTextSize",
      "leading-5",
      "bg-no-repeat",
      "bg-default_theme-gradient",
      "text-white",
      "border-1",
      "border-transparent",
    ];

    // Verify step numbers and classes
    const stepNumbers = await page
      .locator("div.text-center.rounded-full.w-6.h-6")
      .all();
    expect(stepNumbers.length).toBe(3);

    for (let i = 0; i < stepNumbers.length; i++) {
      for (const className of expectedClasses) {
        await expect(stepNumbers[i]).toHaveClass(new RegExp(className));
      }
      await expect(stepNumbers[i]).toHaveText(`${i + 1}`);
    }

    // Step 6: Verify stepper content
    await expect(
      page.locator("div#upload-qr-code.text-lgNormalTextSize")
    ).toHaveText("Upload QR Code");
    await expect(
      page.locator("div#upload-qr-code-description.text-normalTextSize")
    ).toHaveText("Upload a file that contains a QR code");

    await expect(
      page.locator("div#verify-document.text-lgNormalTextSize")
    ).toHaveText("Verify document");
    await expect(
      page.locator("div#verify-document-description.text-normalTextSize")
    ).toHaveText("Verification for the document or card is in progress.");

    await expect(
      page.locator("div#view-result.text-lgNormalTextSize")
    ).toHaveText("View result");
    await expect(page.locator("div#view-result-description.ml-9")).toHaveText(
      "View the verification result."
    );

    // Step 7: Verify displayed results
    const expectedResults = {
      fullname: "Challarao V",
      gender: "Male",
      dob: "1991-08-13",
      benefits: "Critical Surgery, Full body checkup",
      policyname: "Start Insurance Gold Premium",
      policynumber: "1234567",
      policyissuedon: "2023-04-20T20:48:17.684Z",
      policyexpireson: "2033-04-20T20:48:17.684Z",
      mobile: "0123456789",
      email: "challarao@beehyv.com",
    };

    for (const [field, expectedValue] of Object.entries(expectedResults)) {
      await expect(page.locator(`#${field}-value`)).toHaveText(expectedValue);
    }

    // Step 8: Verify "Open In Full" button functionality
    const openInFullIcon = page
      .locator("div")
      .filter({ hasText: /^Open In Full$/ })
      .locator("div.flex.items-center.justify-center");
    await expect(openInFullIcon).toBeVisible();
    await expect(openInFullIcon).toHaveClass(/opacity-25/);

    // Verify hover effect for Open In Full button
    await openInFullIcon.hover();
    await expect(openInFullIcon).toHaveClass(/opacity-100/);

    // Click Open In Full button
    await openInFullIcon.click();

    // Verify the full view is displayed
    await expect(page.locator("div.fixed.inset-0")).toBeVisible();

    // Close the full view using the close button
    const closeFullViewButton = page.locator("button").filter({ hasText: "✕" });
    await closeFullViewButton.click();

    // Step 9: Verify download icon functionality
    const downloadIcon = page
      .locator("div")
      .filter({ hasText: /^Download$/ })
      .locator("div.flex.items-center.justify-center");
    await expect(downloadIcon).toBeVisible();
    await expect(downloadIcon).toHaveClass(/opacity-25/);

    // Verify hover effect for download button
    await downloadIcon.hover();
    await expect(downloadIcon).toHaveClass(/opacity-100/);

    // Click download icon and verify download starts
    const downloadPromise = page.waitForEvent("download");
    await downloadIcon.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();

    // Step 10: Click "Verify Another QR Code" button
    const verifyAnotherButton = page.locator(
      'button:has-text("Verify Another QR Code")'
    );
    await verifyAnotherButton.click();
  }

  // Initial page load
  await page.goto("http://localhost:3000");

  // Perform verification cycle multiple times
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(`Starting verification cycle ${cycle}`);
    await verifyQRCodeAndCheckResults();
    console.log(`Completed verification cycle ${cycle}`);
  }
});




