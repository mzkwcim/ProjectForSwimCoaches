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

function processAEC2Params(repetitions, distance, hardSegment, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aec2Row');

  var repetitionsInt = Math.floor(parseFloat(repetitions));
  var distanceInt = Math.floor(parseFloat(distance));
  var hardSegmentInt = Math.floor(parseFloat(hardSegment));
  var restInt = Math.floor(parseFloat(rest));

  var easySegmentInt = distanceInt - hardSegmentInt;

  var restFormatted = formatRestTime(restInt);

  var description = repetitionsInt + " x " + distanceInt + "m (" + hardSegmentInt + "m mocno + " + easySegmentInt + "m spokojnie), " + restFormatted;
  var totalDistance = repetitionsInt * distanceInt;

  formatLine(sheet, row, description, totalDistance);
}

function processAEC3Params(task, rest) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aec3Row');

  var restInt = Math.floor(parseFloat(rest));

  var restFormatted = formatRestTime(restInt);

  var description = task + " progresja (" + restFormatted + ") AEC3";

  formatLine(sheet, row, description, 300);
}

function processAECRegParams(distance, description) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = PropertiesService.getScriptProperties().getProperty('aecregRow');

  var distanceInt = Math.floor(parseFloat(distance));

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

