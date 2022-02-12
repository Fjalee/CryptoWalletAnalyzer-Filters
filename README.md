## How to use

### Setup
#### Setup script
* open the script I shared with you (check email).
* click Run and allow permissions and then clsoe the script.
* create a google sheets file in your google drive and save it.
* in the file go to 'Extensions' -> 'Apps Script'.
* copy paste init script (below in this README file).
* click on Libraries+, add script ID 1RYYniNoyc4dCYGPF1jkX02eYoOUn_idQPjLVLBhNGL2tjyxPvlxRR3vs
    *click Look up (if you are unable to look up lirbary that means I need to invite your email to the script access).
    *choose latest Version and Add.
* Run, and allow access.
* go to Triggers (hover over left side of the screen) -> + Add Trigger -> Select event type 'On open' -> save.
* refresh Filters.xlsx.
* in toolsbar 'Crypto Wallet Analyzer' should appear.
#### Add dex tables
* Wait for script to load (1-5 seconds), in toolsbar 'Crypto Wallet Analyzer' should appear.
* 'Crypto Wallet Analyzer' -> 'Refresh Filters sheet' in google drive new folder 'CryptoWalletAnalyzer' .should apear.
* go to the folder 'CryptoWalletAnalyzer' -> 'DexTables'.
* upload dex tables excel sheets to the folder.
* go to each dex table .xlsx file you uploaded and save as google sheets ('File' -> 'Save as Google Sheets'), you can delete the original .xlsx files.
* go back to the main google sheet and click 'Crypto Wallet Analyzer' -> 'Refresh Filters sheet', new sheet named 'Filters' should appear.

### Filtering
* click on checkboxes for tokens that should be included in filtering.
* if need to filter with dates double-click on cells bellow 'Date from' to choose dates.
    * not choosen dates includes all transactions.
#### Filter1
('Crypto Wallet Analyzer' -> 'Filters' -> 'Filter1')
    * choose 'Min. tokens amount' and 'Max. tokens amount'
    * filters all wallets that were involved in specified amount of tokens
    * doesn't care about transaction date
#### Filter2
('Crypto Wallet Analyzer' -> 'Filters' -> 'Filter2')
    * same as Filter1, but also applies date filter (specified in 'Date from' and 'Date to' cells)
        * not choosen dates (blank cells) includes all transactions for that token.

### FIY
* Example of 'Date from' and 'Date to'
    * Date from 2022-02-10 Date to 2022-02-11
    * it will incldue only transaction from 2022-02-10 00:00:00 to 2022-02-10 23:59:59
* If several dex table sheets with same Token (for example SUSHI) added (in the CryptoWalletAnalyzer/DexTables folder) then all of them (in the example all SUSHI sheets) are ignored.

## init script
function initialize() {
  Filters.initialize();
}

function refreshFiltersSheet(){
  Filters.refreshFiltersSheet();
}

function addMenuCryptoWalletAnalyzer(){
  Filters.addMenuCryptoWalletAnalyzer();
}

function menuAdapterFilterWalletsActiveInSpecifiedAmountUniqueTokens(){
  Filters.menuAdapterFilterWalletsActiveInSpecifiedAmountUniqueTokens();
}

function debugTemp(){
  Filters.debugTemp();
}

function menuAdapterDeleteAllResults(){
  Filters.menuAdapterDeleteAllResults();
}

function menuAdapterFilterWalletsActiveInSpecifiedAmountUniqueTokensBetweenSpecifiedDates(){
  Filters.menuAdapterFilterWalletsActiveInSpecifiedAmountUniqueTokensBetweenSpecifiedDates();
}