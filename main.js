var isPopupDisplayed = false;

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Niestandardowe menu')
    .addItem('Utwórz tabelę', 'showTrainingPartsDialog')
    .addToUi();
}

function addSelectedPartsToTable(selectedParts) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = ['Część treningu', 'Opis zadania', 'Dystans', 'Typ zadania'];
  var numCols = headers.length;
  var numRows = selectedParts.length + 1;

  sheet.clear();

  for (var i = 0; i < numCols; i++) {
    sheet.getRange(1, i + 1).setValue(headers[i]);
  }

  sheet.getRange(1, 1, 1, numCols).setFontWeight('bold').setFontSize(20);

  for (var row = 1; row <= selectedParts.length; row++) {
    sheet.getRange(row + 1, 1).setValue(selectedParts[row - 1]);
    var typeCell = sheet.getRange(row + 1, 4);
    var typeRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['AEC reg', 'AEC1', 'AEC2', 'AEC3', 'ANC', 'AEP', 'ANP','RP','Zadanie do zmiennego', 'Sprint', 'Technika', 'NN', 'RR', 'Reset'])
        .setAllowInvalid(false)
        .build();
    typeCell.setDataValidation(typeRule);
    sheet.getRange(row + 1, 2).setDataValidation(null);
    sheet.getRange(row + 1, 3).setDataValidation(null);
  }

  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 2, 1).setValue('Edycja tabeli');
  var editCell = sheet.getRange(lastRow + 3, 1);
  var editRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Dodaj wiersz', 'Usuń wiersz'])
      .setAllowInvalid(false)
      .build();
  editCell.setDataValidation(editRule);

  var generateTableTextCell = sheet.getRange(lastRow + 2, 4);
  generateTableTextCell.setValue('Generuj tabelę zadania');

  var generateTableCell = sheet.getRange(lastRow + 3, 4);
  var generateTableRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Generuj tabelę'])
      .setAllowInvalid(false)
      .build();
  generateTableCell.setDataValidation(generateTableRule);

  for (var col = 1; col <= numCols; col++) {
    setColumnWidth(sheet, col);
  }

  sheet.getRange(1, 1, numRows, numCols).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  for (var col = 1; col < numCols; col++) {
    sheet.getRange(1, col, numRows, 1).setBorder(null, null, null, true, null, null, "black", SpreadsheetApp.BorderStyle.SOLID);
  }

  sheet.getRange(1, 1, 1, numCols).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

function onEdit(e) {
  if (!e) {
    return;
  }

  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var value = range.getValue().trim();

  if (range.getColumn() == 4) {
    if (value === "ANC") {
      PropertiesService.getScriptProperties().setProperty('ancRow', range.getRow());
      showANCPopup();
    } else if (value === "AEC2") {
      PropertiesService.getScriptProperties().setProperty('aec2Row', range.getRow());
      showAEC2Popup();
    } else if (value === "AEC3") {
      PropertiesService.getScriptProperties().setProperty('aec3Row', range.getRow());
      showAEC3Popup();
    } else if (value === "AEC reg") {
      PropertiesService.getScriptProperties().setProperty('aecregRow', range.getRow());
      showAECRegPopup();
    } else if (value === "Sprint") {
      PropertiesService.getScriptProperties().setProperty('sprintRow', range.getRow());
      showSprintPopup();
    } else if (value === "NN") {
      PropertiesService.getScriptProperties().setProperty('nnRow', range.getRow());
      showNNPopup();
    } else if (value === "RP") {
      PropertiesService.getScriptProperties().setProperty('rpRow', range.getRow());
      showRPPopup();
    } else if (value === "Technika"){
      PropertiesService.getScriptProperties().setProperty('technikaRow', range.getRow());
      showTechnikaPopup();
    } else if (value === "RR"){
      PropertiesService.getScriptProperties().setProperty('rrRow', range.getRow());
      showRRPopup();
    } else if (value === "AEC1"){
      PropertiesService.getScriptProperties().setProperty('aec1Row', range.getRow());
      showAEC1Popup();
    } else if (value === "Zadanie do zmiennego"){
      PropertiesService.getScriptProperties().setProperty('zmiennyRow', range.getRow());
      showZmiennyPopup();
    } else if (value === "Reset") {
      resetRow(range.getRow());
    } else if (value === 'Generuj tabelę') {
      handleGenerateTable(e);
      range.setValue('');  // Set the cell value to empty
    }
  }

  if (range.getColumn() == 1 && range.getRow() == sheet.getLastRow()) {
    if (value === 'Dodaj wiersz') {
      addNewRow(sheet);
    } else if (value === 'Usuń wiersz') {
      showDeleteRowPopup();
    }
    range.setValue('');
  }
}

function handleGenerateTable(e) {
  var sheet = e.source.getActiveSheet();
  var mainTaskRow = findMainTaskRow(sheet);
  if (mainTaskRow !== -1) {
    var taskType = sheet.getRange(mainTaskRow, 4).getValue().trim();
    if (taskType === 'ANC') {
      showConfirmationDialog();
    } else {
      showErrorMessage('Opcja Generuj tabelę jest dostępna tylko dla treningów z zadaniami ANC.');
    }
  } else {
    showErrorMessage('Nie znaleziono wiersza z Zadaniem głównym.');
  }
}

function findMainTaskRow(sheet) {
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0].trim() === 'Zadanie Główne') {
      return i + 1;  // Row number in sheet (1-based index)
    }
  }
  return -1;
}

function generateTable() {
  // Implement logic for generating the table here
}

function forceAuth() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('Autoryzacja zakończona sukcesem!');
}