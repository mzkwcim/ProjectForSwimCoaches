function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Niestandardowe menu')
    .addItem('Utwórz tabelę', 'showTrainingPartsDialog')
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
    if (selectedParts[row - 1] === "Rozpływanie" || selectedParts[row - 1] === "Rozpływanie końcowe") {
      sheet.getRange(row + 1, 4).setValue("AEC reg");
    } else {
      var typeCell = sheet.getRange(row + 1, 4);
      var typeRule = SpreadsheetApp.newDataValidation()
          .requireValueInList(['AEC2', 'AEC3', 'ANC', 'AEP', 'ANP', 'Sprint', 'Technika', 'NN', 'RR'])
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
  }

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

  // Sprawdź, czy edytowana komórka znajduje się w kolumnie "Typ zadania"
  if (range.getColumn() == 4) {
    if (value === "ANC") {
      PropertiesService.getScriptProperties().setProperty('ancRow', range.getRow());
      showANCPopup();
    } else if (value === "AEC2") {
      PropertiesService.getScriptProperties().setProperty('aec2Row', range.getRow());
      showAEC2Popup();
    }
  }
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

  sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true); // Opis zadania
  sheet.getRange(parseInt(row), 3).setValue(totalDistance); // Dystans
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

  var description = repetitionsInt + " x " + distanceInt + "m (" + hardSegmentInt + "m mocno + " + easySegmentInt + "m spokojnie) " + restFormatted;
  var totalDistance = repetitionsInt * distanceInt;

  Logger.log('Description: ' + description);
  Logger.log('Total Distance: ' + totalDistance);

  sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true); // Opis zadania
  sheet.getRange(parseInt(row), 3).setValue(totalDistance); // Dystans
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
  var baseWidth = fontSize * 0.6; // Przeciętna szerokość znaku to 0.6 rozmiaru czcionki
  if (fontWeight === 'bold') {
    baseWidth *= 1.1; // Jeśli czcionka jest pogrubiona, zwiększ szerokość o 10%
  }
  var newWidth = (maxLength * baseWidth) + 30; // Dodaj 30 pikseli zapasu
  sheet.setColumnWidth(col, newWidth);
}
