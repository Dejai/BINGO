
/************************ GLOBAL VARIABLES ****************************************/
var CURR_GAME = "";
var IS_BINGO = false;

// Card map
var CARDS = {};

var touchEvent = "ontouchstart" in window ? "touchstart" : "click";

/*********************** GETTING STARTED *****************************/

    // Once doc is ready
    mydoc.ready(()=>{

        // Set Trello board name
    	MyTrello.SetBoardName("bingo");

        // Load the game options
        loadGameOptions();
        let cardsList = mydoc.get_query_param("cardlist");
        loadTrelloCard(cardsList);
       
    });

    // Add the listener for the cells
    function addNumberListener()
    {
        let cells = document.querySelectorAll(".number_cell");
        
        cells.forEach( (obj)=>{
            obj.addEventListener(touchEvent, onSelectNumber);
        });
    }

/*********************** TRELLO CALLS *****************************/
    
    // Get the trello card and then set the card data
    async function loadTrelloCard(cardList)
    {

        let cards = cardList.split(",");

        let cardsAdded = [];

        for(var idx in cards)
        {
            let cardID = cards[idx];

            // If we already processed this card ID .. move on;
            if(cardsAdded.includes(cardID))
                continue;

            // Get the card from Trello;
            let cardData = await CardPromises.getCard(cardID);

            
            if (cardData != undefined)
            {
                // Get a card formatted as an objectobject;
                let cardObject = CardManager.getCardObject(cardData);

                // Then load the card where it ought to go
                await CardManager.loadCard("play", "#cardBlockSection", cardObject, true);

                // Indicate taht we added this card
                cardsAdded.push(cardID);
            }
        }
        addNumberListener();
    }

/*********************** EVENT LISTENERS *****************************/
     
    // Prevent the page accidentally closing
    function onClosePage(event)
    {
        event.preventDefault();
        event.returnValue='';
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


    // Set/unset all instances of a number
    function selectAllInstanceOfNumber(className, numberValue)
    {

        // Class to show as selected/not-selected
        let selectedClassName = "number_selected";

        document.querySelectorAll(className)?.forEach( (cell) =>{

            let allowSelect = (CURR_GAME == "Straight Line") || cell.classList.contains("number_cell_needed")
            if( allowSelect && cell.innerText == numberValue)
            {
                var _action = !cell.classList.contains(selectedClassName) ? cell.classList.add(selectedClassName) :
                                cell.classList.remove(selectedClassName)
            }
        });
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
        let closest = target.closest("td.number_cell");
        let letterClass = Array.from(closest.classList).filter( (c) => { return c.includes("number_cell_"); } );
        let numberValue = closest.innerText;

        // Allows me to set/unset all instances of a number
        selectAllInstanceOfNumber(`.${letterClass}`, numberValue);

        // Always check for BINGO after changing the selected cells
        checkForBingo();
    }



    // Indicate which ones are needed
    function onSelectGame()
    {
        // Always clear first when changing games;
        CardManager.clearNeededCells();

        // Get teh current selected game
        CURR_GAME = mydoc.getContent("#gameOptionsOnCard")?.value ?? "";

        if(CURR_GAME != "" )
        {
            // Toggle the view of the buttons
            toggleEditAndClearButtons("clear");

            // Show the needed cells
            CardManager.setNeededCellsByGame(CURR_GAME);     
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

            let cards = document.querySelectorAll("div.cardBlock table.bingo_card_table");

            cards.forEach( (card) => {
                CardManager.toggleBingoHeaders(card, "remove");
            });

            // Clear needed cells;
            CardManager.clearNeededCells();

            // Reset selected game
            CURR_GAME = "";
            document.getElementById("gameOptionsOnCard").value = "";

            // Show the edit button
            toggleEditAndClearButtons("edit");
        }
    }

    // Toggle between the Edit and Clear buttons on the actual card
    function toggleEditAndClearButtons(view)
    {
        if(view == "edit")
        {
            // Show the Edit button and hide Clear button
            mydoc.showContent("#newCardButton");
            mydoc.hideContent("#clearCardButton");
        }
        else
        {
            // Show the Clear Button and hide the Edit button
            mydoc.showContent("#clearCardButton");
            mydoc.hideContent("#newCardButton");
        }
        
    }



/*********************** HELPERS *****************************/

    // Check if the current card has achieved BINGO!
    function checkForBingo()
    {
        let cards = document.querySelectorAll("div.cardBlock table.bingo_card_table");
        cards.forEach( (card) => {
            CardManager.checkForBingo(CURR_GAME, card);
        });
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

