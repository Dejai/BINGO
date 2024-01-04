const MyCloudflare = new CloudflareWrapper();
const BingoTouch = "ontouchstart" in window ? "touchstart" : "click";
const MyBingoGames = new BingoGameDictionary( BingoGames.map(x => new BingoGame(x)) );
const MyBingoCards = new BingoCardTracker();

MyDom.ready ( async () => { 

    // Set the game options
    MyDom.setContent("#gameOptionsOnCard", {"innerHTML": MyBingoGames.Options}, true);

    // Get the values from the search param
    var game = MyUrls.getSearchParam("game");
    var cardsList = (MyUrls.getSearchParam("cards") ?? "").split(",");
    var balls = MyUrls.getSearchParam("balls")?.split(",") ?? [];


    // Setup any cards found in the list
    for(var card of cardsList){
        var cardDetails = await MyCloudflare.KeyValues("GET", `bingo/card/?key=${card}`);
        var bingoCard = new BingoCard(cardDetails);
        MyBingoCards.addCard(bingoCard);
        var cardTemplate = await MyTemplates.getTemplateAsync("templates/cards/cardPlay.html", bingoCard);
        MyDom.setContent("#cardBlockSection", {"innerHTML": cardTemplate}, true);

        // If given a game, stop after the first card
        if(game != undefined){ break; }        
    }
    console.log(MyBingoCards);
    console.log(Object.values(MyBingoCards.Cards));

    // Set listener for all cells
    for(var cell of document.querySelectorAll(".number_cell")){
        cell.addEventListener(BingoTouch, onSelectNumber);
    }

    // Get the first card & add any selected balls (if passed in)
    // If a game given, select it & select any balls given;
    if(game != undefined && balls.length > 0){
        var bingoGame = MyBingoGames.getGame(game);
        var bingoCard = MyBingoCards.getFirstCard();
        if(bingoCard != undefined){
            bingoCard.setSlotsFilled(balls, bingoGame.hasFreeSlotRequired());
            MyDom.setContent("#gameOptionsOnCard", {"value": game});
            onSelectGame();
            for(var slot of bingoCard.SlotsFilled.keys() ){
                var cell = document.querySelector(`[data-slot-id="${slot}"]`);
                if(cell != undefined){ cell.click(); }
            }
        }
    }

    // Set time stamp for game card being selected
    let time = MyHelper.getDate("H:m:s K");
    MyDom.setContent("#cardSelectedTimeStamp", {"innerText": "Loaded at: " + time});
    
});

// Indicate which ones are needed
function onSelectGame() {
    var gameName = MyDom.getContent("#gameOptionsOnCard")?.value ?? "";
    var game = MyBingoGames.getGame(gameName);
    onClearCellRequirements();

    var reqSlots = game.RequiredSlots;
    var optSlots = game.OptionalSlots;
    for(var cell of document.querySelectorAll(".number_cell")){
        var slot = cell.getAttribute("data-slot-id");
        if(reqSlots.includes(slot)){
            cell.classList.add("number_cell_required");
        } else if (optSlots.includes(slot)){
            cell.classList.add("number_cell_optional");
        } else { 
            cell.classList.remove("number_cell_required");
            cell.classList.remove("number_cell_optional");
        }
    }

    // Adjust visibility of things
    MyDom.hideContent(".hideOnGameSelect");
    MyDom.setContent("#resetButton", {"disabled": ""});
    MyDom.showContent("#resetButton");
}

// Select a value
function onSelectNumber(event) {
    try {
        // Check for game before moving on.
        var gameName = MyDom.getContent("#gameOptionsOnCard")?.value ?? "";
        if(gameName == "") {
            MyDom.hideContent(".hideOnGameWarning");
            MyDom.showContent("#selectGameWarning");
            window.scrollTo(0,0);
            return;
        }

        // Get the target of the game change; 
        let target = event.target;
        let numberCell = target.closest("td.number_cell");
        if(numberCell == undefined){
            MyLogger.LogError("Could not find the selected cell");
            return;
        }

        // If not required or optional, then nothing to do
        var isReq = numberCell.classList.contains("number_cell_required");
        var isOpt = numberCell.classList.contains("number_cell_optional");
        if(!isReq && !isOpt){
            console.log("Returning");
            return;
        }

        // Set (or unset) any/all cells with the same number required
        var cellValue = numberCell.innerText;
        var cellsToClick = Array.from(document.querySelectorAll(`.number_cell_required, .number_cell_optional`))?.filter(x => x.innerText == cellValue);
        for(var cell of cellsToClick) {
            var selectedClassName = "number_selected"
            var isSelected = cell.classList.contains(selectedClassName);
            var _ = (!isSelected) ? cell.classList.add(selectedClassName) : cell.classList.remove(selectedClassName);

            // Use block details to set respective card
            var blockKey = cell.closest(".cardBlock")?.getAttribute("data-card-block") ?? "";
            var card = MyBingoCards.getCard(blockKey);
            var slot = cell.getAttribute("data-slot-id");
            if(card != undefined){
                var _ = (!isSelected) ? card.addSlot(slot) : card.removeSlot(slot);
            }
        }

        // Adjust visibility of things
        MyDom.hideContent(".hideOnSelect");
        MyDom.setContent("#gameOptionsOnCard", {"disabled":"true"});
        // Check if this card has bingo
        onCheckForBingo();

    } catch(err){
        MyLogger.LogError(err);
    }
}


// Check if the current card has achieved BINGO!
function onCheckForBingo() {
    try {

        var gameName = MyDom.getContent("#gameOptionsOnCard")?.value ?? "";
        var game = MyBingoGames.getGame(gameName);
        var bingoCount = 0;
        for(var card of Object.values(MyBingoCards.Cards)) {
            var cardHasBingo = card.hasBingo(game);
            var cardKey = card?.Details?.Key ?? "";
           bingoCount += (cardHasBingo) ? 1 : 0;
            var _class = (cardHasBingo) 
                            ? MyDom.addClass(`[data-card-block="${cardKey}"]`, "IS-BINGO") 
                            : MyDom.removeClass(`[data-card-block="${cardKey}"]`, "IS-BINGO");
        }

        // Loop through cards again and show/hide based on IS-BINGO
        for(var cardBlock of Array.from(document.querySelectorAll(".cardBlock"))){
            if(bingoCount > 0 && !cardBlock.classList.contains("IS-BINGO")){
                cardBlock.classList.add("hidden");
            } else { 
                cardBlock.classList.remove("hidden");
            }
        }
    } catch(err){
        MyLogger.LogError(err);
    }
}


// Clear cell requirements
function onClearCellRequirements(){
    MyDom.removeClass(".number_cell", "number_cell_required");
    MyDom.removeClass(".number_cell", "number_cell_optional");
    MyDom.removeClass(".number_cell", "number_selected");
}

// Clear the card
function onReset() {
    let proceed = confirm("Are you sure you want to reset things?");
    if(proceed) {

        // Reset every card:
        for(var card of Object.values(MyBingoCards.Cards)) { card.reset(); }
        onClearCellRequirements();
        onCheckForBingo();

        // Unlock the selector
        MyDom.setContent("#gameOptionsOnCard", {"disabled":""});
        MyDom.setContent("#gameOptionsOnCard", {"value":""});

        // Disable the reset button;
        MyDom.setContent("#resetButton", {"disabled": "true"});
    }
}