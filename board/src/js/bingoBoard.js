

/* Used to manage the state of the BINGO Board */
class BingoBoard {

	constructor() {
		this.GameCards = {};
		this.Game = new BingoGame();
		this.loadGameCards();
		this.GameStarted = false;
	}

	// For new games, create a whole new instance of BingoGame
	newGame(name){
		this.Game = new BingoGame(name);
		this.Game.setCurrentCard(this.GameCards[name]);
	}

	// Load game options based on list from shared bingo objects;
	loadGameCards(){
		gameObjects2.forEach( (card) => {
			let cardObj = new CardObject(card, true);
			this.GameCards[cardObj.Name] = cardObj;
		});
	}

	// Get Game Options <option> Tags
	getGameOptions() {
		let cardObjs = Object.values(this.GameCards);
		var optgroups = {};
		cardObjs.forEach( (card) => {
			let group = card.Group;
			let key = card.Name;

			if(!optgroups.hasOwnProperty(group)) {
				optgroups[group] = `<optgroup label="${group}">`
			}
			var option = "<option class='game_option' value=\"" + key + "\">" + key + "</option>";
			optgroups[group] += option;
		});

		// Build the set of options
		var options = "<option value=''>SELECT GAME...</option>";
		Object.keys(optgroups).forEach( (key)=>{
			var group = optgroups[key];
			group += "</optgroup>";
			options += group;
		});
		return options;
	}

	// Get the game board
	async setGameBoard(){
		// Load the game board
		await MyTemplates.getTemplate("/board/src/templates/bingoBoard.html", {}, (template) => {
			mydoc.setContent("#game_table_body", {"innerHTML":template});
		});
	}

	// When someone wins
	async endGame(){
		// Reset the board
		await this.setGameBoard();
	}

	// Get the card table for the current selected game
	async getGameCardTable(cardName) {
		
		var gameCardTable = await this.Game.getCurrentCard()?.getCardTable();
		return gameCardTable;
	}


	// ******** SHOW-and-tell *********/

	// Show a game example
	async showGameExample(name){
		var gameCard = this.GameCards[name];
		console.log(gameCard);

		if(gameCard == undefined){
			return;
		}
		var cardTable = await gameCard.getCardTable();
		mydoc.setContent("#game_example_table_body", { "innerHTML": cardTable });

			// Hide things
			mydoc.hideContent("#game_table_body");
			mydoc.hideContent(".bingo_card_body");

			// Show things
			mydoc.showContent("#game_example_table_body");
			
	}

	// Ignore letters based on game
	ignoreLettersByGame(){
		// Get current cared & process the ignores;
		let gameCard = this.Game.getCurrentCard();
		gameCard?.Ignores?.forEach( (letter) => {
			var selector = `[data-letter^="${letter}"]`;
			mydoc.removeClass(selector, "cell_unseen");
			mydoc.addClass(selector, "inelligible");
		});
	}
}

/************************ GLOBAL VARIABLES ****************************************/
// var synth = window.speechSynthesis;
var voicesMap = {};

var CURR_GAME = undefined;
var GAME_STARTED = false;
var IS_BOARD_PAGE = true;

var NUMBERS_CALLED = [];
var CARDS = {};

var IS_SPEAKING = false;

// Saved cards
var SAVED_CARDS = [];

// To determine the trigger for the ENTER button
var CHECKING_FOR_BINGO = false;

var BOARD_CARDS = {};


/********************** LOAD CONTENT *******************************/
// Show numbers already called on a card
function showNumbersCalledOnCard()
{
	let cells = document.querySelectorAll(".bingo_card_body .number_cell");

	cells.forEach( (cell)=>{

		let val = cell.innerText;
		let needed = cell.classList.contains("number_cell_needed") || (CURR_GAME == "Straight Line");
		isFreeSpace = (cell.querySelectorAll(".freeSpace")?.length >= 1)
		if (needed && (NUMBERS_CALLED.includes(val) || isFreeSpace) )
		{
			cell.classList.remove("cell_unseen");
			cell.classList.add("cell_seen");
			cell.classList.add("number_selected");
		}
	});
}

/****************** GAME SETTING ACTIONS ****************************/

// Action to describe the selected game
function onDescribeGame(game,sayCost=false)
{
	desc = games_object[game]["desc"];
	cost = undefined;
	// cost = (sayCost) ? `This game costs ${games_object[game]["cost"]}` : undefined;

	// Describe the game and cost;
	speakText(desc, cost, 0.9, 0.9, 700);
}


