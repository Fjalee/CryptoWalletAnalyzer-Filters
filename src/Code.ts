
const tokenHashA1Notation = "E2";
const tokenNameA1Notation = "B2";
const fromHashesA1Notation = "D12:D";
const filtersPageA1Notations = {
  tokens: {
    checkBoxes:{
      checkBoxesStartA1Notation: "A2"
    },
    tokensStartRow: 2
  }
}

const googleSheetMimeType = "application/vnd.google-apps.spreadsheet";
const pathFolderTokensSheets = ["CryptoWalletAnalyzer", "DexTables"];

const filtersSheetName = "Filters";
const placeholderNameForDeletion = "Outdated-Filters";

function initialize(){
  addMenuCryptoWalletAnalyzer();
}

function debugTemp(){
}

function temp(){
  // const tokensSheetsFolder = getFolderByPathCreateIfDoesntExist(pathFolderTokensSheets);

  // const tokensSheetsIds = getGoogleSheetIds(tokensSheetsFolder);
  // const tokens = fitlerUniqueTokensSheetsIds(tokensSheetsIds);

  // const filtersSheet = createOrOverwriteSheet(filtersSheetName);

  // addTokensToFiltersPage(filtersSheet, tokens);
  // filtersSheet.autoResizeColumns(1, 10);

  // const tempResult = filterWalletsActiveInSpecifiedAmountUniqueTokens(tokensSheetsIds, 3, 3);
  
  // tokensSheetsIds.forEach(x => {
  //   Logger.log(x);
  // });
  // tempResult.forEach((value, key) => {
  //   Logger.log(key + ": " + value);
  // });
}

function refreshFiltersSheet(){
  const tokensSheetsFolder = getFolderByPathCreateIfDoesntExist(pathFolderTokensSheets);

  const tokensSheetsIds = getGoogleSheetIds(tokensSheetsFolder);
  const tokens = fitlerUniqueTokensSheetsIds(tokensSheetsIds);

  const filtersSheet = createOrOverwriteSheet(filtersSheetName);

  addTokensToFiltersPage(filtersSheet, tokens);
  addCheckBoxesToFiltersPage(tokens.length);

  filtersSheet.autoResizeColumns(1, 10);
}

function addTokensToFiltersPage(filtersSheet: GoogleAppsScript.Spreadsheet.Sheet, tokens: {name: string, hash: string}[]){
  filtersSheet.appendRow(["", "Token Name", "Token Hash"]);

  tokens.forEach(t => {
    filtersSheet.appendRow(["", t.name, t.hash]);
  });
}

function addCheckBoxesToFiltersPage(amountOfTokens: number){
  const filtersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(filtersSheetName);

  const rangeFrom = filtersPageA1Notations.tokens.checkBoxes.checkBoxesStartA1Notation;
  const rangeTo = "A" + (filtersPageA1Notations.tokens.tokensStartRow - 1 + amountOfTokens);

  Logger.log(rangeFrom + ":" + rangeTo);
  const range = filtersSheet.getRange(rangeFrom + ":" + rangeTo);

  range.insertCheckboxes("Y", "N");
}

function getSheetByNameCreateIfDoesntExist(name: string): GoogleAppsScript.Spreadsheet.Sheet{
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if(!sheet){
    sheet = ss.insertSheet(name);
  }

  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1);
  return sheet;
}

function createOrOverwriteSheet(name: string): GoogleAppsScript.Spreadsheet.Sheet{
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let oldSheet = ss.getSheetByName(name);
  if(oldSheet){
    oldSheet.setName(placeholderNameForDeletion);
  }

  let newSheet = ss.insertSheet(name);

  if(oldSheet){
    ss.deleteSheet(oldSheet);
  }
  
  moveSheet(newSheet, 1);
  return newSheet;
}

function moveSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet, newLocation: number){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1);
}

function fitlerUniqueTokensSheetsIds(allIds: string[]){
  let uniqueTokenHashes: string[] = [];
  let uniqueTokens: {name: string, hash: string}[] = [];

  allIds.forEach(id => {
    const sheet = SpreadsheetApp.openById(id);
    const tokenHash: string = sheet.getRange(tokenHashA1Notation).getValue();
    const tokenName: string = sheet.getRange(tokenNameA1Notation).getValue();
    if(uniqueTokenHashes.includes(tokenHash)){
      const indexToRemove = allIds.indexOf(id);
      if (indexToRemove > -1) {
        allIds.splice(indexToRemove, 1);
      }
    }
    else{
      uniqueTokenHashes.push(tokenHash);
      uniqueTokens.push({name: tokenName, hash: tokenHash})
    }
  });

  return uniqueTokens;
}

function getGoogleSheetIds(folder: GoogleAppsScript.Drive.Folder): string[]{
  let result: string[] = [];

  const files = folder.getFiles();
  while(files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() === googleSheetMimeType){
      result.push(file.getId());
    }
  }

  return result;
}

function getFolderByPathCreateIfDoesntExist(path: string[]): GoogleAppsScript.Drive.Folder{
  let currentFolder = DriveApp.getRootFolder();

  path.forEach(folderName => {
    const folderIter = currentFolder.getFoldersByName(folderName);

    if(folderIter.hasNext()){
      currentFolder = folderIter.next();
    }
    else{
      currentFolder = currentFolder.createFolder(folderName);
    }
  });
  return currentFolder;
}

function filterWalletsActiveInSpecifiedAmountUniqueTokens(
 sheetsIdPool: string[], minAmountBought: number, maxAmountBought: number): Map<string, number>{
  const walletsTokensMap = getWalletTokensMap(sheetsIdPool);
  let result = new Map<string, number>();

  walletsTokensMap.forEach((tokensHashes, walletHash) => {
    const nmOfTokens = tokensHashes.length;
    if(nmOfTokens >= minAmountBought && nmOfTokens <= maxAmountBought){
      result.set(walletHash, nmOfTokens);
    }
  });

  return result;
}

function getWalletTokensMap(sheetsIdPool:string[]): Map<string, string[]>{
  let walletTokensMap = new Map<string, string[]>();
  
  sheetsIdPool.forEach(id => {
    const sheet = SpreadsheetApp.openById(id);
    const tokenHash: string = sheet.getRange(tokenHashA1Notation).getValue();
    const newWalletsHashes: string[] = sheet.getRange(fromHashesA1Notation).getValues().map((w: string[]) => w[0]);

    newWalletsHashes.forEach(wallet => {
      if(wallet != ""){
        addUniqueTokenCreateWalletIfDoesntExist(tokenHash, wallet, walletTokensMap);
      }
    });
  });

  return walletTokensMap;
}

function addUniqueTokenCreateWalletIfDoesntExist(tokenHash: string, walletHash: string, walletTokensMap: Map<string, string[]>){
  const tokens = walletTokensMap.get(walletHash);
  if (!tokens){
    walletTokensMap.set(walletHash, [tokenHash])
  }
  else if(!tokens.includes(tokenHash)){
    tokens.push(tokenHash);
  }
}

function addMenuCryptoWalletAnalyzer(){
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Crypto Wallet Analyzer");
  menu.addItem("Refresh Filters sheet", "refreshFiltersSheet");
  menu.addItem("debug", "debugTemp");

  const subMenuFilters = ui.createMenu("Filters");
  subMenuFilters.addItem("Wallets active in specified amount of unique tokens", "filterWalletsActiveInSpecifiedAmountUniqueTokens");
  menu.addSubMenu(subMenuFilters);

  menu.addToUi();
}
