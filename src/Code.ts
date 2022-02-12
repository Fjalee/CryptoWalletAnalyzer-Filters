const tokenHashA1Notation = "E2";
const tokenNameA1Notation = "B2";
const fromHashesA1Notation = "D12:D";
const dexTableMetaData = {
  a1Notation: "A12:F",
  txnHashColIndex: 0,
  txnDateColIndex: 1,
  actionColIndex: 2,
  fromHashColIndex: 3,
  toHashColIndex: 4,
  lastSellColIndex: 5
};
const filtersPageMetaData = {
  tokens: {
    checkBoxes: {
      checkBoxesStartA1Notation: "A2",
    },
    dateFromPicker: {
      dateFromPickerA1Notation: "E2",
    },
    dateToPicker: {
      dateToPickerA1Notation: "F2",
      dateToPickerColumn: "F",
    },
    tokensStartRow: 2,
    tokensStartColumn: "A",
    columnIndexes: {
      isChecked: 0,
      name: 1,
      hash: 2,
      sheetId: 3,
      dateFrom: 4,
      dateTo: 5
    }
  },
};

const googleSheetMimeType = "application/vnd.google-apps.spreadsheet";
const pathFolderTokensSheets = ["CryptoWalletAnalyzer", "DexTables"];

const filtersSheetName = "Filters";
const placeholderNameForDeletion = "Outdated-Filters";
const resultSheetsPrefixString = "result ";


const positiveNumbersRegex = /^[1-9]+[0-9]*$/;
const dateFormat = "dd/MM/YYYY hh:mm:ss";
const minDate = new Date(1, 01, 01);
const maxDate = new Date(3000, 01, 01);

enum CheckboxStatus {
  Checked = "checked",
  Unchecked = "unchecked",
}

interface dexTableRow {
  txnHash: string;
  txnDate: Date;
  action: string;
  toHash: string;
  fromHash: string;
  lastSell: Date;
}

interface filterPageToken {
  name: string;
  hash: string;
  sheetId: string;
}

interface filterPageTokenRow {
  isChecked: CheckboxStatus;
  name: string;
  hash: string;
  sheetId: string;
  dateFrom: Date;
  dateTo: Date;
}

function initialize() {
  addMenuCryptoWalletAnalyzer();
}

function debugTemp() {
}

function parseToUTC(date: Date){
  var t = new Date(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(),
    date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()
  );

  return new Date(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(),
    date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()
  );
  // const formatedString = Utilities.formatDate(date, "UTC", dateFormat);
  // return new Date(formatedString);
}

function parseStringToUTCDate(dateString: string){
  var date = new Date(dateString);
  return new Date(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(),
    date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()
  );
  // const formatedString = Utilities.formatDate(date, "UTC", dateFormat);
  // return new Date(formatedString);
}

function getValidationRuleForDatePicker(): GoogleAppsScript.Spreadsheet.DataValidationBuilder{
  const criteria = SpreadsheetApp.DataValidationCriteria.DATE_IS_VALID_DATE;
  const rule = SpreadsheetApp.newDataValidation().withCriteria(criteria, []).setAllowInvalid(false);
  return rule;
}

function refreshFiltersSheet() {
  const tokensSheetsFolder = getFolderByPathCreateIfDoesntExist(
    pathFolderTokensSheets
  );

  const tokensSheetsIds = getGoogleSheetIds(tokensSheetsFolder);

  const tokens = fitlerUniqueTokensSheetsIds(tokensSheetsIds);

  const filtersSheet = createOrOverwriteSheet(filtersSheetName);

  addTokensToFiltersPage(filtersSheet, tokens);
  addCheckBoxesToFiltersPage(tokens.length);
  filtersSheet.autoResizeColumns(1, 4);

  addDatePickersToFiltersPage(tokens.length);
  filtersSheet.setColumnWidths(5, 2, 85);
}

