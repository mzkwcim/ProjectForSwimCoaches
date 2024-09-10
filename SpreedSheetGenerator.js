function createWeeklyAndYearlySummaryForAthletes() {
  Logger.log("Rozpoczęcie działania skryptu");
  
  // Pobierz aktualny tydzień do formatowania arkuszy
  var week = getFormattedWeekRange();
  
  // ID arkusza z obecnością
  var attendanceSheetId = '1y8Ctau5TZsZ82WAStgBm6ZR0HtlF1zw3uVM_DaGTYkI'; // Arkusz obecności
  var attendanceSheet = SpreadsheetApp.openById(attendanceSheetId).getSheetByName(week); // Arkusz obecności
  Logger.log("Załadowano arkusz obecności");

  // ID arkusza z treningami
  var tasksSheetId = '1dpqzj1StDcZJdb8a-poPU0l707fNNoo-M8jngDw9Ous'; // Arkusz treningowy
  var tasksSheet = SpreadsheetApp.openById(tasksSheetId);
  Logger.log("Załadowano arkusz z treningami");

  // Lista znajomych (mapping)
  var friends = [
    {email: 'jzalxx1@gmail.com', name: 'Zalewski Jacek'},
    {email: 'wiktoria.kolanczyk@gmail.com', name: 'Kolanczyk Wiktoria'},
    {email: 'Maciekjedwabny1@gmail.com', name: 'Jedwabny Maciej'},
    {email: 'Alicjanogaj1@gmail.com', name: 'Nogaj Alicja'},
    {email: 'marcel.burzak@gmail.com', name: 'Burzak Marcel'},
    {email: 'majakordalska1@gmail.com', name: 'Kordalska Maja'},
    {email: 'kajkokrucki@gmail.com', name: 'Krucki Kajetan'},
    {email: 'zygnarowskamichalina@gmail.com', name: 'Zygnarowska Michalina'},
    {email: 'krzesniak.kuba@gmail.com', name: 'Krześniak Jakub'}
  ];
  Logger.log("Załadowano listę znajomych: " + JSON.stringify(friends));

  // ID folderu, w którym mają być utworzone arkusze
  var folderId = '1xoWw2SHVcMvbG9Z1rUHmCrRzcsaojTHP';
  var folder = DriveApp.getFolderById(folderId);
  Logger.log("Załadowano folder o ID: " + folderId);

  // Pobierz dane obecności (imiona zawodników)
  var attendanceData = attendanceSheet.getDataRange().getValues(); // Wszystkie dane obecności
  Logger.log("Załadowano dane obecności: " + attendanceData.length + " wierszy");

  // Przechodzimy po nagłówkach (pierwszy wiersz z datami i typami treningów)
  var headers = attendanceData[0];

  // Ustawienie zakresu dat dla tygodnia (dynamiczne)
  var weekRange = getWeekRange();
  var monday = weekRange.monday;
  var sunday = weekRange.sunday;
  sunday.setDate(monday.getDate() + 6); // Niedziela
  Logger.log("Zakres tygodnia: " + monday + " do " + sunday);

  // Obliczamy liczbę treningów w danym tygodniu
  var totalTrainings = 0;

  // Przechodzimy przez każdy arkusz i sprawdzamy, które treningi są w danym tygodniu
  for (var s = 0; s < tasksSheet.getSheets().length; s++) {
    var sheet = tasksSheet.getSheets()[s];
    var sheetName = sheet.getName();
    if (sheetName.startsWith("Trening")) {
      var sheetDateStr = sheetName.split(" ")[1];
      var sheetDate = new Date(sheetDateStr.split('-')[2], sheetDateStr.split('-')[1] - 1, sheetDateStr.split('-')[0]);

      if (sheetDate >= monday && sheetDate <= sunday) {
        totalTrainings++; // Zliczamy tylko te treningi, które są w zakresie bieżącego tygodnia
      }
    }
  }

  Logger.log("Całkowita liczba treningów w bieżącym tygodniu: " + totalTrainings);

  // Przetwarzamy arkusze treningowe
  for (var i = 1; i < attendanceData.length; i++) { // Iteracja po zawodnikach
    var athleteName = String(attendanceData[i][0]).trim();
    Logger.log("Tworzenie/aktualizacja arkusza dla zawodnika: " + athleteName);

    // Resetowanie wartości dystansu, obecności, rozgrzewek i typów zadań dla każdego zawodnika
    var totalDistance = 0;
    var presenceCount = 0;
    var warmupCount = 0;
    var taskTypeDistances = {}; // Przechowuje dystans dla każdego typu zadania

    // Licznik zadań głównych
    var mainTaskTypes = {};
    var mainTaskWarmupCount = {};
    var totalMainTaskCount = 0;

    // Sprawdzenie, czy zawodnik jest na liście `friends`
    var friend = friends.find(function(f) {
      return String(f.name).trim().toLowerCase() === athleteName.trim().toLowerCase();
    });

    if (!friend) {
      Logger.log("Zawodnik " + athleteName + " nie jest na liście znajomych, pomijam");
      continue;
    }

    // Iteracja po arkuszach treningowych
    for (var s = 0; s < tasksSheet.getSheets().length; s++) {
      var sheet = tasksSheet.getSheets()[s];
      var sheetName = sheet.getName();
      if (!sheetName.startsWith("Trening")) continue;

      var sheetDateStr = sheetName.split(" ")[1]; // Pobranie daty z nazwy arkusza (np. "Trening 03-09-2024 rano")
      var sheetDate = new Date(sheetDateStr.split('-')[2], sheetDateStr.split('-')[1] - 1, sheetDateStr.split('-')[0]); // Zamiana na obiekt Date

      // Jeśli data arkusza mieści się w zakresie tygodniowym
      if (sheetDate >= monday && sheetDate <= sunday) {
        Logger.log("Przetwarzanie arkusza: " + sheetName);

        // Pobierz dane treningowe z tego arkusza
        var taskData = sheet.getDataRange().getValues();
        Logger.log("Pobrano dane treningowe: " + taskData.length + " wierszy");

        // Dopasowanie danych obecności z arkusza obecności do treningu
        for (var j = 1; j < headers.length; j++) {
          var header = headers[j];
          if (!header.startsWith("Trening") || !header.includes(sheetDateStr)) continue;

          // Sprawdzenie obecności zawodnika
          var presence = attendanceData[i][j];
          var warmupPerformed = attendanceData[i][j + 1]; // Sprawdzenie rozgrzewki

          if (presence === 1) {
            Logger.log("Zawodnik " + athleteName + " był obecny w dniu: " + sheetDateStr);
            presenceCount++;

            // Sprawdzanie, czy zawodnik wykonał rozgrzewkę
            if (warmupPerformed === 1) {
              warmupCount++;
              Logger.log("Zawodnik " + athleteName + " wykonał rozgrzewkę w dniu: " + sheetDateStr);
            }

            // Iteracja po wierszach arkusza, aby zidentyfikować zadanie główne
            var foundMainTask = false;
            for (var k = 1; k < taskData.length; k++) {
              var taskPart = taskData[k][0]; // Część treningu (kolumna A)
              var taskType = taskData[k][3]; // Typ zadania (kolumna D)
              var taskDistance = parseInt(taskData[k][2]); // Dystans (kolumna C)

              // Sprawdzamy, czy zadanie jest zadaniem głównym
              if (taskPart === "Zadanie Główne" && !foundMainTask) {
                foundMainTask = true;
                totalMainTaskCount++;

                // Sumowanie typu zadania głównego
                if (!mainTaskTypes[taskType]) {
                  mainTaskTypes[taskType] = 0;
                  mainTaskWarmupCount[taskType] = 0;
                }
                mainTaskTypes[taskType]++;
                
                // Jeśli zawodnik wykonał rozgrzewkę, przypisujemy ją do zadania głównego
                if (warmupPerformed === 1) {
                  mainTaskWarmupCount[taskType]++;
                }
              }

              // Sumowanie dystansu dla każdego typu zadania
              if (!isNaN(taskDistance)) {
                totalDistance += taskDistance;

                // Sumowanie dystansu dla danego typu zadania
                if (!taskTypeDistances[taskType]) {
                  taskTypeDistances[taskType] = 0;
                }
                taskTypeDistances[taskType] += taskDistance;
                Logger.log("Dodano dystans dla zawodnika " + athleteName + ": " + taskDistance + " dla typu zadania: " + taskType);
              }
            }
          }
        }
      }
    }

    // Oblicz procent obecności
    var presencePercent = totalTrainings > 0 ? (presenceCount / totalTrainings) * 100 : 0;

    // Oblicz procent wykonanych rozgrzewek (jeśli był obecny na jakimś treningu)
    var warmupPercent = presenceCount > 0 ? (warmupCount / presenceCount) * 100 : 0;

    // Oblicz procentowy udział każdego typu zadania
    var taskTypePercentages = {};
    for (var taskType in taskTypeDistances) {
      taskTypePercentages[taskType] = (taskTypeDistances[taskType] / totalDistance) * 100;
    }

    // **Aktualizacja tygodniowego arkusza**
    var spreadsheet = updateWeeklySheet(athleteName, folder, week, totalDistance, presencePercent, warmupPercent, taskTypeDistances, taskTypePercentages, mainTaskTypes, mainTaskWarmupCount, friend);
    
    // **Aktualizacja rocznego arkusza**
    //updateYearlySheet(spreadsheet, presencePercent, warmupPercent, taskTypePercentages, athleteName, folder, totalDistance, taskTypeDistances, mainTaskTypes, mainTaskWarmupCount);

    // Resetowanie wartości po przetworzeniu zawodnika
    totalDistance = 0;
    presenceCount = 0;
    warmupCount = 0;
    taskTypeDistances = {};
    mainTaskTypes = {};
    mainTaskWarmupCount = {};
  }

  Logger.log("Zakończono działanie skryptu");

  var recipient = "wkrak98@gmail.com";
  var subject = "Podsumowanie tygodnia";
  var body = "Cześć, \n\nTygodniowe podsumowanie zostało wygenerowane dla wszystkich zawodników. \n\nPozdrawiam!";
  
  MailApp.sendEmail(recipient, subject, body);
  Logger.log("Wysłano wiadomość e-mail do: " + recipient);
}

