function showTrainingPartsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('index')
      .setWidth(500)
      .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz części treningu');
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

function showDeleteRowPopup() {
  var html = HtmlService.createHtmlOutputFromFile('deleteRowPopup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Usuń wiersz');
}

function showTrainingPartsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('index')
      .setWidth(500)
      .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz części treningu');
}

function addNewRow(sheet) {
  var html = HtmlService.createHtmlOutputFromFile('newRowPopup')
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Dodaj nową część treningu');
}

function showDeleteRowPopup() {
  var html = HtmlService.createHtmlOutputFromFile('deleteRowPopup')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Usuń wiersz');
}

function showRPPopup() {
  var html = HtmlService.createHtmlOutputFromFile('rpPopup')
      .setWidth(500)
      .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Wybierz parametry zadania RP');
}
