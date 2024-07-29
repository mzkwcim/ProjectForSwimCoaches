function updateBorders(sheet) {
  var numRows = sheet.getLastRow();
  var numCols = sheet.getLastColumn();

  sheet.getRange(1, 1, numRows, numCols).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  for (var col = 1; col < numCols; col++) {
    sheet.getRange(1, col, numRows, 1).setBorder(null, null, null, true, null, null, "black", SpreadsheetApp.BorderStyle.SOLID);
  }

  sheet.getRange(1, 1, 1, numCols).setBorder(true, true, true, true, true, true, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}
