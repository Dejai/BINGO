
/************************ GLOBAL VARIABLES ****************************************/
var GAME_BOARD_CELLS = [];
var CURR_GAME = "";
var IS_CARD_SET = false;
var IS_BINGO = false;
var IS_RANDOM_CARD = false;
var IS_CUSTOM_CARD = false;
var TYPE_OF_CARD = "";

// List IDs for Trello
var LIST_IDS = {};

var CARDS = {};

var touchEvent = "ontouchstart" in window ? "touchstart" : "click";


/*********************** GETTING STARTED *****************************/

    // Once doc is ready
    mydoc.ready(()=>{

        // Set Trello board name
    	MyTrello.SetBoardName("bingo");

        if(location.pathname.includes("load"))
        {
            TYPE_OF_CARD = "NAMED";
            getListID(TYPE_OF_CARD);

            // Load the saved cards
            loadSavedCards("", (card)=>{
                createCardObject(card);
            });

        }
        else if (location.pathname.includes("/random"))
        {
            IS_RANDOM_CARD = true;
            TYPE_OF_CARD = "RANDOM";

            // Generate an initial random card;
            onRandomCard();
            getListID(TYPE_OF_CARD);

        }
        else if (location.pathname.includes("/build"))
        {
            IS_CUSTOM_CARD = true;
            TYPE_OF_CARD = "CUSTOM";

            // Generate the values for creating a custom card
            loadBuildCardTable();
            getListID(TYPE_OF_CARD);

        }
        else if (location.pathname.includes("create_batch"))
        {
            TYPE_OF_CARD = "NAMED";
            getListID(TYPE_OF_CARD);

        }
        else if(location.pathname.includes("/card"))
        {
            // Make sure the page doesn't close once the game starts
            // window.addEventListener("beforeunload", onClosePage);

            let cardID = mydoc.get_query_param("cardid")
            if(cardID != undefined)
            {
                // Load the game options
                loadGameOptions();

                // Load the card based on Trello
                loadTrelloCard(cardID);
            }
            else
            {
                alert("Invalid Card ID!");
            }           
        }
    });

    // Add the listener for the cells
    function addNumberListener()
    {
        let cells = document.querySelectorAll(".number_cell");
        
        cells.forEach( (obj)=>{
            obj.addEventListener(touchEvent, onSelectNumber);
        });
    }

    // Generate the numbers for the card
    function generateRandomNumbers(letter, isEmptyCard=false)
    {
        // Using 'bingo_letters' from bingo_objects.js
        let min = bingo_letters[letter][0];
        let max = bingo_letters[letter][1];
        let numbers = [];

        // Get 5 random numbers (not repeated);
        while(numbers.length < 5)
        {
            rand = randomIntFromInterval(min,max);
            if (numbers.includes(rand)) continue;

            if(numbers.length == 2 && letter == "N")
            {
                // numbers.push(`<span class='freeSpace number_cell'><i class="number_cell fa fa-star-o"></i></span>`);
                numbers.push("FS");
            }
            else if(isEmptyCard)
            {
                numbers.push("*");
            }
            else
            {
                numbers.push(rand);
            }
        }

        return numbers;
    }

    // Generate the card
    function createCardTable(b,i,n,g,o)
    {
        let cardHtml = "";

        for(var idx = 0; idx < 5; idx ++)
        {
            if (idx == 2 && n[idx] == "FS")
            {
                n[idx] = getFreeSpaceIcon();   
            }

            let row = `<tr class="bingo_row">
                            <td class="number_cell number_cell_b">${b[idx]}</td>
                            <td class="number_cell number_cell_i"j>${i[idx]}</td>
                            <td class="number_cell number_cell_n">${n[idx]}</td>
                            <td class="number_cell number_cell_g">${g[idx]}</td>
                            <td class="number_cell number_cell_o">${o[idx]}</td>
                        </tr>
                        `
            cardHtml += row;
        }

        // Add content to page and show header
        document.getElementById("bingo_card_body").innerHTML = cardHtml;
        document.getElementById("bingo_card_head").classList.remove("hidden");

        // If this is the card to play with, set the listeners and map things;
        if(IS_CARD_SET)
        {
            // Set the datetime of the card being created
            let time = Helper.getDate("H:m:s K");
            document.getElementById("card_created_timestamp").innerText = time;

            // Add listener after adding content
            addNumberListener();

            // Map the number cells 
            mapNumberCells();
        }
    }

    // Maps each number cell to a 2D array; Easy of checking and updating each cell;
    function mapNumberCells()
    {  
        document.querySelectorAll(".bingo_row")?.forEach( (row) =>{
            rowList = [];

            row.querySelectorAll("td").forEach( (cell) =>{
                rowList.push(cell);
            });
            // Push the cell into the global storage
            GAME_BOARD_CELLS.push(rowList);
        });
        console.log(GAME_BOARD_CELLS);
    }

