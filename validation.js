function handleTaskTypeChange(range, value) {
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

function handleEditTableOptions(sheet, value) {
  if (value === 'Dodaj wiersz') {
    addNewRow(sheet);
  } else if (value === 'Usuń wiersz') {
    showDeleteRowPopup();
  } 
}
