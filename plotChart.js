function wpiszLosoweLiczbyIWykres() {
  var arkusz = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Wpisywanie losowych liczb od 1 do 10
  for (var i = 0; i < 10; i++) {
    var losowaLiczba = Math.floor(Math.random() * 10) + 1;  // Generowanie losowej liczby z przedziału 1-10
    arkusz.getRange(i + 2, 1).setValue(losowaLiczba);  // Wpisanie losowej liczby do komórki
  }
  
  // Tworzenie wykresu punktowego
  var zakres = arkusz.getRange("A2:A12");

  var wykres = arkusz.newChart()
    .setChartType(Charts.ChartType.LINE)  // Typ wykresu: punktowy (scatter)
    .addRange(zakres)  // Zakres danych
    .setPosition(4, 3, 0, 0)  // Pozycja wykresu w arkuszu
    .setOption('title', 'Wykres Punktowy z Losowych Liczb')
    .setOption('hAxis.title', 'Indeks')
    .setOption('vAxis.title', 'Liczba')
    .build();
    
  arkusz.insertChart(wykres);
}
