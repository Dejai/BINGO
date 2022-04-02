
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

	if(IS_BOARD_PAGE)
	{
		// Make sure the page doesn't close once the game starts
		window.addEventListener("beforeunload", onClosePage);

		// Load the game cells table
		loadGameCells();

		// Load the game voice options
		loadVoiceOptions();

		// Add listener for "Enter Key"
		listenerOnKeyUp();
	}
	else
	{
		// Load an empty example table
		table = [
					[0,0,0,0,0],
					[0,0,0,0,0],	
					[0,0,3,0,0],	
					[0,0,0,0,0],	
					[0,0,0,0,0]		
				]
		onLoadGameExampleTable(table);
	}
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
				else if (CHECKING_FOR_BINGO)
				{
					onCheckCardForBingo();
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


// Add listener for the speaker's voice demo
function listenerOnSpeakVoiceDemo()
{

	let voiceSelect = document.getElementById("voiceSelect");
	// ele = event.target; 
	value = voiceSelect.value;
	option  = voiceSelect.querySelector("option[data-name='"+value+"']");
	if (option != undefined)
	{
		let speakerName = option.getAttribute("data-name");
		// https://dev.to/asaoluelijah/text-to-speech-in-3-lines-of-javascript-b8h
		text = "Hello. My name is " + speakerName + ". And this is how I would call a number:"
		subtext = "I 20";
		speakText(text, subtext, 0.9, 0.6, 500);
	}
}
	
// Checking a selected card for bingo
function onCheckCardForBingo()
{

	console.log("Checking for BINGO on board");

	let cardName = document.getElementById("check_bingo_card")?.value;
	if(cardName != undefined & Object.keys(CARDS).includes(cardName))
	{
		toggleGameBoardTableBody("card");

		// Create the card using teh stored values;
		b = CARDS[cardName]["b"];
		i= CARDS[cardName]["i"];
		n = CARDS[cardName]["n"];
		g = CARDS[cardName]["g"];
		o = CARDS[cardName]["o"];
		createCardTable(b,i,n,g,o);

		// Map the cells for reference
		GAME_BOARD_CELLS = []; // clear it to make sure no other card is in there;
		mapNumberCells();

		// Show the needed cells for this game (if not straight line);
		if(CURR_GAME != "Straight Line")
		{
			console.log("Showing needed cells");
			onShowNeededCells(CURR_GAME);
		}

		// Highlight the numbers already called
		showNumbersCalledOnCard();

		// Check if BINGO is WON
		checkForBingo();
	}
	else
	{
		alert("Enter a valid card name");
	}

}

/********************** LOAD CONTENT *******************************/

// Gets the list of voices
function getListOfVoices() {
  // voices = synth.getVoices();
  var voices = synth.getVoices();
  var voiceSelect = document.querySelector('#voiceSelect');

  for(i = 0; i < voices.length ; i++) {
  	var current_voice = voices[i];
  	voicesMap[current_voice.name] = voices[i];

  	if (current_voice.lang.includes("en") && !current_voice.name.includes("Google"))
  	// if (current_voice.lang.includes("en") || true)
  	{
  		var option = document.createElement('option');
    	option.textContent = current_voice.name;
    	 // + ' (' + current_voice.lang + ')';
    	// if(current_voice.default) {
	    //   option.textContent += ' -- DEFAULT';
	    // }
	    option.setAttribute('data-lang', voices[i].lang);
    	option.setAttribute('data-name', voices[i].name);
    	voiceSelect.appendChild(option);
  	} 
  }
}

// Calls prev function & loads voices;
function loadVoiceOptions()
{
	getListOfVoices();
	if (speechSynthesis.onvoiceschanged !== undefined) {
	  speechSynthesis.onvoiceschanged = getListOfVoices;
	}
}

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

// Load the table of game cells
function loadGameCells()
{
	data = bingo_letters;

	cells = "";
	for (var letter in data)
	{
		if (letter != "contains")
		{
			cells += "<td class='game_table_cell'><table class=\"table\">";
			range = bingo_letters[letter];
			start = range[0];
			end   = range[range.length-1];
			for(var idx = start; idx <= end; idx++ )
			{
				cells += "<tr><td class='bingo_cell theme_black_bg cell_unseen' data-letter=\"" + letter+ "\">" + idx + "</td></tr>";

			}
			cells += "</table></td>";
		}
	}
	mydoc.loadContent(cells, "game_table_body");
}

// Show numbers already called on a card
function showNumbersCalledOnCard()
{
	let cells = document.querySelectorAll("#bingo_card_body .number_cell");

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
	desc 	= games_object[game]["desc"];
	cost = (sayCost) ? `This game costs ${games_object[game]["cost"]}` : undefined;

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

function onAnnounceGame()
{
	let selectField = document.getElementById("gameOptions")
	let value = selectField?.value;

	if(value != undefined)
	{

		// Hide the play button
		mydoc.hideContent("#playThisGameButton")

		// Toggle the start game button to be temporarily disabled;
		mydoc.showContent("#startGameButton");
		toggleGameBoardInput("startGameButton","disable");

		// Load the game example
		onLoadGameExample(value);
		ignoreCellsByGame(value);

		// Only describe a game if not already speaking;
		if(IS_BOARD_PAGE && !IS_SPEAKING)
		{
			runAfterSpeaking(()=>{
				onDescribeGame(value, true);
			});
		}
		
		runAfterSpeaking(()=>{
			toggleGameBoardInput("startGameButton","enable");
		});

		

		
	}
}

// Hide the example again
function onHideGameExample()
{
	toggleGameBoardTableBody("board");
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

// Check if someone has BINGOd
function onShowCheckBingoSection()
{
	// Checking for BINGO is now true;
	CHECKING_FOR_BINGO = true;

	// Load the saved cards (again) to make sure nobody got missed
	loadSavedCards("", (card)=>{
		createCardObject(card);
	});

	// Hide the ball and show the loading
	mydoc.hideContent("#bingoBallSection");
	mydoc.showContent("#checkForBingoSectionLoading");

	setTimeout(()=>{
		// Clear the field
		let cardNameField = document.getElementById("check_bingo_card");
		if(cardNameField != undefined)
		{
			cardNameField.value = "";
		}

		// Hide the loading
		mydoc.hideContent("#checkForBingoSectionLoading");

		// Show the sections
		mydoc.showContent("#checkForBingoSection");
	}, 2000)

	
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
			mydoc.hideContent("#bingo_card_body");
			break;
		case "card":
			mydoc.hideContent("#game_table_body");
			mydoc.hideContent("#game_example_table_body");
			mydoc.showContent("#bingo_card_body");
			break;
		// Default to the board view
		default:
			mydoc.showContent("#game_table_body");
			mydoc.hideContent("#game_example_table_body");
			mydoc.hideContent("#bingo_card_body");

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

function onStartGame()
{
	if(CURR_GAME == "")
	{
		alert("Please select a game first!");
		return;
	}

	// Show the reset button
	mydoc.showContent("#reset_game_button");

	// Show the example links and hide the announce game
	mydoc.showContent("#exampleLinks");
	mydoc.hideContent("#playThisGameButton");


	// Disable the option to change the game:
	toggleGameBoardInput("gameOptions","disable");

	// Hide/Show things
	mydoc.hideContent("#startGameButton");
	toggleGameBoardTableBody("board");
	mydoc.showContent("#checkForBingoButton")

	mydoc.showContent("#pickNumberButton");
	
	speakText("Let the Game Begin");
	GAME_STARTED = true;


	// Set the time the game was started
	let time = Helper.getDate("H:m:s K");
	mydoc.loadContent(`Game started @ ${time}`, "game_started_timestamp");
}

// Pick a random number from the board; Only from unseen
function onPickNumber()
{

	if(!GAME_STARTED)
	{
		alert("Please select a game first!");
		return;
	}

	// If already disabled, do nothing
	let pickNumButton = document.getElementById("pickNumberButton");
	if (pickNumButton.disabled)
	{
		return;
	}

	// Not checking for BINGO if this is being called
	CHECKING_FOR_BINGO = false;

	// Make sure the board is showing
	toggleGameBoardTableBody("board");
	toggleBingoHeaders("remove"); // Make sure any BINGO already shown is cleared

	// Show the ball section
	mydoc.showContent("#bingoBallSection");
	// Hide the Check Bingo Sections
	mydoc.hideContent("#checkForBingoSection");
	mydoc.hideContent("#checkForBingoSectionLoading");


	// Disable picker temporarily 
	toggleGameBoardInput("pickNumberButton", "disable");

	// Get the amount of unseen cells
	unseen_cells = document.getElementsByClassName("cell_unseen");
	amount = unseen_cells.length;

	// Get a random number and pick that cell
	selected_num = Math.floor(Math.random() * amount);
	selected_cell = unseen_cells[selected_num];

	// Get the letter and number of the selected cell
	letter = selected_cell.getAttribute("data-letter");
	number = selected_cell.innerText;

	// Mark that cell as seen
	selected_cell.classList.remove("cell_unseen");
	selected_cell.classList.add("cell_seen");

	// Show the selected number and add to see
	selected_ball = letter + " " + number;
	NUMBERS_CALLED.push(number);

	// Set the selected cell;
	setBingoBall(selected_ball);

	// Speak the number if setting says "Yes";
	speak = document.getElementById("speak_value").value;
	if ( speak == "Yes" )
	{
		speakText(selected_ball, selected_ball, 0.9, 0.6, 1000);
	}

	incrementLetterCount(letter);

	runAfterSpeaking(()=>{
		toggleGameBoardInput("pickNumberButton", "enable");
	});
	
}

// Increment how many numbers have been called for a letter
function incrementLetterCount(letter)
{
	current_count = letterCounts[letter]
	if(current_count != undefined)
	{
		letterCounts[letter] += 1
	}

	if (letterCounts[letter] == 15)
	{
		runAfterSpeaking(()=>{
			msg = "All numbers under the letter " + letter + " have been called.";
			speakText(msg, msg, 0.9, 0.6, 500);
		});
	}
}

// Ignore cells for certain games;
function ignoreCellsByGame(game)
{
	if(games_object[game].hasOwnProperty("ignore"))
	{
		let list = games_object[game]["ignore"];
		list.forEach(function(letter){
			ignoreCells(letter)
		});
	}
	else
	{
		resetCellsInelligible();
	}
}

// Helper to udpate the cells with a certain letter
function ignoreCells(letter)
{
	selector = "[data-letter^='" + letter + "']";

	list = Array.from(document.querySelectorAll(selector));

	if (list != undefined)
	{
		list.forEach(function(obj){
			obj.classList.remove("cell_unseen");
			obj.classList.add("inelligible");

		});	
	}
}

// Set the selected cell
function setBingoBall(value)
{
	let identifier = "selected_cell";
	let ballEle = document.getElementById("selected_cell");

	// Set the ball text
	ballEle.innerText = value;

	// Check if to set ball color
	if(value != "")
	{
		mydoc.addClass(`#${identifier}`, "bingo_ball_circle");
		setBingoBallColor(identifier,value);
	}
	else
	{
		mydoc.removeClass(`#${identifier}`, "bingo_ball_circle");
		setBingoBallColor(identifier,"");
	}
}

function setBingoBallColor(identifier, value)
{

	// Default: Always remove all of the colors
	mydoc.removeClass(`#${identifier}`, "bingo_ball_letter_b");
	mydoc.removeClass(`#${identifier}`, "bingo_ball_letter_i");
	mydoc.removeClass(`#${identifier}`, "bingo_ball_letter_n");
	mydoc.removeClass(`#${identifier}`, "bingo_ball_letter_g");
	mydoc.removeClass(`#${identifier}`, "bingo_ball_letter_o");

	// Then add the one for the current color (if applicable)
	let letter = value.split(" ")[0]?.toLowerCase() ?? "";
	if(letter != "")
	{
		mydoc.addClass(`#${identifier}`, `bingo_ball_letter_${letter}`);
	}
}


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

		// Reset the headers
		toggleBingoHeaders("remove");

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

//  Generic value for speaking text value
function speakText(text, subtext=undefined, rate=0.9, subrate=0.6, pause=2000)
{

	IS_SPEAKING = true; 

	let synth = window.speechSynthesis;
	
	// https://dev.to/asaoluelijah/text-to-speech-in-3-lines-of-javascript-b8h	
	var msg = new SpeechSynthesisUtterance();
	msg.rate = rate;
	msg.text = text;
	selectedVoice = getSelectedVoice()
	if(selectedVoice != undefined)
	{
		msg.voice = selectedVoice;
	}
	synth.speak(msg);

	if (subtext != undefined)
	{
		stillSpeaking = setInterval(function(){
			if(!synth.speaking)
			{
				clearInterval(stillSpeaking);
				//  Do the sub description 
				setTimeout(function(){
					// msg.text = subtext;
					// msg.rate = subrate;
					speakText(subtext,undefined,subrate)
					// synth.speak(msg);
				}, pause);
			}
		}, 500);
	}
	else
	{
		let waitTilFinishSpeaking = setInterval(()=>{
			if(!synth.speaking)
			{
				IS_SPEAKING = false;
				clearInterval(waitTilFinishSpeaking);
			}
		},500);
	}
}

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

