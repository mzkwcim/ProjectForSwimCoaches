function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Niestandardowe menu')
    .addItem('Utwórz tabelę', 'showTrainingPartsDialog')
    .addItem('Dodaj nowy wiersz', 'showButton')
    .addToUi();
}

function showTrainingPartsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('index')
      .setWidth(500)
      .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz części treningu');
}

function addSelectedPartsToTable(selectedParts) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = ['Część treningu', 'Opis zadania', 'Dystans', 'Typ zadania'];
  var numCols = headers.length;
  var numRows = selectedParts.length + 1; // Including header row

  // Wyczyść istniejącą zawartość arkusza
  sheet.clear();

  // Wstaw nagłówki
  for (var i = 0; i < numCols; i++) {
    sheet.getRange(1, i + 1).setValue(headers[i]);
  }
  
  // Pogrubienie nagłówków i ustawienie rozmiaru czcionki
  sheet.getRange(1, 1, 1, numCols).setFontWeight('bold').setFontSize(20);

  // Wstaw dane z selectedParts
  for (var row = 1; row <= selectedParts.length; row++) {
    sheet.getRange(row + 1, 1).setValue(selectedParts[row - 1]);
    var typeCell = sheet.getRange(row + 1, 4);
    var typeRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['AEC2', 'AEC3', 'ANC', 'AEP', 'ANP', 'Sprint', 'Technika', 'NN', 'RR', 'AEC reg', 'Reset'])
        .setAllowInvalid(false)
        .build();
    typeCell.setDataValidation(typeRule);

    // Ustaw pustą walidację dla kolumny "Opis zadania"
    var descriptionCell = sheet.getRange(row + 1, 2);
    descriptionCell.setDataValidation(null);

    // Ustaw pustą walidację dla kolumny "Dystans"
    var distanceCell = sheet.getRange(row + 1, 3);
    distanceCell.setDataValidation(null);
  }

  // Dodaj listę rozwijaną do edycji tabeli
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 2, 1).setValue('Edycja tabeli');
  var editCell = sheet.getRange(lastRow + 3, 1);
  var editRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Dodaj wiersz', 'Usuń wiersz'])
      .setAllowInvalid(false)
      .build();
  editCell.setDataValidation(editRule);

  // Ustaw szerokość wszystkich kolumn
  for (var col = 1; col <= numCols; col++) {
    setColumnWidth(sheet, col);
  }

  // Dodaj pogrubioną ramkę dookoła tabeli
  sheet.getRange(1, 1, numRows, numCols).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // Dodaj cienkie pionowe ramki między kolumnami
  for (var col = 1; col < numCols; col++) {
    sheet.getRange(1, col, numRows, 1).setBorder(null, null, null, true, null, null, "black", SpreadsheetApp.BorderStyle.SOLID);
  }

  // Dodaj grubą ramkę do nagłówków
  sheet.getRange(1, 1, 1, numCols).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var value = range.getValue().trim();

  Logger.log('onEdit triggered');
  Logger.log('Edited cell value: ' + value);
  Logger.log('Edited cell row: ' + range.getRow());
  Logger.log('Edited cell column: ' + range.getColumn());
  Logger.log('Last row: ' + sheet.getLastRow());

  // Sprawdź, czy edytowana komórka znajduje się w kolumnie "Typ zadania"
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
    } else if (value === "Reset") {
      resetRow(range.getRow());
    }
  }

  // Sprawdź, czy edytowana komórka to lista rozwijana do edycji tabeli
  if (range.getColumn() == 1 && range.getRow() == sheet.getLastRow()) {
    if (value === 'Dodaj wiersz') {
      Logger.log('Adding new row');
      addNewRow(sheet);
    } else if (value === 'Usuń wiersz') {
      Logger.log('Deleting row');
      showDeleteRowPopup();
    }
    // Reset listy rozwijanej po dokonaniu akcji
    range.setValue('');
  }
}

