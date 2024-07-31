function createTrainingSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var today = new Date();
  var day = today.getDay();
  var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), "dd-MM-yyyy");
  var twoSheetsDays = [1, 2, 4, 5]; 
  var oneSheetDays = [3, 6]; 
  function createSheet(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      sheet.showSheet();
    } else {
      sheet = ss.insertSheet(name);
    }
  }
  
  function hideSheet(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      sheet.hideSheet();
    }
  }

  if (twoSheetsDays.includes(day)) {
    createSheet("Trening " + formattedDate + " rano");
    createSheet("Trening " + formattedDate + " popołudnie");
  } else if (oneSheetDays.includes(day)) {
    createSheet("Trening " + formattedDate + " rano");
  }

  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    var datePattern = /\d{2}-\d{2}-\d{4}/;
    var match = sheetName.match(datePattern);
    
    if (!match || match[0] !== formattedDate) {
      Logger.log("Hiding sheet: " + sheetName); 
      hideSheet(sheetName);
    } else {
      Logger.log("Keeping sheet: " + sheetName); 
    }
  }
}
