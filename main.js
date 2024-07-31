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
        .requireValueInList(['AEC2', 'AEC3', 'ANC', 'AEP', 'ANP','RP', 'Sprint', 'Technika', 'NN', 'RR', 'AEC reg', 'Reset'])
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
    } else if (value === "Reset") {
      resetRow(range.getRow());
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