function addTokensToFiltersPage(
  filtersSheet: GoogleAppsScript.Spreadsheet.Sheet,
  tokens: filterPageToken[]
) {
  filtersSheet.appendRow(["", "Token Name", "Token Hash", "Sheet Id", "Date from", "Date to"]);

  tokens.forEach((t) => {
    filtersSheet.appendRow(["", t.name, t.hash, t.sheetId]);
  });
}

function addDatePickersToFiltersPage(amountOfTokens: number) {
  const rangeFrom = filtersPageMetaData.tokens.dateFromPicker.dateFromPickerA1Notation;
  const rangeTo =
    filtersPageMetaData.tokens.dateToPicker.dateToPickerColumn +
    (filtersPageMetaData.tokens.tokensStartRow - 1 + amountOfTokens);

  const range = getFiltersSheet().getRange(rangeFrom + ":" + rangeTo);

  const dateRule = getValidationRuleForDatePicker();
  range.setDataValidation(dateRule);

}

function addCheckBoxesToFiltersPage(amountOfTokens: number) {
  const rangeFrom =
    filtersPageMetaData.tokens.checkBoxes.checkBoxesStartA1Notation;
  const rangeTo =
    filtersPageMetaData.tokens.tokensStartColumn +
    (filtersPageMetaData.tokens.tokensStartRow - 1 + amountOfTokens);

  const range = getFiltersSheet().getRange(rangeFrom + ":" + rangeTo);

  range.insertCheckboxes(CheckboxStatus.Checked, CheckboxStatus.Unchecked);
}

function getFiltersSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(filtersSheetName);
}

function getSheetByNameCreateIfDoesntExist(
  name: string
): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1);
  return sheet;
}

function createOrOverwriteSheet(
  name: string
): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let oldSheet = ss.getSheetByName(name);
  if (oldSheet) {
    oldSheet.setName(placeholderNameForDeletion);
  }

  let newSheet = ss.insertSheet(name);

  if (oldSheet) {
    ss.deleteSheet(oldSheet);
  }

  moveSheet(newSheet, 1);
  return newSheet;
}

function moveSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  newLocation: number
) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(newLocation);
}

function fitlerUniqueTokensSheetsIds(allIds: string[]): filterPageToken[] {
  let uniqueTokenHashes: string[] = [];
  let allTokens: filterPageToken[] = [];

  allIds.forEach((id) => {
    const sheet = SpreadsheetApp.openById(id);
    const tokenHash: string = sheet.getRange(tokenHashA1Notation).getValue();
    const tokenName: string = sheet.getRange(tokenNameA1Notation).getValue();
    if (uniqueTokenHashes.includes(tokenHash)) {
      const indexToRemove = uniqueTokenHashes.indexOf(tokenHash);
      if (indexToRemove > -1) {
        uniqueTokenHashes.splice(indexToRemove, 1);
      }
    } else {
      uniqueTokenHashes.push(tokenHash);
      allTokens.push({ name: tokenName, hash: tokenHash, sheetId: id });
    }
  });

  return allTokens.filter(t => uniqueTokenHashes.includes(t.hash));
}

function getGoogleSheetIds(folder: GoogleAppsScript.Drive.Folder): string[] {
  let result: string[] = [];

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() === googleSheetMimeType) {
      result.push(file.getId());
    }
  }

  return result;
}

function getFolderByPathCreateIfDoesntExist(
  path: string[]
): GoogleAppsScript.Drive.Folder {
  let currentFolder = DriveApp.getRootFolder();

  path.forEach((folderName) => {
    const folderIter = currentFolder.getFoldersByName(folderName);

    if (folderIter.hasNext()) {
      currentFolder = folderIter.next();
    } else {
      currentFolder = currentFolder.createFolder(folderName);
    }
  });
  return currentFolder;
}