// Funkcja do aktualizacji tygodniowego arkusza
function updateWeeklySheet(athleteName, folder, week, totalDistance, presencePercent, warmupPercent, taskTypeDistances, taskTypePercentages, mainTaskTypes, mainTaskWarmupCount, friend) {
  var spreadsheet = getOrCreateSpreadsheet(athleteName, folder, friend);
  var sheet = getOrCreateSheet(spreadsheet, week);
  sheet.clear(); // Czyścimy arkusz, jeśli istnieje

  // Wprowadzenie nagłówków
  sheet.getRange('A1').setValue('Typ treningu');
  sheet.getRange('B1').setValue('Łączny dystans');
  sheet.getRange('C1').setValue('Obecność na treningu (%)');
  sheet.getRange('D1').setValue('Wykonanie rozgrzewki (%)');
  Logger.log("Wprowadzono nagłówki dla arkusza zawodnika: " + athleteName);

  // Wprowadzenie danych sumarycznych
  var row = 2;
  sheet.getRange(row, 1).setValue('Podsumowanie tygodnia');
  sheet.getRange(row, 2).setValue(totalDistance + "m"); // Łączny dystans
  sheet.getRange(row, 3).setValue(presencePercent.toFixed(2) + "%"); // Procent obecności
  sheet.getRange(row, 4).setValue(warmupPercent.toFixed(2) + "%"); // Procent wykonania rozgrzewek

  // Wprowadzenie danych o typach zadań i ich procentowych udziałach
  row++;
  sheet.getRange(row, 1).setValue('Procentowy udział typu zadania:');
  row++;
  for (var taskType in taskTypePercentages) {
    sheet.getRange(row, 1).setValue(taskType);
    sheet.getRange(row, 2).setValue(taskTypeDistances[taskType] + "m");
    sheet.getRange(row, 3).setValue(taskTypePercentages[taskType].toFixed(2) + "%");

    // Dodanie procentu wykonania rozgrzewek dla zadania głównego
    if (mainTaskTypes[taskType]) {
      var mainTaskWarmupPercent = (mainTaskWarmupCount[taskType] / mainTaskTypes[taskType]) * 100;
      sheet.getRange(row, 4).setValue(mainTaskWarmupPercent.toFixed(2) + "%");
    }

    row++;
  }

  sheet.autoResizeColumns(1, 4);
  Logger.log("Wprowadzono dane sumaryczne dla zawodnika: " + athleteName);
  for (var col = 1; col <= 4; col++) {
    var currentWidth = sheet.getColumnWidth(col); // Odczytaj bieżącą szerokość
    var newWidth = Math.round(currentWidth * 1.1); // Zwiększ o 10%
    sheet.setColumnWidth(col, newWidth); // Ustaw nową szerokość
  }

  var lastRow = row - 1;
  sheet.getRange(1, 1, lastRow, 4).setBorder(true, true, true, true, true, true);
  return spreadsheet;
}

