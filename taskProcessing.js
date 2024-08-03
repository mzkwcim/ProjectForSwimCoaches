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

