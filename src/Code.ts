
function myFunction() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('Test tab');
  menu.addItem('Test items', 'temp');
  menu.addToUi();
}