// Funkcja do aktualizacji rocznego arkusza
function updateYearlySheet(spreadsheet, presencePercent, warmupPercent, taskTypePercentages, athleteName, folder, totalDistance, taskTypeDistances, mainTaskTypes, mainTaskWarmupCount) {
  var yearSheet = spreadsheet.getSheetByName("Roczna Agregacja");
  if (!yearSheet) {
    yearSheet = spreadsheet.insertSheet("Roczna Agregacja");
    Logger.log("Utworzono nowy arkusz roczny dla zawodnika: " + athleteName);
  }
  yearSheet.clear();

  yearSheet.getRange('A1').setValue('Typ treningu');
  yearSheet.getRange('B1').setValue('Łączny dystans');
  yearSheet.getRange('C1').setValue('Obecność na treningu (%)');
  yearSheet.getRange('D1').setValue('Wykonanie rozgrzewki (%)');
  Logger.log("Wprowadzono nagłówki dla arkusza zawodnika: " + athleteName);

  var row = 2;
  yearSheet.getRange(row, 1).setValue('Podsumowanie roczne');
  yearSheet.getRange(row, 2).setValue(totalDistance + "m"); // Łączny dystans
  yearSheet.getRange(row, 3).setValue(presencePercent.toFixed(2) + "%"); // Procent obecności
  yearSheet.getRange(row, 4).setValue(warmupPercent.toFixed(2) + "%"); // Procent wykonania rozgrzewek
  // Aktualizacja danych rocznych

  // Wprowadzenie danych o typach zadań i ich procentowych udziałach
  row++;
  yearSheet.getRange(row, 1).setValue('Procentowy udział typu zadania:');
  row++;
  for (var taskType in taskTypePercentages) {
    yearSheet.getRange(row, 1).setValue(taskType);
    yearSheet.getRange(row, 2).setValue(taskTypeDistances[taskType] + "m");
    yearSheet.getRange(row, 3).setValue(taskTypePercentages[taskType].toFixed(2) + "%");

    // Dodanie procentu wykonania rozgrzewek dla zadania głównego
    if (mainTaskTypes[taskType]) {
      var mainTaskWarmupPercent = (mainTaskWarmupCount[taskType] / mainTaskTypes[taskType]) * 100;
      yearSheet.getRange(row, 4).setValue(mainTaskWarmupPercent.toFixed(2) + "%");
    }

    row++;
  }

  yearSheet.autoResizeColumns(1, 4);
  Logger.log("Wprowadzono dane sumaryczne dla zawodnika: " + athleteName);
  for (var col = 1; col <= 4; col++) {
    var currentWidth = yearSheet.getColumnWidth(col); // Odczytaj bieżącą szerokość
    var newWidth = Math.round(currentWidth * 1.1); // Zwiększ o 10%
    yearSheet.setColumnWidth(col, newWidth); // Ustaw nową szerokość
  }

  var lastRow = row - 1;
  yearSheet.getRange(1, 1, lastRow, 4).setBorder(true, true, true, true, true, true);
  return spreadsheet;
}

