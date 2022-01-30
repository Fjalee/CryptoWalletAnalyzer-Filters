
const tokenHashA1Notation = "E2";
const fromHashesA1Notation = "D12:D";

const googleSheetMimeType = "application/vnd.google-apps.spreadsheet";
const pathFolderTokensSheets = ["CryptoWalletAnalyzer", "DexTables"];

function myFunction(){
  const tokensSheetsFolder = getFolderByPathCreateIfDoesntExist(pathFolderTokensSheets);
  const tokensSheetsIds = getGoogleSheetIds(tokensSheetsFolder);

  const tempResult = filterWalletsActiveInSpecifiedAmountUniqueTokens(tokensSheetsIds, 3, 3);
  tempResult.forEach((value, key) => {
    Logger.log(key + ": " + value);
  });
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

function testMenu(){
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('Test tab');
  menu.addItem('Test items', 'temp');
  menu.addToUi();
}
