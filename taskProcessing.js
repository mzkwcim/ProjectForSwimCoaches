function processANCParams(series, repetitions, distance, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('ancRow');

  series = series.replace(/\./g, ",");
  repetitions = repetitions.replace(/\./g, ",");
  distance = distance.replace(/\./g, ",");

  var seriesInt = Math.floor(parseFloat(series));
  var repetitionsInt = Math.floor(parseFloat(repetitions));
  var distanceInt = Math.floor(parseFloat(distance));
  var restInt = Math.floor(parseFloat(rest));

  var restFormatted = formatRestTime(restInt);

  var description = seriesInt + " x " + repetitionsInt + " x " + distanceInt + "m, " + restFormatted;
  var totalDistance = seriesInt * repetitionsInt * distanceInt;

  formatLine(sheet, row, description, totalDistance);
}

function processRPParams(repetitions, distance, taskType, rest){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('rpRow');
  var repetitionsInt = Math.floor(parseFloat(repetitions));
  var distanceInt = Math.floor(parseFloat(distance));
  if (taskType === "FES"){
    description = repetitionsInt + " x (50m FES  1'30\" + 100m środek 2'30\" + 50m max + 400m dow)"; 
    formatLine(sheet,row,description,distanceInt);
  } else if (taskType === "BES + DPS"){
    description = repetitionsInt + " x (10x50m dps 1'  + 5x50m BES R20-30\"  + 250m luz)";
    formatLine(sheet,row,description,distanceInt);
  } else if (taskType === "100m max"){
    description = repetitionsInt + " x (4x100m dps R 15-30\" plus 1' + 100m max + 300m luz)";
    formatLine(sheet,row,description,distanceInt);
  } else {
    var restInt = Math.floor(parseFloat(rest));

    var restFormatted = formatRestTime(restInt);

    var description = repetitionsInt + " x " + distanceInt + " " +  taskType + " " + restFormatted + " z odpuszczeniem"
    var totalDistance = repetitionsInt * distanceInt;

    formatLine(sheet, row, description, totalDistance);
  }
}

function processZmiennyParams(repetitions, distance, taskType, rest){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('zmiennyRow');
  var repetitionsInt = Math.floor(parseFloat(repetitions));
  var distanceInt = Math.floor(parseFloat(distance));
  if (taskType === "4x50m T400m + 200m ćw + 8x25m T200m + 100m ćw + 100m zm max"){
    var description = repetitionsInt + " x ( " + taskType + " )";
    formatLine(sheet, row, description, distanceInt);
  } else if (taskType === "50m do zm rozp + 100m ćw/T200/400m/50m - w serii do każdego stylu układ"){
    var description = repetitionsInt + " x ( " + taskType + " )";
    formatLine(sheet, row, description, distanceInt);
  } else {
    formatLine(sheet, row, taskType, distanceInt);
  }
}

function processAEC2Params(description, distance) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aec2Row');
  var distanceInt = Math.floor(parseFloat(distance));
  var finaldescription = distanceInt + " - ( " + description + " )";

  formatLine(sheet, row, finaldescription, distanceInt);
}

function processAEC1Params(description, distance) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aec1Row');
  var distanceInt = Math.floor(parseFloat(distance));
  var finaldescription = distanceInt + " - ( " + description + " )";

  formatLine(sheet, row, finaldescription, distanceInt);
}

function processAEC3Params(task, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aec3Row');

  var restInt = Math.floor(parseFloat(rest));

  var restFormatted = formatRestTime(restInt);

  var description = task + " progresja (" + restFormatted + ") AEC3";

  formatLine(sheet, row, description, 300);
}

function processRRParams(series, repetitions, distance, rest){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('rrRow');

  var seriesInt = Math.floor(parseFloat(series));
  var repetitionsInt = Math.floor(parseFloat(repetitions));
  var distanceInt = Math.floor(parseFloat(distance));
  var restInt = Math.floor(parseFloat(rest));

  var restFormatted = formatRestTime(restInt);

  var description = seriesInt + " x " + repetitionsInt + " x " + distanceInt + "m, " + restFormatted;
  var totalDistance = seriesInt * repetitionsInt * distanceInt;

  formatLine(sheet, row, description, totalDistance);

}

