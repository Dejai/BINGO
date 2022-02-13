
/************************ GLOBAL VARIABLES ****************************************/
var synth = window.speechSynthesis;
var voicesMap = {};
var letterCounts = {"B":0, "I":0, "N":0, "G":0,"O":0 };

var CURR_GAME = "";
var GAME_STARTED = false;
var IS_BOARD_PAGE = true;
/*********************** GETTING STARTED *****************************/

// Once doc is ready
mydoc.ready(function(){

	let isExamplePage = location.pathname.includes("/cardexamples")
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
		alert
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
	

	// if(location.pathname.includes("/cardexamples"))
	// {
	// 	console.log("CARD EXAMPLES");

		
	// }
	// else
	// {
		
	// }
		

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
				if(!GAME_STARTED)
				{
					onStartGame();
				}
				else
				{
					pickNumber();
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
	console.log(IS_BOARD_PAGE);
	options = document.getElementById("gameOptions")
	options.addEventListener("change", function(event){
		ele = event.target;
		CURR_GAME = ele.value;
		onLoadGameExample(ele.value);
		ignoreCellsByGame(ele.value);

		if(IS_BOARD_PAGE)
		{
			onDescribeGame(ele.value, true);
		}
		
	});
}

function listenerOnSpeakVoiceDemo()
{

	let voiceSelect = document.getElementById("voiceSelect");
	// ele = event.target; 
	value = voiceSelect.value;
	option  = voiceSelect.querySelector("option[data-name='"+value+"']");
	if (option != undefined)
	{
		name = option.getAttribute("data-name");
		// https://dev.to/asaoluelijah/text-to-speech-in-3-lines-of-javascript-b8h
		text = "Hello. My name is " + name + ". And this is how I would call a number:"
		subtext = "I 20";
		speakText(text, subtext, 0.9, 0.6, 500);
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
			toggleExampleTableBody("show");

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
			toggleExampleTableBody("show");
			onLoadGameExampleTable(game_table);
		}
		else 
		{
			toggleExampleTableBody("hide");
		}
	} 
}

// Toggle the game example table body
function toggleExampleTableBody(state)
{
	if(state == "show")
	{
		mydoc.hideContent("#game_table_body");
		mydoc.showContent("#game_example_table_body");
	}
	else
	{
		mydoc.showContent("#game_table_body");
		mydoc.hideContent("#game_example_table_body");
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

function onShowGameExampleAgain()
{
	value = document.getElementById("gameOptions").value;
	onLoadGameExample(ele.value);
	ignoreCellsByGame(ele.value);
	onDescribeGame(ele.value);
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

function toggleExample()
{
	let example = document.getElementById("game_example_block");

	example.classList.add("hidden");
}


/************************ GAME BOARD ACTIONS *******************************/

function onStartGame()
{
	if(CURR_GAME == "")
	{
		alert("Please select a game first!");
		return;
	}

	// Hide/Show things
	mydoc.hideContent("#startGameButton");
	toggleExampleTableBody("hide");
	mydoc.showContent("#pickNumberButton");
	
	// document.getElementById("startGameButton").classList.add("hidden");
	// document.getElementById("pickNumberButton").classList.remove("hidden");
	speakText("Let the Game Begin");
	GAME_STARTED = true;
}

// Pick a random number from the board; Only from unseen
function pickNumber()
{

	if(!GAME_STARTED)
	{
		alert("Please select a game first!");
		return;
	}

	// Make sure the example is hidden
	toggleExampleTableBody("hide");

	// Disable picker temporarily 
	let pickNumButton = document.getElementById("pickNumberButton");

	if (pickNumButton.disabled)
	{
		return;
	}

	// Disable the button on click
	pickNumButton.disabled = true;

	unseen_cells = document.getElementsByClassName("cell_unseen");
	amount = unseen_cells.length;

	selected_num = Math.floor(Math.random() * amount);
	selected_cell = unseen_cells[selected_num];

	letter = selected_cell.getAttribute("data-letter");
	number = selected_cell.innerText;

	selected_cell.classList.remove("cell_unseen");
	selected_cell.classList.add("cell_seen");

	selected_ball = letter + " " + number;

	// Set the selected cell;
	setSelectedCell(selected_ball);

	// Speak the number if setting says "Yes";
	speak = document.getElementById("speak_value").value;
	if (speak == "Yes" )
	{
		speakText(selected_ball, selected_ball, 0.9, 0.6, 1000);
	}

	setTimeout(function(){
		pickNumButton.disabled = false;
	}, 5000);

	incrementLetterCount(letter);
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
		setTimeout(function(){
			msg = "All numbers under the letter " + letter + " have been called.";
			speakText(msg, msg, 0.9, 0.6, 500);
		}, 5000);
		
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
function setSelectedCell(value)
{
	document.getElementById("selected_cell").innerText = value;
}

// Reset the entire board (including reseting unseen cells)
function resetBoard()
{
	confirm_reset = confirm("Are you sure you want to reset the board?")

	if(confirm_reset)
	{
		// Reset the letter counts;
		letterCounts = {"B":0, "I":0, "N":0, "G":0,"O":0 };

		// Reset selected cell;
		setSelectedCell("");

		// Reset cells;
		resetCellsUnseen();
		resetCellsInelligible();

		// Reset the selected game
		document.getElementById("gameOptions").value = "";
		CURR_GAME = "";

		// Reset GAME_STARTED
		GAME_STARTED = false;

		// Reset buttons
		document.getElementById("startGameButton").classList.remove("hidden");
		document.getElementById("pickNumberButton").classList.add("hidden");

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
				console.log("Done Speaking");
				clearInterval(stillSpeaking);
				//  Do the sub description 
				setTimeout(function(){
					msg.text = subtext;
					msg.rate = subrate;
					synth.speak(msg);
				}, pause);
			}
		}, 500);
	}
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