function filterWalletsActiveInSpecifiedAmountUniqueTokens(
  tokensSettings: filterPageTokenRow[],
  minAmountBought: number,
  maxAmountBought: number,
  includeDateFilter: boolean
): Map<string, number> {
  const walletsTokensMap = getWalletTokensMap(tokensSettings, includeDateFilter);
  let result = new Map<string, number>();

  walletsTokensMap.forEach((tokensHashes, walletHash) => {
    const nmOfTokens = tokensHashes.length;
    if (nmOfTokens >= minAmountBought && nmOfTokens <= maxAmountBought) {
      result.set(walletHash, nmOfTokens);
    }
  });

  return result;
}

function getWalletTokensMap(tokensSettings: filterPageTokenRow[], includeDateFilter: boolean): Map<string, string[]> {
  let walletTokensMap = new Map<string, string[]>();

  tokensSettings.forEach((setting) => {
    const sheet = SpreadsheetApp.openById(setting.sheetId);
    const tokenHash: string = sheet.getRange(tokenHashA1Notation).getValue();
    let dexTableRows = getDexTable(sheet);
    if (includeDateFilter){
      dexTableRows = dexTableRows.filter(row => betweenDates(row.txnDate, setting.dateFrom, setting.dateTo));
    }
    dexTableRows.forEach((row) => {
      if (row.fromHash != "") {
        walletTokensMap = addUniqueTokenCreateWalletIfDoesntExist(
          tokenHash,
          row.fromHash,
          walletTokensMap
        );
      }
    });
  });

  return walletTokensMap;
}

function betweenDates(date: Date, from: Date, to: Date): boolean{
  const foo = (date.getTime() >= from.getTime()) && (date.getTime() <= to.getTime());
  return foo;
}

function getDexTable(sheet: GoogleAppsScript.Spreadsheet.Spreadsheet): dexTableRow[]{
  const dexTable2dArray: string[][] = sheet
    .getRange(dexTableMetaData.a1Notation)
    .getDisplayValues();

  const dexTable: dexTableRow[] = [];
  dexTable2dArray.map((r: string[]) => {
    dexTable.push({
      txnHash: r[dexTableMetaData.txnHashColIndex],
      txnDate: new Date(r[dexTableMetaData.txnDateColIndex]),
      action: r[dexTableMetaData.actionColIndex],
      toHash: r[dexTableMetaData.toHashColIndex],
      fromHash: r[dexTableMetaData.fromHashColIndex],
      lastSell: new Date(r[dexTableMetaData.lastSellColIndex]),
    })
  });

  return dexTable;
}

function addUniqueTokenCreateWalletIfDoesntExist(
  tokenHash: string,
  walletHash: string,
  walletTokensMap: Map<string, string[]>
):  Map<string, string[]>{
  const tokens = walletTokensMap.get(walletHash);
  if (!tokens) {
    walletTokensMap.set(walletHash, [tokenHash]);
  } else if (!tokens.includes(tokenHash)) {
    walletTokensMap.get(walletHash).push(tokenHash);
  }

  return walletTokensMap;
}

function menuAdapterFilterWalletsActiveInSpecifiedAmountUniqueTokens() {
  const input = inputMinMaxAmounts();
  if (!input){
    return;
  }
  const {minAmount, maxAmount} = input;

  const tokensFilter = getFilterPageTokens().filter((t) => t.isChecked === CheckboxStatus.Checked);

  const result = filterWalletsActiveInSpecifiedAmountUniqueTokens(tokensFilter, minAmount, maxAmount, false);
  writeSheetWalletsInTokens(result);
}

function inputMinMaxAmounts(): {minAmount: number, maxAmount: number}{
  const positiveNumberErrorMsg = "ERROR input: enter possitive number or 0.";

  var minAmountString = inputBox("Min. tokens amount", positiveNumberErrorMsg, positiveNumbersRegex);
  if (!minAmountString){
    return null;
  }
  var maxAmountString = inputBox("Max. tokens amount", positiveNumberErrorMsg, positiveNumbersRegex);
  if (!maxAmountString){
    return null;
  }

  const minAmount = parseInt(minAmountString);
  const maxAmount = parseInt(maxAmountString);

  if (maxAmount < minAmount){
    Browser.msgBox("ERROR input: min amount has to be lower or same as max amount");
    return null;
  }

  return {minAmount, maxAmount};
}