/*********************** TRELLO CALLS *****************************/

    // Get the list ID based on type of card
    function getListID(type)
    {
        let typeName = type.toUpperCase();
        let listName = `${typeName}_CARDS`;

        MyTrello.get_list_by_name(listName, (listData)=>{
            let list = myajax.GetJSON(listData.responseText);
            if(list.length == 1)
            {
                LIST_IDS[type] = list[0].id
            }
        });
    }

    // Get the trello card and then set the card data
    function loadTrelloCard(cardID)
    {
        // Load the card numbers;
        MyTrello.get_single_card(cardID, (cardData)=>{

            let card = myajax.GetJSON(cardData.responseText);
            console.log(card);

            let nameValues = card["name"].split(" - ");
            let cardCode = nameValues[nameValues.length-1];
            mydoc.loadContent(cardCode, "cardName");

            let desc = card["desc"].split("\n");
            let map = {}
            desc.forEach( (val)=>{
                let splits = val.split("=");
                let letter = splits[0];
                let values = splits[1].split(",")
                map[letter] = values;
            });
            onSetCard(map);
        });

    }

    // Create a trello card
    function createTrelloCard(cardName, content, successCallback)
    {
        let listID = LIST_IDS[TYPE_OF_CARD];
        console.log(`Creating card ${cardName} on list ${listID}`);
        let encodedName = encodeURIComponent(cardName);

        if(listID != undefined)
        {
            MyTrello.create_card(listID, encodedName,(newCardData)=>{

                console.log(newCardData);
                let newCard = myajax.GetJSON(newCardData.responseText);
                let newCardID = newCard?.id ?? undefined;
    
                if(newCardID != undefined)
                {
                    MyTrello.update_card_description(newCardID, content, (data)=>{
                        console.log("CARD UPDATED");
                        if(successCallback != undefined)
                        {
                            successCallback(newCardID);
                        }
                    });
                }
            });
        }
    }


/*********************** EVENT LISTENERS *****************************/
     
    // Prevent the page accidentally closing
    function onClosePage(event)
    {
        event.preventDefault();
        event.returnValue='';
    }

    // Create a batch of cards
    function onCreateCardsBatch()
    {
        let ele = document.getElementById("card_input_text_area");
        let value = ele?.value;
        let cards = value.split("\n");

        // Loop through the cards
        cards.forEach( (card)=>{

            if(card != "")
            {
                let cardInfo = card.split("/");

                let givenCardName = cardInfo[0].trim() ?? "NAME NOT GIVEN";
                let numbers = cardInfo[1]?.trim().split(" ") ?? [];

                // Ensure it is only 24 (no free space yet)
                if(numbers.length == 24)
                {
                    // Add the FS symbol at 
                    numbers.splice(12,0,"FS");

                    b = "b=" + numbers.slice(0,5).join(",")
                    i = "i=" + numbers.slice(5,10).join(",")
                    n = "n=" + numbers.slice(10,15).join(",")
                    g = "g=" + numbers.slice(15,20).join(",")
                    o = "o=" + numbers.slice(20,25).join(",")

                    let content = [b,i,n,g,o].join("\n");
                    content = encodeURI(content);

                    let gameCode = Helper.getCode();
                    let cardName = `${givenCardName} - ${gameCode}`
                    console.log("Creating a card = " + cardName);

                    createTrelloCard(cardName, content);
                }
            }
        });
    }

    // Validate and use a card
    function onEditCard()
    {
        letters = Object.keys(bingo_letters);

        card_values = getCardValues();
        b = card_values["b"].join(",");
        i = card_values["i"].join(",");
        n = card_values["n"].join(",");
        g = card_values["g"].join(",");
        o = card_values["o"].join(",");

        let newPath = `./build.html?b=${b}&i=${i}&n=${n}&g=${g}&o=${o}`
        onNavigate(newPath,"Are you sure you want to edit this Card?");
    }

    // Creating a new card
    function onNewCard()
    {
        onNavigate("./", "Are you sure you want to leave this Card?");
    }

    // Generate a RANDOM cad
    function onRandomCard()
    {
        let b = generateRandomNumbers("B");
        let i = generateRandomNumbers("I");
        let n = generateRandomNumbers("N");
        let g = generateRandomNumbers("G");
        let o = generateRandomNumbers("O");

        // Create the card table
        createCardTable(b,i,n,g,o);

    }

    // Set the card to play with; Pass in a mapping of letter to array of letters
    function onSetCard(map)
    {
        // The card is set;
        IS_CARD_SET = true;

        b = map["b"];
        i = map["i"];
        n = map["n"];
        g = map["g"];
        o = map["o"];

        createCardTable(b,i,n,g,o);
    }

    // Validate and use a card
    function onUseCard()
    {
        letters = Object.keys(bingo_letters);

        valid_card = true;

        card_values = getCardValues();

        keys = Object.keys(card_values);

        for(var idx = 0; idx < keys.length; idx++)
        {
            letter = keys[idx];
            upper = letter.toUpperCase();
            values = card_values[letter];

            if(values.length != 5)
            {
                let errMessage = `ERROR:<br/>Cannot have duplicate values for letter: ${upper}`;
                MyNotification.notify("#build_card_instructions",errMessage, "notify_red");
                valid_card = false;
                break;
            }
        }

        if(valid_card)
        {
            b = "b=" + card_values["b"].join(",");
            i = "i=" + card_values["i"].join(",");
            n = "n=" + card_values["n"].join(",");
            g = "g=" + card_values["g"].join(",");
            o = "o=" + card_values["o"].join(",");

            let content = [b,i,n,g,o].join("\n");
            content = encodeURI(content);

            let gameCode = Helper.getCode();
            let cardName = `${TYPE_OF_CARD} - ${gameCode}`

            createTrelloCard(cardName, content, (newCardID)=>{
                location.href = `./card.html?cardid=${newCardID}`
            });
            
            // location.href = `/card.html?b=${b}&i=${i}&n=${n}&g=${g}&o=${o}`;
        }
    }

    // Navigate to a new page; With or without confirmation
    function onNavigate(url,message=undefined)
    {
        let canProceed = (message != undefined) ? confirm(message) : true;
        if(canProceed)
        {
            location.href = url;
        }
    }