// Funkcja pomocnicza do tworzenia lub otwierania istniejącego arkusza
function getOrCreateSpreadsheet(athleteName, folder, friend) {
  var fileExists = false;
  var existingFiles = folder.getFiles(); // Sprawdzenie istniejących plików
  var spreadsheet;

  while (existingFiles.hasNext()) {
    var file = existingFiles.next();
    if (file.getName() === athleteName) {
      spreadsheet = SpreadsheetApp.openById(file.getId());
      fileExists = true;
      break;
    }
  }

  if (!fileExists) {
    spreadsheet = SpreadsheetApp.create(athleteName);
    var file = DriveApp.getFileById(spreadsheet.getId());
    file.moveTo(folder);
    file.addEditor(friend.email); // Teraz `friend` jest przekazywany
    Logger.log("Utworzono nowy arkusz dla zawodnika: " + athleteName);
  }
  return spreadsheet;
}

// Funkcja pomocnicza do tworzenia lub otwierania istniejącego arkusza
function getOrCreateSheet(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    var defaultSheet = spreadsheet.getSheetByName('Arkusz1');
    if (defaultSheet) {
      defaultSheet.setName(sheetName);
      sheet = defaultSheet;
      Logger.log("Zmieniono nazwę domyślnego arkusza 'Arkusz1' na: " + sheetName);
    } else {
      sheet = spreadsheet.insertSheet(sheetName);
      Logger.log("Utworzono nowy arkusz o nazwie: " + sheetName);
    }
  }
  return sheet;
}

// Funkcja do dynamicznego ustalenia zakresu tygodnia
function getWeekRange() {
  var today = new Date(); // Bieżąca data
  var dayOfWeek = today.getDay(); // Dzień tygodnia (0: niedziela, 1: poniedziałek, ..., 6: sobota)
  
  // Poprawka: jeśli jest niedziela (dayOfWeek == 0), ustaw poniedziałek jako dzisiejszy dzień
  if (dayOfWeek === 0) {
    dayOfWeek = 7;
  }

  // Wyznacz poniedziałek (pierwszy dzień tygodnia)
  var monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1); // Przesunięcie na poniedziałek

  // Wyznacz niedzielę (ostatni dzień tygodnia)
  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // Przesunięcie na niedzielę

  Logger.log("Zakres tygodnia: od " + monday + " do " + sunday);

  return {
    monday: monday,
    sunday: sunday
  };
}

// Funkcja do formatowania zakresu tygodnia
function getFormattedWeekRange() {
  var weekRange = getWeekRange();
  var start = Utilities.formatDate(weekRange.monday, Session.getScriptTimeZone(), 'dd.MM.yyyy');
  var end = Utilities.formatDate(weekRange.sunday, Session.getScriptTimeZone(), 'dd.MM.yyyy');
  return start + "-" + end + "r.";
}
