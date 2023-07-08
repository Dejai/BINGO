
/************************ GLOBAL VARIABLES ****************************************/

// Variables related to the "touch" event
var touchEvent = "ontouchstart" in window ? "touchstart" : "click";
var touchtime = 0; // Used to keep track of times between clicks (to hack a double click);

// The BINGO Board that will be used for managing key parts of this page
const bingoBoard = new BingoBoard();

/*********************** GETTING STARTED *****************************/

    // Once doc is ready
    mydoc.ready( async ()=>{

        // Set Trello board name
    	MyTrello.SetBoardName("bingo");

        // Set the board with the game options
        bingoBoard.setCards(BingoGames, true);

        // Load the game options
        var options = bingoBoard.getGameOptions();
        mydoc.setContent("#gameOptionsOnCard", {"innerHTML":options});

        // Get the cards for this page
        var trelloCards = await getTrelloCards( mydoc.get_query_param("cardlist"));
        bingoBoard.setCards(trelloCards);

        // Set the play cards on this page
        var playCards = bingoBoard.getPlayCards();
        for(var idx in playCards){
            var card = playCards[idx];
            console.log(card);
            var templates = await card.getTemplates();
            var template = templates?.[0];
            mydoc.setContent("#cardBlockSection", {"innerHTML":template}, true);
        }

        // Show 'Add Card' button once cards loaded
        if(playCards.length > 0){
            mydoc.setContent("#changeCardButton", {"innerText": "CHANGE CARDS"});
        }
        mydoc.showContent("#changeCardButton");

        // Add listener for number selection
        let cells = document.querySelectorAll(".number_cell");
        cells.forEach( (obj)=>{
            obj.addEventListener(touchEvent, onSelectNumber);
        });

        // Set the datetime of the card being created
        let time = Helper.getDate("H:m:s K");
        document.getElementById("card_created_timestamp").innerText = time;       
    });

/*********************** TRELLO CALLS *****************************/
    
    // Get the trello card and then set the card data
    async function getTrelloCards(cardIDs)
    {
        let uniqueCards = Array.from(new Set(cardIDs.split(",")) );
        let trelloCards = [];  

        for(var idx in uniqueCards)
        {
            var cardID = uniqueCards[idx];

            // Get the card from Trello;
            let cardData = await CardManager.getCard(cardID);

            // Add card to the list
            trelloCards.push(cardData);
        }
        return trelloCards;
    }