/*********************** DOM: Update Page *****************************/

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


        mydoc.loadContent(options, "gameOptionsOnCard");
    }

    // Setup the select statements for creating a card;
    function loadBuildCardTable()
    {
        // Add the free space icon
        document.querySelector(".build_card_free").innerHTML = getFreeSpaceIcon();

        // Add the select options
        letters = Object.keys(bingo_letters);
        
        letters.forEach( (letter)=>{

            lowerCase = letter.toLowerCase();

            document.querySelectorAll(`.build_card_${lowerCase}`).forEach( (select)=> {
                range = bingo_letters[letter];
                lower = range[0];
                upper = range[1]+1;
                for(var idx = lower; idx < upper; idx++)
                {
                    select.innerHTML += `<option value="${idx}">${idx}</option>`;
                }
            });
        });

        // If numbers were provided, then set those values
        if(hasBingoParams())
        {
            b = mydoc.get_query_param("b").split(",");
            i = mydoc.get_query_param("i").split(",");
            n = mydoc.get_query_param("n").split(",");
            g = mydoc.get_query_param("g").split(",");
            o = mydoc.get_query_param("o").split(",");

            for(var idx = 0; idx < 5; idx ++)
            {

                if (idx == 2)
                {
                    Array.from(document.querySelectorAll(".build_card_b"))[idx].value = b[idx];
                    Array.from(document.querySelectorAll(".build_card_i"))[idx].value = i[idx];
                    Array.from(document.querySelectorAll(".build_card_g"))[idx].value = g[idx];
                    Array.from(document.querySelectorAll(".build_card_o"))[idx].value = o[idx];
                }
                else if (idx > 2)
                {
                    Array.from(document.querySelectorAll(".build_card_b"))[idx].value = b[idx];
                    Array.from(document.querySelectorAll(".build_card_i"))[idx].value = i[idx];
                    Array.from(document.querySelectorAll(".build_card_n"))[idx-1].value = n[idx];
                    Array.from(document.querySelectorAll(".build_card_g"))[idx].value = g[idx];
                    Array.from(document.querySelectorAll(".build_card_o"))[idx].value = o[idx];
                }
                else
                {
                    Array.from(document.querySelectorAll(".build_card_b"))[idx].value = b[idx];
                    Array.from(document.querySelectorAll(".build_card_i"))[idx].value = i[idx];
                    Array.from(document.querySelectorAll(".build_card_n"))[idx].value = n[idx];
                    Array.from(document.querySelectorAll(".build_card_g"))[idx].value = g[idx];
                    Array.from(document.querySelectorAll(".build_card_o"))[idx].value = o[idx];
                }
            }
        }
    }

    // Select a value
    function onSelectNumber(event)
    {

        if(CURR_GAME == "")
        {
            alert("Please select the game being played.");
            return;
        }

        let target = event.target;
        let className = "number_selected"
        let closest = target.closest("td.number_cell");
        let isSelected = closest.classList.contains(className);


        if(isSelected)
        {
            closest.classList.remove(className);
        }
        else
        {
            closest.classList.add(className);
        }

        // Always check for BINGO after changing the selected cells
        checkForBingo();
    }

    // Indicate which ones are needed
    function onSelectGame()
    {
        // Always clear first when changing games;
        onClearNeededCells();

        CURR_GAME = document.getElementById("gameOptionsOnCard").value
        if(CURR_GAME != "" )
        {

            // Toggle the view of the buttons
            toggleEditAndClearButtons("clear");
            
            // Show cost for every game;
            let cost = games_object[CURR_GAME]["cost"];
            mydoc.loadContent(`Cost: ${cost}`,"game_cost");

            onShowNeededCells(CURR_GAME);
            // if (CURR_GAME == "Straight Line")
            // { 
            //     examples = getStraightLinExamples();
            //     idx = 0;
            //     let straightLineInterval = setInterval( ()=>{

            //         hightlightNeededCells(examples[idx]);	
            //         idx+=1 
            //         setTimeout( ()=>{
            //             onClearNeededCells() // clear the needed cells; so folks don't think only one option is acceptable
            //         },300);

            //         if(idx == examples.length)
            //         {
            //             clearInterval(straightLineInterval);
            //         }
            //     }, 500);
            // }
            // else
            // {
            //     let expected = games_object[CURR_GAME]["example"];
            //     hightlightNeededCells(expected);
            // }            
        }
    }

    // Helper for showing what is needed
    function onShowNeededCells(currentGame)
    {
        if (currentGame == "Straight Line")
        { 
            examples = getStraightLinExamples();
            idx = 0;
            let straightLineInterval = setInterval( ()=>{

                hightlightNeededCells(examples[idx]);	
                idx+=1 
                setTimeout( ()=>{
                    onClearNeededCells() // clear the needed cells; so folks don't think only one option is acceptable
                },300);

                if(idx == examples.length)
                {
                    clearInterval(straightLineInterval);
                }
            }, 500);
        }
        else
        {
            let expected = games_object[CURR_GAME]["example"];
            hightlightNeededCells(expected);
        } 
    }

    // Highlight the cells needed
    function hightlightNeededCells(table)
    {
        for(var rowIdx = 0; rowIdx < 5; rowIdx ++)
        {
            for(var colIdx = 0; colIdx < 5; colIdx++ )
            {
                needed = table[rowIdx][colIdx];
                if(needed == 1 || needed == 8)
                {
                    GAME_BOARD_CELLS[rowIdx][colIdx].classList.add("number_cell_needed");
                }
            }
        }
    }
    
    // Clear the card
    function onClearCard()
    {
        let proceed = (IS_BINGO) ? true : confirm("Are you sure you want to clear the card?");
        if(proceed)
        {

            document.querySelectorAll(".number_cell").forEach( (obj) =>{
                obj.classList.remove("number_selected");
                // obj.classList.remove("bingo_blink");
            });

            toggleBingoHeaders("remove");

            // Clear needed cells;
            onClearNeededCells();

            // Reset selected game
            CURR_GAME = "";
            document.getElementById("gameOptionsOnCard").value = "";
            mydoc.loadContent("","game_cost");

            // Show the edit button
            toggleEditAndClearButtons("edit");
        }
    }

    // Toggle the blinking headers


    // Clear the "needed" cells
    function onClearNeededCells()
    {
        document.querySelectorAll(".number_cell").forEach( (obj) =>{
            obj.classList.remove("number_cell_needed");
        });
    }

    // Toggle between the Edit and Clear buttons on the actual card
    function toggleEditAndClearButtons(view)
    {
        if(view == "edit")
        {
            // Show the Edit button and hide Clear button
            mydoc.showContent("#edit_card_button");
            mydoc.hideContent("#clear_card_button");
        }
        else
        {
            // Show the Clear Button and hide the Edit button
            mydoc.showContent("#clear_card_button");
            mydoc.hideContent("#edit_card_button");
        }
        
    }



