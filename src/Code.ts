
const tokenHashA1Notation = "E2";
const fromHashesA1Notation = "D12:D";

function myFunction(){
  const idsTemp = ["10HqqvSphHj4vS_aCOPn2GYg3o-1dpKuAFpvBmllb6-o", "1AZMcjGTK5NGcd1L0fSe9z4vnhFotnzseE3AtwkW6X8Q", "1jp6oGM7F-edX42zvs6CGpCmdhuPsfWi5fGVEmjjS1zA"];

  // const tempResult = filterWalletsActiveInSpecifiedAmountUniqueTokens(idsTemp, 2, 3);
  const tempResult = getWalletTokensMap(idsTemp);


  tempResult.forEach((value, key) => {
    Logger.log(key + ": " + value);
  });
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
      addUniqueTokenCreateWalletIfDoesntExist(tokenHash, wallet, walletTokensMap);
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
