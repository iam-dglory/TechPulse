# Google Sheets Integration for Book a Demo Form

This guide will help you set up Google Sheets to automatically receive demo requests from your website.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "+ Blank" to create a new spreadsheet
3. Name it "TexhPulze Demo Requests"
4. In the first row, add these column headers:
   - Column A: **Timestamp**
   - Column B: **Name**
   - Column C: **Email**
   - Column D: **Company**
   - Column E: **Phone**
   - Column F: **Message**

## Step 2: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste the following code:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);

    // Format timestamp
    var timestamp = new Date(data.timestamp);

    // Append row with data
    sheet.appendRow([
      timestamp,
      data.name,
      data.email,
      data.company,
      data.phone,
      data.message
    ]);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (disk icon)
5. Name your project "TexhPulze Demo Webhook"

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in the settings:
   - **Description**: TexhPulze Demo Form Handler
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to [project name] (unsafe)**
9. Click **Allow**
10. **Copy the Web app URL** - it will look like:
    ```
    https://script.google.com/macros/s/XXXXX.../exec
    ```

## Step 4: Add Webhook URL to Vercel

Now you need to add the webhook URL to your Vercel environment variables:

### Using Vercel CLI:

```bash
cd "C:\Users\GOPIKA ARAVIND\TechPulze"
echo "YOUR_WEBHOOK_URL_HERE" | vercel env add GOOGLE_SHEETS_WEBHOOK_URL production
```

Replace `YOUR_WEBHOOK_URL_HERE` with the actual URL you copied.

### Or using Vercel Dashboard:

1. Go to: https://vercel.com/gopikaaravind2003-1188s-projects/techpulze/settings/environment-variables
2. Click "Add New"
3. **Key**: `GOOGLE_SHEETS_WEBHOOK_URL`
4. **Value**: Paste your webhook URL
5. **Environments**: Select "Production", "Preview", and "Development"
6. Click "Save"

## Step 5: Redeploy Your Site

After adding the environment variable, redeploy your site:

```bash
cd "C:\Users\GOPIKA ARAVIND\TechPulze"
vercel --prod
```

## Testing the Integration

1. Go to your website: www.texhpulze.com
2. Click "Book a Demo"
3. Fill out the form
4. Submit
5. Check your Google Sheet - a new row should appear with the demo request!

## Optional: Email Notifications

To get email notifications when someone submits a demo request:

1. In your Google Sheet, click **Tools** → **Notification rules**
2. Select **A user submits a form**
3. Choose **Email - right away**
4. Click **Save**

OR add this to your Apps Script (before the return statement):

```javascript
// Send email notification
MailApp.sendEmail({
  to: "your-email@example.com",
  subject: "New Demo Request from " + data.company,
  body: "Name: " + data.name + "\n" +
        "Email: " + data.email + "\n" +
        "Company: " + data.company + "\n" +
        "Phone: " + data.phone + "\n" +
        "Message: " + data.message
});
```

## Troubleshooting

### Form submits but data doesn't appear in Google Sheets:

1. Check that the webhook URL is correct in Vercel
2. Make sure you deployed the Apps Script as a web app
3. Verify the spreadsheet has the correct column headers
4. Check the Apps Script execution logs: **Extensions** → **Apps Script** → **Executions**

### "Permission denied" error:

1. Go back to Step 3 and make sure "Who has access" is set to "Anyone"
2. Redeploy the web app

### Data appears but in wrong format:

1. Check that the column headers match exactly (case-sensitive)
2. Verify the Apps Script code matches the code above

## Advanced: Auto-formatting

Add this function to your Apps Script to auto-format new rows:

```javascript
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var row = e.range.getRow();

  // Format timestamp column
  sheet.getRange(row, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

  // Make email clickable
  var email = sheet.getRange(row, 3).getValue();
  sheet.getRange(row, 3).setFormula('=HYPERLINK("mailto:' + email + '","' + email + '")');
}
```

---

That's it! Your demo form is now connected to Google Sheets. Every submission will automatically create a new row in your spreadsheet.
