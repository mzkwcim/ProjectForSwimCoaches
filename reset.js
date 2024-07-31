function resetRow(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(row, 2, 1, 3).clearContent();
}