function addNewRow(sheet) {
  var html = HtmlService.createHtmlOutputFromFile('newRowPopup')
    .setWidth(400)
    .setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(html, 'Dodaj nową część treningu');
}

function processNewRow(trainingPart, rowNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var newRowNum = parseInt(rowNumber);

  // Sprawdź, czy wiersz, w którym ma być dodany nowy wiersz, jest poprawny
  if (newRowNum < 1 || newRowNum > lastRow + 1) {
    SpreadsheetApp.getUi().alert('Nieprawidłowy numer wiersza.');
    return;
  }

  // Usuń "Edycja tabeli" i listę rozwijaną
  sheet.getRange(lastRow, 1).clearContent();
  sheet.getRange(lastRow + 1, 1, 2, 2).clearContent().clearDataValidations();
  sheet.getRange(lastRow + 3, 1, 2, 2).clearContent().clearDataValidations();

  // Wstaw nowy wiersz przed wybranym wierszem i ustaw dane
  sheet.insertRowBefore(newRowNum);
  sheet.getRange(newRowNum, 1).setValue(trainingPart);

  var typeCell = sheet.getRange(newRowNum, 4);
  var typeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['AEC2', 'AEC3', 'ANC', 'AEP', 'ANP', 'Sprint', 'Technika', 'NN', 'RR', 'AEC reg', 'Reset'])
      .setAllowInvalid(false)
      .build();
  typeCell.setDataValidation(typeRule);

  // Ustaw pustą walidację dla kolumny "Opis zadania"
  var descriptionCell = sheet.getRange(newRowNum, 2);
  descriptionCell.setDataValidation(null);

  // Ustaw pustą walidację dla kolumny "Dystans"
  var distanceCell = sheet.getRange(newRowNum, 3);
  distanceCell.setDataValidation(null);

  // Usuń wszystkie obramowania
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setBorder(false, false, false, false, false, false);

  // Dodaj nowe obramowania
  updateBorders(sheet);

  // Ponownie ustaw listę rozwijaną "Edycja tabeli"
  var newEditOptionsRow = sheet.getLastRow() + 2;
  sheet.getRange(newEditOptionsRow, 1).setValue('Edycja tabeli');
  var editCell = sheet.getRange(newEditOptionsRow + 1, 1);
  var editRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Dodaj wiersz', 'Usuń wiersz'])
      .setAllowInvalid(false)
      .build();
  editCell.setDataValidation(editRule);
}

function deleteLastRow(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 3) { // Zapobiega usunięciu nagłówków i pierwszego wiersza
    // Usuń "Edycja tabeli" i listę rozwijaną
    sheet.getRange(lastRow + 1, 1, 2, 1).clearContent().clearDataValidations();

    sheet.deleteRow(lastRow - 2); // Usuń przedostatni wiersz, czyli ostatni wiersz danych

    // Usuń wszystkie obramowania
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setBorder(false, false, false, false, false, false);

    // Dodaj nowe obramowania
    updateBorders(sheet);

    // Ponownie ustaw listę rozwijaną "Edycja tabeli"
    var newEditOptionsRow = sheet.getLastRow() + 2;
    sheet.getRange(newEditOptionsRow, 1).setValue('Edycja tabeli');
    var editCell = sheet.getRange(newEditOptionsRow + 1, 1);
    var editRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Dodaj wiersz', 'Usuń wiersz'])
        .setAllowInvalid(false)
        .build();
    editCell.setDataValidation(editRule);
  }
}