// Action to load the selected game example
function onLoadGameExample(value, depth=0)
{

	game_obj = games_object[value];

	if (game_obj != undefined)
	{
		// Load the game cost;
		cost = game_obj["cost"];
		mydoc.loadContent(`Cost: ${cost}`,"game_cost");

		game_table = game_obj["example"];
		if(value == "Straight Line")
		{
			// Show the example body;
			toggleGameBoardTableBody("example");
			// toggleExampleTableBody("show");

			// Load all the examples;
			let examples = getStraightLinExamples();
			onLoadGameExampleTable(examples[0]);	

			idx = 1;
			let straightLineInterval = setInterval( ()=>{

				onLoadGameExampleTable(examples[idx]);	
				idx+=1 
				if(idx == examples.length)
				{
					clearInterval(straightLineInterval);
				}
			}, 500);
		}
		else if (game_table !== undefined)
		{
			// toggleExampleTableBody("show");
			toggleGameBoardTableBody("example");
			onLoadGameExampleTable(game_table);
		}
		else 
		{
			toggleGameBoardTableBody("board");
			// toggleExampleTableBody("hide");
		}
	} 
}

// Action to load the example table
function onLoadGameExampleTable(game_table)
{
	game_example = "";
	for(var rowIdx = 0; rowIdx < game_table.length; rowIdx++)
	{
		row = game_table[rowIdx];
		b = ""; i = ""; n = ""; g= ""; o = "";
		tr = "<tr class='example_row'>";

		for(var idx = 0; idx < row.length; idx++)
		{
			cell = row[idx];
			idx_to_letter = {0:"B", 1:"I", 2:"N", 3:"G", 4:"O"};
			class_val = (cell == 1 || cell == 8) ? "example_filled" : "example_empty";
			cell_val = (cell == 8 || cell == 3) ? "FREE" : cell == 1 ? "X" : "_";
			letter_val = (cell == 8 || cell == 3) ? "FREE" : idx_to_letter[idx];

			td = `<td class="example ${class_val}" data-letter="${letter_val}">${cell_val}</td>`;
			tr += td;
		}
		tr += "</tr>";
		game_example += tr;
	};
	mydoc.loadContent(game_example, "game_example_table_body");
}


// Hide the example again
function onHideGameExample()
{
	toggleGameBoardTableBody("board");
	mydoc.showContent("#showExampleLink");
	mydoc.hideContent("#hideExampleLink");
}

// Get all the straight line examples
function getStraightLinExamples()
{
	all_examples = [];

	diag_left = getBaseGameTable();
	diag_right = getBaseGameTable();

	for (var idx = 0; idx < 5; idx++)
	{
		// Setup the diagonal example
		left = idx;
        right = (5-idx)-1;
		diag_left[idx][left] = (idx == 2) ? 8 : 1;
		diag_right[idx][right] = (idx == 2) ? 8 : 1;

		// Setup row-based wins
		let row_based = getBaseGameTable()
		row_based[idx] = (idx ==2 ) ? [1,1,8,1,1] : [1,1,1,1,1];
		all_examples.push(row_based);

		// Setup col-based wins
		let col_based = getBaseGameTable();
		for(var itr = 0; itr < 5; itr++)
		{
			col_based[itr][idx] = ((idx == 2 && itr == 2)) ? 8 : 1;
		}
		all_examples.push(col_based);
	}

	all_examples.push(diag_left);
	all_examples.push(diag_right);
	return all_examples;
}

// Get a base game example
function getBaseGameTable()
{
	base_game_table = 	[
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,3,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
	]
	return base_game_table;
}

// Action to change the game theme
function onChangeTheme(event)
{
	let selector = document.getElementById("theme_selector");
	let new_theme = selector.value; 

	let old_theme = document.querySelector("[class^='theme_']").classList[0];

	let elements = Array.from(document.querySelectorAll("."+old_theme));
	elements.forEach(function(ele){
		ele.classList.remove(old_theme);
		ele.classList.add(new_theme);
	});
}



function toggleGameSettings()
{
	button = document.getElementById("game_settings_button");
	section = document.getElementById("game_settings_section");

	if (section.classList.contains('hidden'))
	{
		section.classList.remove("hidden");
	}
	else
	{
		section.classList.add("hidden");
	}
}

