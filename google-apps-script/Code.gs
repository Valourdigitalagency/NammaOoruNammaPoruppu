const SPREADSHEET_ID = ''
const SHEET_NAME = 'Bottle Submissions'
const HEADERS = [
  'Timestamp',
  'Action',
  'Username',
  'Phone Number',
  'Email ID',
  'Bottle Count',
  'Total Bottle Count',
  'Registered At',
  'Last Submitted At',
]

function doGet() {
  return jsonResponse({
    ok: true,
    message: 'Bottle submission web app is running.',
  })
}

function doPost(e) {
  try {
    const data = parseRequestData(e)
    const sheet = getOrCreateSheet()
    const now = new Date()

    sheet.appendRow([
      data.timestamp || now.toISOString(),
      data.action || '',
      data.username || data.name || '',
      data.phoneNumber || data.phone || '',
      data.emailId || data.email || '',
      numberOrZero(data.bottleCount || data.submittedBottles || data.count),
      numberOrZero(data.totalBottleCount || data.totalBottles || data.count),
      data.registeredAt || '',
      data.lastSubmittedAt || '',
    ])

    return jsonResponse({
      ok: true,
      saved: true,
    })
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: String(error && error.message ? error.message : error),
    })
  }
}

function parseRequestData(e) {
  const params = Object.assign({}, e && e.parameter ? e.parameter : {})
  const contents = e && e.postData && e.postData.contents ? e.postData.contents : ''

  if (Object.keys(params).length > 0) return params
  if (!contents) return {}

  try {
    return JSON.parse(contents)
  } catch (error) {
    return contents.split('&').reduce(function (result, pair) {
      const parts = pair.split('=')
      const key = decodeURIComponent(parts[0] || '').trim()
      const value = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '))
      if (key) result[key] = value
      return result
    }, {})
  }
}

function getOrCreateSheet() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet()

  if (!spreadsheet) {
    throw new Error('No spreadsheet found. Bind this script to a Google Sheet or set SPREADSHEET_ID.')
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME)

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME)
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    sheet.setFrozenRows(1)
  }

  return sheet
}

function numberOrZero(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