/*********************** HELPERS *****************************/

    // Check if the current card has achieved BINGO!
    function checkForBingo()
    {
        if(CURR_GAME == "Straight Line")
        {
            IS_BINGO = checkForBingo_StraightLine();
        }
        else
        {
            let expected = games_object[CURR_GAME]["example"];
            let theBoard = getBoardState();
            IS_BINGO = (expected.toString() == theBoard.toString());
        }

        // Alert if we have acheived BINGO
        let state = (IS_BINGO) ? "show" : "";
        toggleBingoHeaders(state);
    }

    // Check specifically for any straight line
    function checkForBingo_StraightLine()
    {
        let expectedStraight = "11111";
        let hasStraightLine = false;

        // Check diagonal first;
        diagLeftString = "";
        diagRightString = "";

        for(var idx = 0; idx < 5; idx++)
        {
            left = idx;
            right = (5-idx)-1;

            // Starting top-left down;
            leftCell = GAME_BOARD_CELLS[idx][left];
            diagLeftString  += leftCell.classList.contains("number_selected") ? "1" : "0";
            if(diagLeftString == expectedStraight)
            {
                hasStraightLine = true;
                break;
            }

            // Starting top-right down;
            rightCell = GAME_BOARD_CELLS[idx][right];
            diagRightString += rightCell.classList.contains("number_selected") ? "1" : "0";
            if(diagRightString == expectedStraight)
            {
                hasStraightLine = true;
                break;
            }

            // Check the row
            row = GAME_BOARD_CELLS[idx];
            rowString = "";
            row.forEach( (cell) => {
                rowString += cell.classList.contains("number_selected") ? "1" : "0";
            });
            if (rowString == expectedStraight)
            {
                hasStraightLine = true;
                break;
            }
            
            // Check the column
            colString = "";
            GAME_BOARD_CELLS.forEach( (row) =>{
                cell = row[idx];
                colString += cell.classList.contains("number_selected") ? "1" : "0"
            });
            if (colString == expectedStraight)
            {
                hasStraightLine = true;
                break;
            }
        }
        
        return hasStraightLine;
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

    // Gets the state of the board -- represented as a
    function getBoardState()
    {
        let state = [];
        
        document.querySelectorAll(".bingo_row")?.forEach( (row) =>{

            rowList = [];

            row.querySelectorAll("td").forEach( (cell) =>{

                isFreeSpace = (cell.querySelectorAll(".freeSpace")?.length >= 1) ? 1 : 0;
                isSelected = cell.classList.contains("number_selected") ? 1 : 0

                combo = `${isFreeSpace}${isSelected}`
                digit = 0;
                switch(combo)
                {
                    case "01": // not free space, not selected
                        digit = 1;
                        break;
                    case "10": // free space, not selected
                        digit = 3;
                        break;
                    case "11": // free space and selected
                        digit = 8;
                        break;
                    default:
                        digit = 0;
                }
                rowList.push(digit);
            });

            // Push the row into the state;
            state.push(rowList);
        });

        return state;
    }

    // Get the values from the cells
    function getCardValues()
    {
        valuesByLetter = {"b":[],"i":[],"n":[],"g":[],"o":[]};

        letters = Object.keys(bingo_letters);

        letters.forEach( (letter) => {

            lower = letter.toLowerCase();

            document.querySelectorAll(`.number_cell_${lower}`).forEach( (cell)=> {

                value = "";

                // Set the value based on type of card;
                if(IS_CUSTOM_CARD)
                {
                    value = cell.classList.contains("build_card_free") ? "FS" : cell.querySelector("select").value;
                }
                else if (IS_RANDOM_CARD || IS_CARD_SET)
                {   
                    value = cell.innerText == "" ? "FS" : cell.innerText;
                }

                // Append value if not already there;
                if(!valuesByLetter[lower].includes(value))
                {
                    valuesByLetter[lower].push(value);
                }

            });
        });

        return valuesByLetter;
    }

    // Get the icon to use for the free space
    function getFreeSpaceIcon()
    {
        return `<span class='freeSpace number_cell'><i class="number_cell fa fa-star-o"></i></span>`;
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

    // Check if all params are set
    function hasBingoParams()
    {
        all_set = true;
        letters = Object.keys(bingo_letters);

        letters.forEach( (letter)=> {

            lower = letter.toLowerCase();
            param = mydoc.get_query_param(lower);
            if(!all_set || (param == undefined))
            {
                all_set = false;
            }
        });

        return all_set;
    }


    // Get a random int based on interval
    // https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript 
    // min and max included 
    function randomIntFromInterval(min, max) 
    { 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    // Select the text in an element
    // https://stackoverflow.com/questions/1173194/select-all-div-text-with-single-mouse-click
    function selectText(element)
    {
        if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(element);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    }