// Toggle the table bodies on the game board
function toggleGameBoardTableBody(state)
{
	switch(state)
	{
		case "example":
			mydoc.hideContent("#game_table_body");
			mydoc.showContent("#game_example_table_body");
			mydoc.hideContent(".bingo_card_body");
			break;
		case "card":
			mydoc.hideContent("#game_table_body");
			mydoc.hideContent("#game_example_table_body");
			mydoc.showContent(".bingo_card_body");
			break;
		// Default to the board view
		default:
			mydoc.showContent("#game_table_body");
			mydoc.hideContent("#game_example_table_body");
			mydoc.hideContent(".bingo_card_body");

	}
}

// Toggle game board element state
// Used for the following: Game Options select field; Start Game button; Pick Number button;
function toggleGameBoardInput(identifier, state, className)
{
	let element = document.getElementById(identifier)
	if(element != undefined)
	{
		let disabledClass = (className != undefined) ? className : "dlf_button_gray";
		let enabledClass = (className != undefined) ? className : "dlf_button_limegreen";
		switch(state)
		{
			case "disable":
				element.disabled = true;
				if(element.tagName == "BUTTON")
				{
					element.classList.add(disabledClass);
				}
				break;
			// Default to enabling it.
			default:
				element.disabled = false;
				if(element.tagName == "BUTTON")
				{
					element.classList.remove(disabledClass);
					element.classList.add(enabledClass);
				}
		}
	}
}

/************************ GAME BOARD ACTIONS *******************************/

// Reset the entire board (including reseting unseen cells)
function onResetGame()
{
	confirm_reset = confirm("Are you sure you want to reset the board?")

	if(confirm_reset)
	{
		// Reset GAME_STARTED and CHECKING_FOR_BINGO
		GAME_STARTED = false;
		CHECKING_FOR_BINGO = false;

		// Hide reset button & example links
		mydoc.hideContent("#reset_game_button");
		mydoc.hideContent("#exampleLinks");

		// Reset the headers for bingo
		toggleBingoHeaders("remove");
		mydoc.setContent("#bingoBoardCardName", {"innerHTML":""});
		onClearSearch();

		// Reset the board table view
		toggleGameBoardTableBody("board");
		mydoc.hideContent("#checkForBingoButton");
		mydoc.hideContent("#checkForBingoSection");


		// Reset the letter counts;
		letterCounts = {"B":0, "I":0, "N":0, "G":0,"O":0 };

		// Reset selected cell;
		setBingoBall("");

		// Reset cells;
		resetCellsUnseen();
		resetCellsInelligible();

		// Reset the selected game
		document.getElementById("gameOptions").value = "";
		CURR_GAME = "";
		toggleGameBoardInput("gameOptions","enabled");

		// Reset Start Game
		toggleGameBoardInput("startGameButton","disable");

		// Reset buttons
		mydoc.hideContent("#startGameButton");
		mydoc.hideContent("#pickNumberButton");

		// Reset time started value
		mydoc.loadContent("", "game_started_timestamp");

	}	
}

// Ensuring all cells are set back to unseen
function resetCellsUnseen()
{
	bingo_cells = Array.from(document.querySelectorAll(".bingo_cell"));

	bingo_cells.forEach(function(obj){
		obj.classList.remove("cell_seen");
		obj.classList.add("cell_unseen");
	});
}

// Making sure the inelligible cells are back to elligible
function resetCellsInelligible()
{
	list = Array.from(document.querySelectorAll(".inelligible"));

	list.forEach(function(obj){
		obj.classList.remove("inelligible");
		obj.classList.add("cell_unseen");
	});
}

/******************** SPEECH SYNTHESIS ACTIONS **************************/

// Run a function once a statement is done speaking
function runAfterSpeaking(callBackFunction)
{
	let checkSpeaking = setInterval(() => {
		if(!IS_SPEAKING)
		{
			callBackFunction();
			clearInterval(checkSpeaking);
		}
	}, 500);
}

// Get the value of the selected option
function getSelectedVoice()
{

	let selectedVoice = voicesMap["Alex"];

	let ele = document.querySelector("#voiceSelect");
	value = ele.value;
	option  = ele.querySelector("option[data-name='"+value+"']");
	if (option != undefined)
	{
		name          = option.getAttribute("data-name");
		selectedVoice = voicesMap[name];
	}
	return selectedVoice
}


// Toggling the state of the BINGO headers
function toggleBingoHeaders(state)
{
	document.querySelectorAll("[class*='card_header_']").forEach( (cell)=>{

		if (state == "show")
		{
			cell.classList.add("bingo_blink");
			cell.classList.remove("game_table_header");
		}
		else
		{
			cell.classList.remove("bingo_blink");
			cell.classList.add("game_table_header");
		}
	});
}