function updateBorders(sheet) {
  var numRows = sheet.getLastRow();
  var numCols = sheet.getLastColumn();

  // Dodaj pogrubioną ramkę dookoła tabeli
  sheet.getRange(1, 1, numRows, numCols).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // Dodaj cienkie pionowe ramki między kolumnami
  for (var col = 1; col < numCols; col++) {
    sheet.getRange(1, col, numRows, 1).setBorder(null, null, null, true, null, null, "black", SpreadsheetApp.BorderStyle.SOLID);
  }

  // Dodaj grubą ramkę do nagłówków
  sheet.getRange(1, 1, 1, numCols).setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

function showANCPopup() {
  var html = HtmlService.createHtmlOutputFromFile('ancPopup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz parametry zadania ANC');
}

function showAEC2Popup() {
  var html = HtmlService.createHtmlOutputFromFile('aec2Popup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz parametry zadania AEC2');
}

function showAEC3Popup() {
  var html = HtmlService.createHtmlOutputFromFile('aec3Popup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz parametry zadania AEC3');
}

function showAECRegPopup() {
  var html = HtmlService.createHtmlOutputFromFile('aecregPopup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz parametry zadania AEC reg');
}

function showSprintPopup() {
  var html = HtmlService.createHtmlOutputFromFile('sprintPopup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz parametry zadania Sprint');
}

function showNNPopup() {
  var html = HtmlService.createHtmlOutputFromFile('nnPopup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz parametry zadania NN');
}

function resetRow(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(row, 2, 1, 3).clearContent();
  SpreadsheetApp.getUi().alert('Wiersz został zresetowany. Możesz teraz ustawić nowe zadanie.');
}

function showButton() {
  var html = HtmlService.createHtmlOutputFromFile('button')
      .setWidth(300)
      .setHeight(100);
  SpreadsheetApp.getUi().showModalDialog(html, 'Dodaj wiersz');
}

function showDeleteRowPopup() {
  var html = HtmlService.createHtmlOutputFromFile('deleteRowPopup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Usuń wiersz');
}

function getRowNumbers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var rowNumbers = [];
  for (var i = 2; i < lastRow; i++) { // Zakładając, że nagłówki są w pierwszym wierszu
    rowNumbers.push(i);
  }
  return rowNumbers;
}

function deleteSelectedRow(rowNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var rowNum = parseInt(rowNumber);

  // Sprawdź, czy wiersz, który ma być usunięty, jest poprawny
  if (rowNum < 2 || rowNum > lastRow) {
    SpreadsheetApp.getUi().alert('Nieprawidłowy numer wiersza.');
    return;
  }

  // Usuń "Edycja tabeli" i listę rozwijaną
  sheet.getRange(lastRow, 1).clearContent();
  sheet.getRange(lastRow + 1, 1, 2, 2).clearContent().clearDataValidations();
  sheet.getRange(lastRow + 3, 1, 2, 2).clearContent().clearDataValidations();

  // Usuń wybrany wiersz
  sheet.deleteRow(rowNum);

  // Usuń wszystkie obramowania
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setBorder(false, false, false, false, false, false);

  // Dodaj nowe obramowania
  updateBorders(sheet);

  // Ponownie ustaw listę rozwijaną "Edycja tabeli"
  var newEditOptionsRow = sheet.getLastRow() + 2;
  sheet.getRange(newEditOptionsRow, 1).setValue('Edycja tabeli');
  var editCell = sheet.getRange(newEditOptionsRow + 1, 1);
  var editRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Dodaj wiersz', 'Usuń wiersz'])
      .setAllowInvalid(false)
      .build();
  editCell.setDataValidation(editRule);
}