function processAECRegParams(distance, description) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aecregRow');

  var distanceInt = Math.floor(parseFloat(distance));

  var fullDescription = distanceInt + "m - (" + description + ")";

  formatLine(sheet, row, fullDescription, distanceInt);
}

function processTechnikaParams(distance, description) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('technikaRow');

  var distanceInt = parseInt(distance);

  var fullDescription = distanceInt + "m - (" + description + ")";

  formatLine(sheet, row, fullDescription, distanceInt);
}

function processSprintParams(seriesParams, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('sprintRow');

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

  var restFormatted = formatRestTime(rest);

  var description = '';
  if (allRepetitionsEqual) {
    description = `${seriesParams.length}x${firstRepetitions}x25m Sprint (15m (${seriesParams[0].accent}) + 10m luźno) Przerwa: ${restFormatted}\n`;
  } else {
    description = `${seriesParams.length} serii w układzie:\n`;
    seriesParams.forEach((param, index) => {
      description += `${index + 1}) ${param.repetitions}x25m Sprint (15m (${param.accent}) + 10m luźno) Przerwa: ${restFormatted}\n`;
    });
  }

  formatLine(sheet, row, description, totalDistance);
}

function processNNParams(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('nnRow');
  var restInt = Math.floor(parseFloat(params.rest));
  var distanceInt = Math.floor(parseFloat(params.distance));
  var seriesInt = Math.floor(parseFloat(params.series));
  var restFormatted = formatRestTime(restInt);
  var repetitionsInt = Math.floor(parseFloat(params.repetitions));

  if (params.subtaskType === 'ANC') {
    var description = `${seriesInt} x ${repetitionsInt} x ${distanceInt}m, Przerwa: ${restFormatted}`;
    var totalDistance = seriesInt * repetitionsInt * distanceInt;
  } else if (params.subtaskType === 'AEC2') {
    var totalDistanceInt = Math.floor(parseFloat(params.totalDistance));
    var hardSegmentDistanceInt = Math.floor(parseFloat(params.hardSegmentDistance));

    var easySegmentDistanceInt = totalDistanceInt - hardSegmentDistanceInt;

    var description = `${seriesInt} x ${totalDistanceInt}m (${hardSegmentDistanceInt}m mocno + ${easySegmentDistanceInt}m luźno), Przerwa: ${restFormatted}`;
    var totalDistance = seriesInt * totalDistanceInt;
  } else if (params.subtaskType === 'AEC1') {
    var description = `${repetitionsInt} x ${distanceInt}m, Przerwa: ${restFormatted}`;
    var totalDistance = repetitionsInt * distanceInt;
  }
  formatLine(sheet, row, description, totalDistance);
}

function formatRestTime(restInt) {
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
  return restFormatted;
}

function formatLine(sheet, row, description, totalDistance){
    sheet.getRange(parseInt(row), 1).setVerticalAlignment("middle").setHorizontalAlignment("center");
    sheet.getRange(parseInt(row), 2).setValue(description).setWrap(true).setVerticalAlignment("middle").setHorizontalAlignment("center");
    sheet.getRange(parseInt(row), 3).setValue(totalDistance).setVerticalAlignment("middle").setHorizontalAlignment("center");
    sheet.getRange(parseInt(row), 4).setVerticalAlignment("middle").setHorizontalAlignment("center");
}

