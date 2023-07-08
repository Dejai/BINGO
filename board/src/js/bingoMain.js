
/************* GLOBAL/PUBLIC VARIABLES ****************************************/

// The BOARD object
const bingoBoard = new BingoBoard();

 // Set interval to clear other interval
 var examplesInterval = setInterval( ()=> {
    console.log("Generic Interval");
}, 30000);


/*********************** GETTING STARTED *****************************/

// Once doc is ready
mydoc.ready( async() => {

	MyTrello.SetBoardName("bingo");

	let isExamplePage = location.pathname.includes("/examples")
	if(isExamplePage) { IS_BOARD_PAGE = false; }

    // Set the board with the game options
    bingoBoard.setCards(BingoGames, true);

    console.log(bingoBoard.Cards);

	// Get the list of game options for the board
    var options = bingoBoard.getGameOptions();
	mydoc.setContent("#gameOptions", {"innerHTML": options });

    // Set the main Game Board
    // Load the game board
    await MyTemplates.getTemplate("/board/src/templates/bingoBoard.html", {}, (template) => {
        mydoc.setContent("#game_table_body", {"innerHTML":template});
    });
	
	// Ensure all listeners are set
	listenerOnKeyUp();
    // window.addEventListener("beforeunload", onClosePage);

});

/********** HELPERS *****************************/

// Get selected game
function getSelectedGame(){
	return document.querySelector("#gameOptions")?.value ?? "";
}

// Adds a listener for keystrokes (on keyup);
function listenerOnKeyUp(){
	document.addEventListener("keyup", function(event){
		switch(event.code)
		{
			case "Enter":
                let activeElement = document.activeElement;
                if(bingoBoard.gameStarted()) {
                    if( (activeElement?.id ?? "") == "specificCardInput") {
                        onCheckSpecificCard();
                    } else {
                        onSelectNumber();
                    }
                }
				break;
			default:
				return;
		}
	});
}

/********** ACTIONS -- LISTENERS *****************************/

// Prevent the page accidentally closing
function onClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

// Check for BINGO Across All Cards
async function onCheckForBingo()
{

    // Clear if BINGO was set
    CardManager.clearBingoHeaders();

        // Hide/Clear things
        mydoc.hideContent(".hideOnCheckBingo");

        // Clear things
        mydoc.setContent(".clearOnCheckBingo", {"innerHTML":""});
        mydoc.setContent("#specificCardInput", {"value":""});

        // Show things
        mydoc.showContent(".showOnCheckBingo");

    // Get current card's required slots'
    var requiredSlots = bingoBoard.getRequiredSlots() ?? [];    

    // Get the Codes for all play cards currently stored in the game;
    var cardCodes = new Set();
    bingoBoard.getPlayCards()?.forEach( (card) => {
        cardCodes.add(card.Code);
    });

    // Set the named cards on the game board
    let namedCards = await CardManager.getBingoCardsByList("NAMED_CARDS");
    namedCards = namedCards.filter(x => !cardCodes.has(x.Code));
    bingoBoard.setCards(namedCards);

    // Set the random cards on the game board
	let randomCards = await CardManager.getBingoCardsByList("RANDOM_CARDS");
    randomCards = randomCards.filter(x => !cardCodes.has(x.Code));
    bingoBoard.setCards(randomCards);

	// Get the state of all the cards & if board state matches, add card
	var matchingCards = bingoBoard.getPlayCards()?.filter( card => card.isBingo(bingoBoard.getNumbers(), requiredSlots)?.verdict ) ?? [];

    // Show results
    if(matchingCards.length > 0) { 
        mydoc.setContent("#totalMatchingCards", {"innerHTML":`${matchingCards.length} Cards Found!`});
        // Get just the codes of the cards; Sorted; 
        var codes = matchingCards.map( card => card.Code)?.sort()?.map( code => { return {"Code": code} });
        await MyTemplates.getTemplate("/board/src/templates/checkBingoOption.html", codes, (template) =>{
            mydoc.setContent("#matchingCards", {"innerHTML":template});
        });
        mydoc.hideContent("#checkingForBingoLoading");
        mydoc.showContent("#matchingCards");
        mydoc.showContent("#dontSeeCard");
    } else {
        mydoc.hideContent("#checkingForBingoLoading");
        mydoc.setContent("#totalMatchingCards", {"innerHTML":"No Cards Found!"});
        mydoc.setContent("#matchingCards", {"innerHTML":"There are no cards that have BINGO right based on the called numbers."});
        mydoc.showContent("#matchingCards");
        mydoc.showContent("#dontSeeCard");
    }

	
}	

