# Google Sheet Setup

Use this setup so the website can save registrations and bottle submissions.

1. Open your Google Sheet.
2. Go to Extensions > Apps Script.
3. Replace the code in `Code.gs` with the code from `google-apps-script/Code.gs` in this project.
4. If the Apps Script is not opened from the Google Sheet, put your spreadsheet ID into `SPREADSHEET_ID`.
5. Click Deploy > New deployment.
6. Select type: Web app.
7. Execute as: Me.
8. Who has access: Anyone.
9. Click Deploy and copy the Web app URL.
10. Make sure `GOOGLE_SCRIPT_URL` in `script.js` uses that `/exec` URL.

The sheet tab will be created automatically as `Bottle Submissions`.

Columns saved:

- Timestamp
- Action
- Username
- Phone Number
- Email ID
- Bottle Count
- Total Bottle Count
- Registered At
- Last Submitted At
