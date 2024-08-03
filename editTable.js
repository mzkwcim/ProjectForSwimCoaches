function processNewRow(trainingPart, rowNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var newRowNum = parseInt(rowNumber);

  if (newRowNum < 1 || newRowNum > lastRow + 1) {
    SpreadsheetApp.getUi().alert('Nieprawidłowy numer wiersza.');
    return;
  }

  sheet.getRange(lastRow, 1).clearContent();
  sheet.getRange(lastRow + 1, 1, 2, 2).clearContent().clearDataValidations();

  sheet.insertRowBefore(newRowNum);
  sheet.getRange(newRowNum, 1).setValue(trainingPart);

  var typeCell = sheet.getRange(newRowNum, 4);
  var typeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['AEC reg', 'AEC1', 'AEC2', 'AEC3', 'ANC', 'AEP', 'ANP','RP','Zadanie do zmiennego', 'Sprint', 'Technika', 'NN', 'RR', 'Reset'])
      .setAllowInvalid(false)
      .build();
  typeCell.setDataValidation(typeRule);
  sheet.getRange(newRowNum, 2).setDataValidation(null);
  sheet.getRange(newRowNum, 3).setDataValidation(null);

  updateBorders(sheet);

  relocate(sheet);
}

function deleteSelectedRow(rowNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var rowNum = parseInt(rowNumber);

  if (rowNum < 2 || rowNum > lastRow) {
    SpreadsheetApp.getUi().alert('Nieprawidłowy numer wiersza.');
    return;
  }

  sheet.getRange(lastRow, 1).clearContent();
  sheet.getRange(lastRow + 1, 1, 2, 2).clearContent().clearDataValidations();

  sheet.deleteRow(rowNum);

  updateBorders(sheet);

  relocate(sheet);
}

function resetRow(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(row, 2, 1, 3).clearContent();
  SpreadsheetApp.getUi().alert('Wiersz został zresetowany. Możesz teraz ustawić nowe zadanie.');
}

function updateBorders(sheet) {
  var numRows = sheet.getLastRow();
  var numCols = sheet.getLastColumn();

  sheet.getRange(1, 1, numRows, numCols).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  for (var col = 1; col < numCols; col++) {
    sheet.getRange(1, col, numRows, 1).setBorder(null, null, null, true, null, null, "black", SpreadsheetApp.BorderStyle.SOLID);
  }

  sheet.getRange(1, 1, 1, numCols).setBorder(true, true, true, true, true, true, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

function setColumnWidth(sheet, col) {
  var data = sheet.getRange(1, col, sheet.getLastRow(), 1).getDisplayValues();
  var maxLength = 0;
  var fontSize = 10;
  var fontWeight = 'normal';
  
  for (var i = 0; i < data.length; i++) {
    var textLength = data[i][0].length;
    if (textLength > maxLength) {
      maxLength = textLength;
      var cell = sheet.getRange(i + 1, col);
      fontSize = cell.getFontSize();
      fontWeight = cell.getFontWeight();
    }
  }

  var baseWidth = fontSize * 0.65;
  if (fontWeight === 'bold') {
    baseWidth *= 1.1;
  }
  var newWidth = (maxLength * baseWidth) + 30;
  sheet.setColumnWidth(col, newWidth);
}

function relocate(sheet){
  var newEditOptionsRow = sheet.getLastRow() + 2;
  sheet.getRange(newEditOptionsRow, 1).setValue('Edycja tabeli');
  var editCell = sheet.getRange(newEditOptionsRow + 1, 1);
  var editRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Dodaj wiersz', 'Usuń wiersz'])
      .setAllowInvalid(false)
      .build();
  editCell.setDataValidation(editRule);
}
