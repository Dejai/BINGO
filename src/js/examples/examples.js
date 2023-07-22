/************************ GLOBAL VARIABLES ****************************************/
// New Bingo Board variable
const bingoBoard = new BingoBoard();

 // Set interval to clear other interval
 var examplesInterval = setInterval( ()=> {
    console.log("Generic Interval");
}, 30000);

/*********************** GETTING STARTED *****************************/

// Once doc is ready
mydoc.ready( async() => {

	let isExamplePage = location.pathname.includes("/examples")
	if(isExamplePage) { IS_BOARD_PAGE = false; }

    // Set the board with the game options
    bingoBoard.setCards(BingoGames, true);

    console.log(bingoBoard.Cards);

	// Get the list of game options for the board
    var options = bingoBoard.getGameOptions();
	mydoc.setContent("#gameOptions", {"innerHTML": options });
});

/********** HELPERS *****************************/

// Get selected game
function getSelectedGame(){
	return document.querySelector("#gameOptions")?.value ?? "";
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

// Show the example again
async function onShowExample(gameName="") {

    if(gameName == ""){
        gameName = getSelectedGame();
    }

	bingoBoard.setGameName(gameName);
    var gameCard = bingoBoard.getGameCard();
    if(gameCard == undefined){
        return;
    }

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
				CardManager.ignoreLetters(gameCard.IgnoreLetters);
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
		CardManager.ignoreLetters(gameCard.IgnoreLetters);
    }
}