// Validate a card to see if it has bing
async function onCheckSpecificCard(event) {
    
    // Clear if BINGO was set
    CardManager.clearBingoHeaders();  

    var codeFromButton = event?.target?.innerText; 
    var codeFromInput = mydoc.getContent("#specificCardInput")?.value;
    var code = codeFromButton ?? codeFromInput;    

    var card = bingoBoard.getCard(code);
    if(card != undefined) {
        
        // Set the card Name
        mydoc.setContent("#bingoBoardCardName", {"innerHTML":card.FullName });

        // Get the templates for the card (only use the first one);
        var templates = await card.getTemplates("board");
        var template = templates?.[0];

        mydoc.setContent("#bingo_card_body", {"innerHTML":template});

            // Hide things
            mydoc.hideContent("#game_table_body");
            mydoc.hideContent("#game_example_table_body");

            mydoc.showContent("#bingo_card_body");

        // Numbers & required slots
        let numbers = bingoBoard.getNumbers();
        let reqSlots = bingoBoard.getRequiredSlots();

        let isBingo = card.isBingo(numbers, reqSlots);

        if(isBingo.verdict) {
            var selector = `#game_table`;
            CardManager.setBingoHeader(selector);  

            //Show the option to reset the game;
            mydoc.showContent("#reset_game_button");

            reqSlots = [isBingo.slots];
        } 
        // Highlight the cells that were required            
        reqSlots?.[0].forEach( (slot) => {
            cell = document.querySelector(`.number_slot_${slot}`);
            if(cell != undefined && (slot == "N3" || numbers.includes(cell.innerText)) ) {
                cell.classList.remove("cell_unseen");
                cell.classList.add("cell_seen");
                cell.classList.add("number_selected");
            }
        });
    }
}

// Describe the game
async function onDescribeGame(desc=""){
    var description = "";
    if(desc == ""){
        // Describe the selected game
        var gameName = getSelectedGame();
        var currentCard = bingoBoard.getCard(gameName);
        description = currentCard?.Desc;
    }
    await theBingoVoice.speakText(description, 0.9);
}

// Hide the example again
function onHideExample() {
    // Hide things
    mydoc.hideContent(".hideOnSelect");
    // Show things
    mydoc.showContent(".showOnSelect");
}

// RESET The game
function onResetGame(){
    let confirmReset = confirm("Are you sure you want to reset?");
    if(confirmReset){

        // Reset board game
        bingoBoard.newGame();

        // Clear if BINGO was set
        CardManager.clearBingoHeaders();
            
        // Hide Things
        mydoc.hideContent(".hideOnReset");

        // Clear things
        mydoc.setContent(".clearOnReset", {"innerHTML":""});
        CardManager.showIgnoredLetters();
        CardManager.clearSeenCells();

        // Show Things
        mydoc.showContent(".showOnReset");
        mydoc.setContent("#gameOptions", {"disabled":""})
        mydoc.setContent("#gameOptions", {"value":""});
    }
}

// Selecting the game to play
async function onSelectGame(event) {
	// Ensure target & value is set;
	let target = event.target;
	let value = target?.value ?? "";
	if(value != ""){
        // Show the selected game as the example; 
        onShowExample(value);
	}
        // Hide things
        mydoc.hideContent(".hideOnGameSelect");

        // Show/Enable things
        mydoc.showContent(".showOnGameSelect");
        mydoc.addClass("#startGameButton", "dlf_button_limegreen");
        mydoc.removeClass("#startGameButton", "dlf_button_gray");
        mydoc.setContent("#startGameButton", {"disabled":""});
}

// Select a number
async function onSelectNumber()
{
    if(!bingoBoard.gameStarted()) {
        alert("Please select a game first");
        return;
    }

    // For after BINGO checks;
    CardManager.clearBingoHeaders();  

    // Clear the generic interval before using it
    clearInterval(examplesInterval);

    // If currently disabled, just return;
    if( document.querySelector("#pickNumberButton")?.disabled ) { return; }

        // Hide Things
        mydoc.hideContent(".hideOnSelect");

        // Clear Things
        mydoc.setContent(".clearOnSelect", {"innerHTML":""});
        
        // Show things
        mydoc.showContent(".showOnSelect");
        mydoc.setContent("#pickNumberButton", {"disabled":"disabled"});
        mydoc.addClass("#pickNumberButton", "dlf_button_gray");
        mydoc.setContent("#checkForBingoButton", {"disabled":"disabled"});
        mydoc.addClass("#checkForBingoButton", "dlf_button_gray");
        mydoc.setContent("#bingoBoardCardName", {"innerHTML":""});

    // Get a random ball from the game
    let randomBall = bingoBoard.Game.getRandomBall();
    if(randomBall.Ball != "") {  

        mydoc.setContent("#bingoBallSection", {"innerHTML": randomBall.Ball});

        // Speak the ball number
        await theBingoVoice.speakText(randomBall.BingoNum, 0.9, 1500);
        await theBingoVoice.speakText(randomBall.BingoNum, 0.6);

        if(randomBall?.AllNumbers ?? false){
            let allNumMsg = `All numbers under the letter ${randomBall.Letter} have been called`;
            await theBingoVoice.speakText(allNumMsg, 0.9, 1500);
            await theBingoVoice.speakText(allNumMsg, 0.9);
        }
    }

        // Re-Enable
        mydoc.setContent("#pickNumberButton", {"disabled":""});
        mydoc.removeClass("#pickNumberButton", "dlf_button_gray");
        mydoc.setContent("#checkForBingoButton", {"disabled":""});
        mydoc.removeClass("#checkForBingoButton", "dlf_button_gray");

}