function processANCParams(series, repetitions, distance, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('ancRow');
  
  // Zastąpienie kropek na przecinki
  series = series.replace(/\./g, ",");
  repetitions = repetitions.replace(/\./g, ",");
  distance = distance.replace(/\./g, ",");

  // Konwersja wartości na liczby całkowite
  var seriesInt = Math.floor(parseFloat(series));
  var repetitionsInt = Math.floor(parseFloat(repetitions));
  var distanceInt = Math.floor(parseFloat(distance));
  var restInt = Math.floor(parseFloat(rest));

  Logger.log('Processing ANC Params for row: ' + row);
  Logger.log('Series: ' + seriesInt + ', Repetitions: ' + repetitionsInt + ', Distance: ' + distanceInt + ', Rest: ' + restInt);

  // Formatowanie przerwy
  var restFormatted;
  if (restInt < 60) {
    restFormatted = restInt + '"';
  } else {
    var minutes = Math.floor(restInt / 60);
    var seconds = restInt % 60;
    restFormatted = minutes + "'";
    if (seconds > 0) {
      restFormatted += seconds + '"';
    }
  }

  Logger.log('Rest Formatted: ' + restFormatted);

  var description = seriesInt + " x " + repetitionsInt + " x " + distanceInt + "m, " + restFormatted;
  var totalDistance = seriesInt * repetitionsInt * distanceInt;

  Logger.log('Description: ' + description);
  Logger.log('Total Distance: ' + totalDistance);

  sheet.getRange(parseInt(row), 1).setVerticalAlignment("middle").setHorizontalAlignment("center");
  sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Opis zadania z zawijaniem tekstu
  sheet.getRange(parseInt(row), 3).setValue(totalDistance).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Dystans
  sheet.getRange(parseInt(row), 4).setVerticalAlignment("middle").setHorizontalAlignment("center");
}

function processAEC2Params(repetitions, distance, hardSegment, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aec2Row');
  
  // Konwersja wartości na liczby całkowite
  var repetitionsInt = Math.floor(parseFloat(repetitions));
  var distanceInt = Math.floor(parseFloat(distance));
  var hardSegmentInt = Math.floor(parseFloat(hardSegment));
  var restInt = Math.floor(parseFloat(rest));

  Logger.log('Processing AEC2 Params for row: ' + row);
  Logger.log('Repetitions: ' + repetitionsInt + ', Distance: ' + distanceInt + ', Hard Segment: ' + hardSegmentInt + ', Rest: ' + restInt);

  var easySegmentInt = distanceInt - hardSegmentInt;

  // Formatowanie przerwy
  var restFormatted;
  if (restInt < 60) {
    restFormatted = restInt + '"';
  } else {
    var minutes = Math.floor(restInt / 60);
    var seconds = restInt % 60;
    restFormatted = minutes + "'";
    if (seconds > 0) {
      restFormatted += seconds + '"';
    }
  }

  Logger.log('Rest Formatted: ' + restFormatted);

  var description = repetitionsInt + " x " + distanceInt + "m (" + hardSegmentInt + "m mocno + " + easySegmentInt + "m spokojnie), " + restFormatted;
  var totalDistance = repetitionsInt * distanceInt;

  Logger.log('Description: ' + description);
  Logger.log('Total Distance: ' + totalDistance);

  sheet.getRange(parseInt(row), 1).setVerticalAlignment("middle").setHorizontalAlignment("center");
  sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Opis zadania z zawijaniem tekstu
  sheet.getRange(parseInt(row), 3).setValue(totalDistance).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Dystans
  sheet.getRange(parseInt(row), 4).setVerticalAlignment("middle").setHorizontalAlignment("center");
}

function processAEC3Params(task, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aec3Row');
  
  // Konwersja wartości na liczby całkowite
  var restInt = Math.floor(parseFloat(rest));

  Logger.log('Processing AEC3 Params for row: ' + row);
  Logger.log('Task: ' + task + ', Rest: ' + restInt);

  // Formatowanie przerwy
  var restFormatted;
  if (restInt < 60) {
    restFormatted = restInt + '"';
  } else {
    var minutes = Math.floor(restInt / 60);
    var seconds = restInt % 60;
    restFormatted = minutes + "'";
    if (seconds > 0) {
      restFormatted += seconds + '"';
    }
  }

  Logger.log('Rest Formatted: ' + restFormatted);

  var description = task + " progresja (" + restFormatted + ") AEC3";

  Logger.log('Description: ' + description);
  sheet.getRange(parseInt(row), 1).setVerticalAlignment("middle").setHorizontalAlignment("center");
  sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Opis zadania z zawijaniem tekstu
  sheet.getRange(parseInt(row), 3).setValue(300).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center");
  sheet.getRange(parseInt(row), 4).setVerticalAlignment("middle").setHorizontalAlignment("center");
}