function processGenerateTable() {
  var targetSpreadsheetId = '1nO8BdJ1UuSdwd9qh2JCf7p0Zcpjy9FVfob819H7pLNk';
  var presenceSpreadsheetId = '1BC8yBaTPrlouJfa6IFDhNkHuE42v_27ikEljHijBAEk';
  var targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId);
  var presenceSpreadsheet = SpreadsheetApp.openById(presenceSpreadsheetId);

  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  var formattedDate = Utilities.formatDate(yesterday, Session.getScriptTimeZone(), 'dd.MM.yyyy');
  var trainingDate = Utilities.formatDate(yesterday, Session.getScriptTimeZone(), 'dd-MM-yyyy');
  var sheetName = 'zadanie ANC ' + formattedDate;

  var newSheet = targetSpreadsheet.insertSheet(sheetName);
  if (!newSheet) {
    newSheet = targetSpreadsheet.getSheetByName(sheetName);
    newSheet.clear();
  }

  // Znalezienie głównego zadania i pobranie liczby serii oraz powtórzeń
  var sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var mainTaskRow = findMainTaskRow(sourceSheet);
  var taskDescription = sourceSheet.getRange(mainTaskRow, 2).getValue();

  // Wyciągnięcie liczby serii i powtórzeń z opisu zadania
  var series = parseInt(taskDescription.match(/(\d+) x/)[1], 10);
  var repeats = parseInt(taskDescription.match(/x (\d+)/)[1], 10);

  // Szukanie arkusza obecności, który zawiera wczorajszą datę
  var presenceSheets = presenceSpreadsheet.getSheets();
  var presenceSheet = null;
  Logger.log('Yesterday: ' + yesterday);
  for (var i = 0; i < presenceSheets.length; i++) {
    var sheetName = presenceSheets[i].getName();
    Logger.log('Checking sheet: ' + sheetName);
    var dateRange = sheetName.match(/(\d{2}\.\d{2}\.\d{4})-(\d{2}\.\d{2}\.\d{4})/);
    if (dateRange) {
      Logger.log('Date range found: ' + dateRange);
      var startDate = parseDate(dateRange[1]);
      var endDate = parseDate(dateRange[2]);
      Logger.log('Start date: ' + startDate + ', End date: ' + endDate);
      if (yesterday >= startDate && yesterday <= endDate) {
        presenceSheet = presenceSheets[i];
        break;
      }
    }
  }

  if (!presenceSheet) {
    showErrorMessage('Nie znaleziono odpowiedniego arkusza z obecnością.');
    return;
  }

  // Przykladowa lista zawodników
  var players = getPlayersForTraining(presenceSheet, yesterday);

  if (players.length === 0) {
    showErrorMessage('Brak zawodników na treningu.');
    return;
  }

  // Wypełnianie tabeli
  var startRow = 2;

  for (var i = 0; i < players.length; i++) {
    var endRow = startRow + repeats - 1;
    newSheet.getRange(startRow, 1, repeats, 1).merge().setValue(players[i]).setVerticalAlignment("middle").setHorizontalAlignment("center");
    startRow = endRow + 1;
  }

  for (var k = 0; k < repeats; k++) {
    newSheet.getRange(1, k + 2).setValue("Seria " + (k + 1));
  }

  var range = newSheet.getRange(1, 1, startRow - 1, repeats + 1);
  range.setBorder(true, true, true, true, true, true);

  // Ukrywanie innych arkuszy
  var sheets = targetSpreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetName() !== sheetName) {
      sheets[i].hideSheet();
    }
  }
}

function parseDate(dateString) {
  var parts = dateString.split('.');
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

function getPlayersForTraining(presenceSheet, date) {
  var players = [];
  var data = presenceSheet.getDataRange().getValues();
  
  // Pobieranie dnia tygodnia i pory dnia
  var days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
  var dayOfWeek = days[date.getDay()];
  var isMorning = date.getHours() < 12;
  var trainingTime = isMorning ? 'rano' : 'po południu';
  var trainingDate = dayOfWeek + ' ' + trainingTime;

  // Szukanie kolumny z odpowiednią datą treningu
  var headers = data[0];
  var trainingColumn = -1;
  Logger.log('Training date: ' + trainingDate);
  for (var i = 0; i < headers.length; i++) {
    Logger.log('Checking header: ' + headers[i]);
    if (headers[i].includes(trainingDate)) {
      trainingColumn = i;
      Logger.log('Found matching column at index: ' + i);
      break;
    }
  }

  if (trainingColumn === -1) {
    Logger.log('No matching column found for date: ' + trainingDate);
    return players;
  }

  // Pobranie listy zawodników obecnych na treningu
  for (var i = 1; i < data.length; i++) {
    Logger.log('Checking row: ' + (i + 1) + ' value: ' + data[i][trainingColumn]);
    if (data[i][trainingColumn] === 1) {
      players.push(data[i][0]);
    }
  }

  return players;
}

function forceAuth() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('Autoryzacja zakończona sukcesem!');
}