// Start the game
async function onStartGame()
{
	var selectedGame = getSelectedGame();
	if(selectedGame == ""){
		alert("Please select a game first!");
		return;
	}

    // Clear if BINGO was set
    CardManager.clearBingoHeaders();

    // Clear the interval
    clearInterval(examplesInterval);

    // Start a new game;
    bingoBoard.newGame(selectedGame);

    // Get the current game's card;
    var gameCard = bingoBoard.getGameCard();

    // Hide the letters on the board
    CardManager.ignoreLetters(gameCard.IgnoreLetters);

        // Hide/Disablethings
        // mydoc.hideContent("#game_example_table_body");
        // mydoc.hideContent("#startGameButton");
        // mydoc.hideContent("#describeGameLink");
        mydoc.hideContent(".hideOnStart");
        mydoc.setContent("#gameOptions", {"disabled":"disabled"});
        mydoc.removeClass("#startGameButton", "dlf_button_limegreen");
        mydoc.addClass("#startGameButton", "dlf_button_gray");
        mydoc.setContent("#startGameButton", {"disabled":""});

        // Show things
        mydoc.showContent(".showOnStart");
        // mydoc.showContent("#game_table_body");
        // mydoc.showContent("#pickNumberButton");
        // mydoc.showContent("#checkForBingoButton");
        // mydoc.showContent("#showExampleLink");

    // Speak the game beginning
	await theBingoVoice.speakText("Let the Game Begin");

	// Set the time the game was started
	let time = Helper.getDate("H:m:s K");
    mydoc.setContent("#game_started_timestamp", {"innerHTML": `Game started @ ${time}`});

}

// Show the example again
async function onShowExample(gameName="") {

    if(gameName == ""){
        gameName = getSelectedGame();
    }

    var gameCard = bingoBoard.Cards[gameName];
    if(gameCard == undefined){
        return;
    }

    // Clear if BINGO was set
    CardManager.clearBingoHeaders();

    // Clear the generic interval before using it
    clearInterval(examplesInterval);

    // Get and show all templates for the game;
    var templates = await gameCard.getTemplates();
    var tmpCnt = templates.length;
    if(tmpCnt > 1) {
        mydoc.setContent("#game_example_table_body", { "innerHTML": templates[0] });
        var idx = 1;
        examplesInterval = setInterval( ()=> {
            if( idx < tmpCnt){
                mydoc.setContent("#game_example_table_body", { "innerHTML": templates[idx] });
                console.log("Specific Interval");
                idx++;
                if(idx == tmpCnt) { 
                    idx = 0;
                }
            }
        }, 700);
    } else {
        examplesInterval = setInterval( ()=> {console.log("Solo")}, 300000);
        var templateOne = templates[0];
        mydoc.setContent("#game_example_table_body", { "innerHTML": templateOne });
    }
        // Hide things
        mydoc.hideContent(".hideOnExample");

        // Show things
        mydoc.showContent(".showOnExample");

        if(bingoBoard.getGameName() == ""){
            mydoc.showContent("#startGameButton");
        }
}

// Show example & describe
async function onShowExampleAndDescribe() {

    if(getSelectedGame() == ""){ return; }

    if(bingoBoard.gameStarted()){
        mydoc.showContent(".showOnExampleAgain");
    }

    // First things first, show the game
    onShowExample();

    // Describe the selected game
    await onDescribeGame();
}

// Show the example again
function onShowExampleAgain(){
    
    // Hide things
    mydoc.hideContent(".hideOnExample");

    // Show things
    mydoc.showContent(".showOnExample");
    mydoc.showContent(".showOnExampleAgain");

onShowExampleAndDescribe();
}

// Show option to check specific card
function onShowCheckSpecificCard() {

    // Hide things
    mydoc.hideContent("#matchingCards");
    mydoc.hideContent("#dontSeeCard");

    // Show things
    mydoc.showContent("#onShowCheckSpecificCard");
    mydoc.showContent("#checkSpecificCard");

    // Focus in field
    document.querySelector("#specificCardInput")?.focus();
}