function processAECRegParams(distance, description) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aecregRow');
  
  // Konwersja wartości na liczby całkowite
  var distanceInt = Math.floor(parseFloat(distance));

  Logger.log('Processing AEC reg Params for row: ' + row);
  Logger.log('Distance: ' + distanceInt + ', Description: ' + description);

  var fullDescription = distanceInt + "m - (" + description + ")";

  Logger.log('Full Description: ' + fullDescription);

  sheet.getRange(parseInt(row), 1).setVerticalAlignment("middle").setHorizontalAlignment("center");
  sheet.getRange(parseInt(row), 2).setValue(fullDescription).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Opis zadania z zawijaniem tekstu
  sheet.getRange(parseInt(row), 3).setValue(distanceInt).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Dystans
  sheet.getRange(parseInt(row), 4).setVerticalAlignment("middle").setHorizontalAlignment("center");
}

function processSprintParams(seriesParams, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('sprintRow');
  
  Logger.log('Processing Sprint Params for row: ' + row);
  Logger.log('Series Params: ' + JSON.stringify(seriesParams));
  Logger.log('Rest: ' + rest);

  var totalRepetitions = 0;
  var allRepetitionsEqual = true;
  var firstRepetitions = seriesParams[0].repetitions;

  seriesParams.forEach(param => {
    totalRepetitions += parseInt(param.repetitions);
    if (param.repetitions !== firstRepetitions) {
      allRepetitionsEqual = false;
    }
  });

  var totalDistance = totalRepetitions * 25;

  // Formatowanie przerwy
  var restFormatted;
  if (rest < 60) {
    restFormatted = rest + '"';
  } else {
    var minutes = Math.floor(rest / 60);
    var seconds = rest % 60;
    restFormatted = minutes + "'";
    if (seconds > 0) {
      restFormatted += seconds + '"';
    }
  }

  var description = '';
  if (allRepetitionsEqual) {
    description = `${seriesParams.length}x${firstRepetitions}x25m Sprint (15m (${seriesParams[0].accent}) + 10m luźno) Przerwa: ${restFormatted}\n`;
  } else {
    description = `${seriesParams.length} serii w układzie:\n`;
    seriesParams.forEach((param, index) => {
      description += `${index + 1}) ${param.repetitions}x25m Sprint (15m (${param.accent}) + 10m luźno) Przerwa: ${restFormatted}\n`;
    });
  }

  Logger.log('Description: ' + description);
  Logger.log('Total Distance: ' + totalDistance);

  sheet.getRange(parseInt(row), 2).setValue(description.trim()).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Opis zadania z zawijaniem tekstu i wyrównaniem
  sheet.getRange(parseInt(row), 3).setValue(totalDistance).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Dystans z wyrównaniem
}

