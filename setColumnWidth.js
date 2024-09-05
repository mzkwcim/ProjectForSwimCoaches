function setColumnWidth(sheet, col) {
  var data = sheet.getRange(1, col, sheet.getLastRow(), 1).getDisplayValues();
  var maxLength = 0;
  var fontSize = 10;
  var fontWeight = 'normal';
  
  for (var i = 0; i < data.length; i++) {
    var textLength = data[i][0].length;
    if (textLength > maxLength) {
      maxLength = textLength;
      var cell = sheet.getRange(i + 1, col);
      fontSize = cell.getFontSize();
      fontWeight = cell.getFontWeight();
    }
  }

  var baseWidth = fontSize * 0.75;
  if (fontWeight === 'bold') {
    baseWidth *= 1.1;
  }
  var newWidth = (maxLength * baseWidth) + 30;
  sheet.setColumnWidth(col, newWidth);
}