function inputBox(prompt: string, errorMsg: string, check?: RegExp){
  var input = Browser.inputBox(prompt);

  if (!check || check.test(input)){
    return input;
  }
  Browser.msgBox(errorMsg);
  return null;
}

function writeSheetWalletsInTokens(walletsMap: Map<string, number>){
  const sheet = createNewResultSheet();
  sheet.appendRow(["Number of tokens bought", "Wallet hash"]);
  
  walletsMap.forEach((wallet, amountOfTokens) => {
    sheet.appendRow([wallet, amountOfTokens]);
  })

  sheet.autoResizeColumns(1, 10);
}

function getFilterPageTokens(): filterPageTokenRow[] {
  let result: filterPageTokenRow[] = [];

  const table = getFiltersSheet().getDataRange().getValues().splice(1);
  table.forEach((t) => {
    const dateFrom = t[filtersPageMetaData.tokens.columnIndexes.dateFrom];
    const dateTo = t[filtersPageMetaData.tokens.columnIndexes.dateTo];

    result.push({
      isChecked: t[filtersPageMetaData.tokens.columnIndexes.isChecked],
      name: t[filtersPageMetaData.tokens.columnIndexes.name],
      hash: t[filtersPageMetaData.tokens.columnIndexes.hash],
      sheetId: t[filtersPageMetaData.tokens.columnIndexes.sheetId],
      dateFrom: !(dateFrom === "") ? parseToUTC(dateFrom) : minDate,
      dateTo: !(dateTo === "") ? parseToUTC(dateTo) : maxDate,
    });
  });

  return result;
}

function createNewResultSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = new Date();
  let newSheet = ss.insertSheet(resultSheetsPrefixString + name);
  moveSheet(newSheet, 2);
  return newSheet;
}

function menuAdapterDeleteAllResults() {
  const response = Browser.msgBox("DANGER!", "Are you sure you want to delete all result sheets?", Browser.Buttons.OK_CANCEL);
  if (response == "cancel"){
    return;
  }
  deleteAllSheetsStartingWith(resultSheetsPrefixString);
}

function deleteAllSheetsStartingWith(sheetStartsWith: string) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  allSheets.forEach((x) => {
    if (x.getName().startsWith(sheetStartsWith)) {
      ss.deleteSheet(x);
    }
  });
}

function menuAdapterFilterWalletsActiveInSpecifiedAmountUniqueTokensBetweenSpecifiedDates(){
  const input = inputMinMaxAmounts();
  if (!input){
    return;
  }
  const {minAmount, maxAmount} = input;

  const tokensFilter = getFilterPageTokens().filter((t) => t.isChecked === CheckboxStatus.Checked);

  const result = filterWalletsActiveInSpecifiedAmountUniqueTokens(tokensFilter, minAmount, maxAmount, true);
  writeSheetWalletsInTokens(result);
}

function addMenuCryptoWalletAnalyzer() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Crypto Wallet Analyzer");

  const subMenuFilters = ui.createMenu("Filters");
  subMenuFilters.addItem(
    "Filter 1 | Wallets active in specified amount of unique tokens",
    "menuAdapterFilterWalletsActiveInSpecifiedAmountUniqueTokens"
  );
  subMenuFilters.addItem(
    "Filter 2 | Wallets active in specified amount of unique tokens between specified dates",
    "menuAdapterFilterWalletsActiveInSpecifiedAmountUniqueTokensBetweenSpecifiedDates"
  );
  menu.addSubMenu(subMenuFilters);

  menu.addItem("Refresh Filters sheet", "refreshFiltersSheet");
  menu.addItem("Delete all results", "menuAdapterDeleteAllResults");
  // menu.addItem("debug", "debugTemp");
  menu.addToUi();
}