function processNNParams(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('nnRow');
  
  Logger.log('Processing NN Params for row: ' + row);
  Logger.log('Params: ' + JSON.stringify(params));

  if (params.subtaskType === 'ANC') {
    var seriesInt = Math.floor(parseFloat(params.series));
    var repetitionsInt = Math.floor(parseFloat(params.repetitions));
    var distanceInt = Math.floor(parseFloat(params.distance));
    var restInt = Math.floor(parseFloat(params.rest));

    // Formatowanie przerwy
    var restFormatted;
    if (restInt < 60) {
      restFormatted = restInt + '"';
    } else {
      var minutes = Math.floor(restInt / 60);
      var seconds = restInt % 60;
      restFormatted = minutes + "'";
      if (seconds > 0) {
        restFormatted += seconds + '"';
      }
    }

    var description = `${seriesInt} x ${repetitionsInt} x ${distanceInt}m, Przerwa: ${restFormatted}`;
    var totalDistance = seriesInt * repetitionsInt * distanceInt;

    Logger.log('Description: ' + description);
    Logger.log('Total Distance: ' + totalDistance);

    sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Opis zadania z zawijaniem tekstu i wyrównaniem
    sheet.getRange(parseInt(row), 3).setValue(totalDistance).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Dystans z wyrównaniem
  } else if (params.subtaskType === 'AEC2') {
    var seriesInt = Math.floor(parseFloat(params.series));
    var totalDistanceInt = Math.floor(parseFloat(params.totalDistance));
    var hardSegmentDistanceInt = Math.floor(parseFloat(params.hardSegmentDistance));
    var restInt = Math.floor(parseFloat(params.rest));

    // Obliczanie łatwego segmentu
    var easySegmentDistanceInt = totalDistanceInt - hardSegmentDistanceInt;

    // Formatowanie przerwy
    var restFormatted;
    if (restInt < 60) {
      restFormatted = restInt + '"';
    } else {
      var minutes = Math.floor(restInt / 60);
      var seconds = restInt % 60;
      restFormatted = minutes + "'";
      if (seconds > 0) {
        restFormatted += seconds + '"';
      }
    }

    var description = `${seriesInt} x ${totalDistanceInt}m (${hardSegmentDistanceInt}m mocno + ${easySegmentDistanceInt}m luźno), Przerwa: ${restFormatted}`;
    var totalDistance = seriesInt * totalDistanceInt;

    Logger.log('Description: ' + description);
    Logger.log('Total Distance: ' + totalDistance);

    sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Opis zadania z zawijaniem tekstu i wyrównaniem
    sheet.getRange(parseInt(row), 3).setValue(totalDistance).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Dystans z wyrównaniem
  } else if (params.subtaskType === 'AEC1') {
    var repetitionsInt = Math.floor(parseFloat(params.repetitions));
    var distanceInt = Math.floor(parseFloat(params.distance));
    var restInt = Math.floor(parseFloat(params.rest));

    // Formatowanie przerwy
    var restFormatted;
    if (restInt < 60) {
      restFormatted = restInt + '"';
    } else {
      var minutes = Math.floor(restInt / 60);
      var seconds = restInt % 60;
      restFormatted = minutes + "'";
      if (seconds > 0) {
        restFormatted += seconds + '"';
      }
    }

    var description = `${repetitionsInt} x ${distanceInt}m, Przerwa: ${restFormatted}`;
    var totalDistance = repetitionsInt * distanceInt;

    Logger.log('Description: ' + description);
    Logger.log('Total Distance: ' + totalDistance);

    sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Opis zadania z zawijaniem tekstu i wyrównaniem
    sheet.getRange(parseInt(row), 3).setValue(totalDistance).setVerticalAlignment("middle").setHorizontalAlignment("center"); // Dystans z wyrównaniem
  }

  // Inne podzadania można dodać tutaj w przyszłości
}


function setColumnWidth(sheet, col) {
  var data = sheet.getRange(1, col, sheet.getLastRow(), 1).getDisplayValues();
  var maxLength = 0;
  var fontSize = 10; // Domyślny rozmiar czcionki
  var fontWeight = 'normal'; // Domyślna waga czcionki
  
  // Znajdź najdłuższy tekst w kolumnie i pobierz właściwości czcionki
  for (var i = 0; i < data.length; i++) {
    var textLength = data[i][0].length;
    if (textLength > maxLength) {
      maxLength = textLength;
      // Pobierz właściwości czcionki z najdłuższego tekstu
      var cell = sheet.getRange(i + 1, col);
      fontSize = cell.getFontSize();
      fontWeight = cell.getFontWeight();
    }
  }

  // Oblicz szerokość kolumny na podstawie długości najdłuższego tekstu, rozmiaru czcionki i wagi czcionki
  var baseWidth = fontSize * 0.65; // Przeciętna szerokość znaku to 0.6 rozmiaru czcionki
  if (fontWeight === 'bold') {
    baseWidth *= 1.1; // Jeśli czcionka jest pogrubiona, zwiększ szerokość o 10%
  }
  var newWidth = (maxLength * baseWidth) + 30; // Dodaj 30 pikseli zapasu
  sheet.setColumnWidth(col, newWidth);
}