/*********************** EVENT LISTENERS *****************************/

    // Check if a click is a "double click"
    function isDoubleClick(){
        // Assume it is a double click by default
        var isDblClick = true; 

        // Check the time between clicks
        var thisTime = (new Date().getTime() );
        if(touchtime == 0 || (thisTime - touchtime) > 800){
            isDblClick = false;
            touchtime = new Date().getTime();
            // touchattempts++;    
        }
        return isDblClick; 
    }

    // Indicate which ones are needed
    function onSelectGame()
    {
        var name = mydoc.getContent("#gameOptionsOnCard")?.value ?? ""
        bingoBoard.setGameName(name);

        // Hide the warning;
        mydoc.hideContent(".hideOnGameSelect");

        // Always clear first when changing games;
        CardManager.clearNeededCells();

        // Loop through required slots & show them;
        var requiredSlots = bingoBoard.getRequiredSlots() ?? [[]];
        console.log(requiredSlots);
        console.log(requiredSlots[0]);

        if(requiredSlots.length > 1){
            CardManager.setNeededCells(requiredSlots[0]);
            var idx = 1;
            let reqSlotsInterval = setInterval(() => {
                if(idx < requiredSlots.length){
                    CardManager.clearNeededCells();
                    CardManager.setNeededCells(requiredSlots[idx]);
                    idx++;
                } else {
                    clearInterval(reqSlotsInterval);
                    CardManager.clearNeededCells();
                }       
            }, 700);
        } else {
            CardManager.setNeededCells(requiredSlots[0]);
        }

        // Show the buttons to clear
        mydoc.showContent("#clearCardButton");
    }
    
    // Select a value
    function onSelectNumber(event)
    {
        // Clear touch attempts if successfully double clicked;
        // Check if this is a double clieck
        if( !isDoubleClick()) {
            return;
        }
        console.log("Double click!");

        // Check for game before moving on.
        if(bingoBoard.getGameName() == "") {
            mydoc.hideContent(".hideOnGameWarning");
            mydoc.showContent("#selectGameWarning");
            window.scrollTo(0,0);
            return;
        }

        // Get the target of the game change; 
        let target = event.target;
        let closest = target.closest("td.number_cell");
        if(closest != undefined) {

            // Hide things
            mydoc.hideContent(".hideOnSelect");
        
            // Lock the game selector
            mydoc.setContent("#gameOptionsOnCard", {"disabled":"true"});

            let letterClass = Array.from(closest.classList).filter( (c) => { return c.includes("number_cell_"); } );
            let numberValue = closest.innerText;
            
            // Class to show as selected/not-selected
            let selectedClassName = "number_selected";

            // Find all cases of this class & set/unset it
            document.querySelectorAll(`.${letterClass}`)?.forEach( (cell) =>{
    
                let allowSelect = (bingoBoard.getGameName() == "Straight Line") || cell.classList.contains("number_cell_needed")
                if( allowSelect && cell.innerText == numberValue)
                {
                    var action = (!cell.classList.contains(selectedClassName)) ? "select" : "deselect";
                    if(action == "select"){
                        cell.classList.add(selectedClassName);
                        bingoBoard.addNumber(numberValue);
                    } else {
                        cell.classList.remove(selectedClassName);
                        bingoBoard.removeNumber(numberValue);
                    }
                }
            });

            // Always check for BINGO after changing the selected cells
            onCheckForBingo();
        }
    }

    // Clear the card
    function onClearCard()
    {
        let numBingoCards = document.querySelectorAll(".IS-BINGO")?.length;
        let proceed = (numBingoCards > 0) ? true : confirm("Are you sure you want to clear the card?");
        if(proceed)
        {
            // Set new game on the Board
            bingoBoard.newGame();

            // Clear things via manager;
            onShowAllCards();
            CardManager.clearNeededCells();

            // Unlock the selector
            mydoc.setContent("#gameOptionsOnCard", {"disabled":""});
            mydoc.setContent("#gameOptionsOnCard", {"value":""});

            // Show the change button again; Hide clear button;
            mydoc.showContent("#changeCardButton");
            mydoc.hideContent("#clearCardButton");

            document.querySelectorAll(".number_cell").forEach( (obj) =>{
                obj.classList.remove("number_selected");
            });
        }
    }

    // Check if the current card has achieved BINGO!
    function onCheckForBingo()
    {

        let numbers = bingoBoard.getNumbers();
        let boardCard = bingoBoard.getGameCard();
        let playCards = bingoBoard.getPlayCards();

        let bingoCount = 0;
        playCards.forEach( (card) =>{
            let isBingo = card.isBingo(numbers, boardCard.getRequiredSlots());
            if(isBingo?.verdict){
                bingoCount += 1;
                var selector = `[data-card-block="${card.Code}"]`;
                CardManager.setBingoHeader(selector);        
            }
        });

        if(bingoCount > 0){
            let blocksToHide = Array.from(document.querySelectorAll(".cardBlock"))?.filter(x => !x.classList.contains("IS-BINGO") );
            blocksToHide.forEach( (block) => {
                block.classList.add("hidden");
            });
        } else {
            onShowAllCards();
        }
    }

    // Show all the cards (after BINGO or CLEAR)
    function onShowAllCards(){
        // Make sure no header is showing BINGO
        CardManager.clearBingoHeaders();

        // Make sure all blocks are visible;
        document.querySelectorAll(".cardBlock")?.forEach( (block)=>{
            block.classList.remove("IS-BINGO");
            block.classList.remove("hidden");
        });
    }

    // Show the save form
    function onShowSaveCardForm()
    {
        mydoc.showContent(".saveCardForm");
        mydoc.hideContent(".saveCardSentence");
    }

    // Save an existing card
    async function onSaveCard()
    {
        let cardName = mydoc.getContent("[name='cardName']")?.value ?? "";
        let cardCode = mydoc.getContent(".cardName")?.innerText;

        if(cardName == "") {
            alert("Must enter a card name!");
            return; 
        }

        // Get card ID
        let cardID = document.querySelector("[data-card-id]")?.getAttribute("data-card-id");

        if(cardID != undefined && cardName != "")
        {
            mydoc.setContent(".saveCardForm", {"innerHTML":"Saving ..."});

            await CardManager.saveCard(cardID, `${cardName} - ${cardCode}`);

            mydoc.setContent(".saveCardForm", {"innerHTML":"Card Saved!"});

            // Clear the form section
            setTimeout(()=>{
                mydoc.setContent(".saveCardSection", {"innerHTML":""});
            },1500);
            
        }
    }

/********************** NAVIGATION LISTENERS ***********************/
    // Prevent the page accidentally closing
    function onClosePage(event)
    {
        event.preventDefault();
        event.returnValue='';
    }

    // Validate and use a card
    function onEditCard()
    {
        letters = Object.keys(BingoLetters);

        card_values = getCardValues();
        b = card_values["b"].join(",");
        i = card_values["i"].join(",");
        n = card_values["n"].join(",");
        g = card_values["g"].join(",");
        o = card_values["o"].join(",");

        let newPath = `./build.html?b=${b}&i=${i}&n=${n}&g=${g}&o=${o}`
        onNavigate(newPath,"Are you sure you want to edit this Card?");
    }

    // Add a new card to the list
    function onChangeCards(){
        let currentHref = location.href;
        let newHref = currentHref.replace("play", "load");
        onNavigate(newHref, "Are you sure you want to change cards?");
    }

    // Navigate to a new page; With or without confirmation
    function onNavigate(url,message=undefined)
    {
        let canProceed = (message != undefined) ? confirm(message) : true;
        if(canProceed) {
            window.open(url, "_top");
        }
    }