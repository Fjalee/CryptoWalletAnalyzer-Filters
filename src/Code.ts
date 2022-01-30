
const tokenHashA1Notation = "E2";
const fromHashesA1Notation = "D12:D";

function myFunction(){
  const idsTemp = ["10HqqvSphHj4vS_aCOPn2GYg3o-1dpKuAFpvBmllb6-o", "1AZMcjGTK5NGcd1L0fSe9z4vnhFotnzseE3AtwkW6X8Q", "1jp6oGM7F-edX42zvs6CGpCmdhuPsfWi5fGVEmjjS1zA"];

  const tempResult = getWalletTokensMap(idsTemp);

  tempResult.forEach((value, key) => {
    Logger.log(key + ": " + value);
  });
}

function getWalletTokensMap(sheetsIdPool:string[]): Map<string, string[]>{
  let walletTokensMap = new Map<string, string[]>();
  
  sheetsIdPool.forEach(id => {

    const sheet = SpreadsheetApp.openById(id);
    const tokenHash: string = sheet.getRange(tokenHashA1Notation).getValue();
    const newWalletsHashes: string[] = sheet.getRange(fromHashesA1Notation).getValues().map((w: string[]) => w[0]);

    newWalletsHashes.forEach(wallet => {
      addUniqueTokenCreateWalletIfDoesntExist(tokenHash, wallet, walletTokensMap);
    });
  });

  return walletTokensMap;
}

function addUniqueTokenCreateWalletIfDoesntExist(tokenHash: string, walletHash: string, walletTokensMap: Map<string, string[]>){
  const tokens = walletTokensMap.get(walletHash);
  if (tokens && !tokens.includes(tokenHash)){
    tokens.push(tokenHash);
  }
  else{
    walletTokensMap.set(walletHash, [tokenHash])
  }
}

function testMenu(){
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('Test tab');
  menu.addItem('Test items', 'temp');
  menu.addToUi();
}
