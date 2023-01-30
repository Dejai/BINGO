
/************************ GLOBAL VARIABLES ****************************************/
var synth = window.speechSynthesis;
var voicesMap = {};
var letterCounts = {"B":0, "I":0, "N":0, "G":0,"O":0 };

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

/*********************** GETTING STARTED *****************************/

// Once doc is ready
mydoc.ready(function(){

	MyTrello.SetBoardName("bingo");

	let isExamplePage = location.pathname.includes("/examples")
	if(isExamplePage) { IS_BOARD_PAGE = false; }

	// Always Load the game options and add a listener for them
	loadGameOptions();
	listenerOnGameOptionChange();

	// Load an empty example table
	table = [
				[0,0,0,0,0],
				[0,0,0,0,0],	
				[0,0,3,0,0],	
				[0,0,0,0,0],	
				[0,0,0,0,0]		
			]
	onLoadGameExampleTable(table);
});

/********************* LISTENERS *************************************/

// Prevent the page accidentally closing
function onClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

// Adds a listener for keystrokes (on keyup);
function listenerOnKeyUp(){
	document.addEventListener("keyup", function(event){
		switch(event.code)
		{
			case "Enter":
				if(!GAME_STARTED && !CHECKING_FOR_BINGO)
				{
					onStartGame();
				}
				else if (GAME_STARTED && !CHECKING_FOR_BINGO)
				{
					onPickNumber();
				}
				break;
			default:
				return;
		}
	});
}

// Adds listener for when new game is selected
function listenerOnGameOptionChange()
{
	options = document.getElementById("gameOptions");
	if(options != undefined)
	{
		options.addEventListener("change", (event)=>{

			// Disable the start button whenever changing game;
			toggleGameBoardInput("startGameButton","disable");

			let ele = event.target;
			CURR_GAME = ele.value ?? "";

			if(CURR_GAME != "")
			{
				mydoc.showContent("#playThisGameButton");

				// Load the game example
				onLoadGameExample(ele.value);
			}
		});
	}
}

/********************** LOAD CONTENT *******************************/

// Load the game options object
function loadGameOptions()
{	
	game_keys = Object.keys(games_object);
	optgroups = {};        
	// Group all the games
	game_keys.forEach( (key)=> {

		game = games_object[key];
		group = game["group"];

		if(!optgroups.hasOwnProperty(group))
		{
			optgroups[group] = `<optgroup label="${group}">`
		}
		option = "<option class='game_option' value=\"" + key + "\">" + key + "</option>";
		optgroups[group] += option;
	});

	// Load the grouped options
	options = "<option value=''>SELECT GAME...</option>";
	Object.keys(optgroups).forEach( (key)=>{

		group = optgroups[key];
		group += "</optgroup>";

		options += group;
	});


	mydoc.loadContent(options, "gameOptions");
}

/****************** GAME SETTING ACTIONS ****************************/

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
			toggleGameBoardTableBody("example");
			onLoadGameExampleTable(game_table);
		}
		else 
		{
			toggleGameBoardTableBody("board");
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

