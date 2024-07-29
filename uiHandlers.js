function addNewRow(sheet) {
  var html = HtmlService.createHtmlOutputFromFile('newRowPopup')
    .setWidth(400)
    .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(html, 'Dodaj nową część treningu');
}

function showDeleteRowPopup() {
  var html = HtmlService.createHtmlOutputFromFile('deleteRowPopup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Usuń wiersz');
}

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
  sheet.getRange(lastRow + 3, 1, 2, 2).clearContent().clearDataValidations();

  sheet.insertRowBefore(newRowNum);
  sheet.getRange(newRowNum, 1).setValue(trainingPart);

  var typeCell = sheet.getRange(newRowNum, 4);
  var typeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['AEC2', 'AEC3', 'ANC', 'AEP', 'ANP', 'Sprint', 'Technika', 'NN', 'RR', 'AEC reg', 'Reset'])
      .setAllowInvalid(false)
      .build();
  typeCell.setDataValidation(typeRule);

  sheet.getRange(newRowNum, 2).setDataValidation(null);
  sheet.getRange(newRowNum, 3).setDataValidation(null);

  updatePosition(sheet);
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

  updatePosition(sheet);
}

function processTableChanges(rows) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();

  sheet.deleteRows(2, lastRow - 1);

  rows.forEach((row, index) => {
    sheet.insertRowAfter(index + 1);
    sheet.getRange(index + 2, 1).setValue(row);
  });
  updatePosition(sheet);
}

function updatePosition(sheet){
  updateBorders(sheet);

  var newEditOptionsRow = sheet.getLastRow() + 2;
  sheet.getRange(newEditOptionsRow, 1).setValue('Edycja tabeli');
  var editCell = sheet.getRange(newEditOptionsRow + 1, 1);
  var editRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Dodaj wiersz', 'Usuń wiersz'])
      .setAllowInvalid(false)
      .build();
  editCell.setDataValidation(editRule);
}

function getRowNumbers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var rowNumbers = [];
  for (var i = 2; i < lastRow; i++) { // Zakładając, że nagłówki są w pierwszym wierszu
    rowNumbers.push(i);
  }
  Logger.log('Row Numbers: ' + rowNumbers);
  return rowNumbers;
}

