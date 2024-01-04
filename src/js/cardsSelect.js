const MyCloudflare = new CloudflareWrapper();

MyDom.ready ( async () => { 
    var cards = await MyCloudflare.KeyValues("GET", "/bingo/cards");
    var bingoCards = cards.map(details => new BingoCard(details) )?.filter( card => card.Details.Key != "EXAMPLE");
    console.log(bingoCards);

    var cardTemplate = await MyTemplates.getTemplateAsync("templates/cards/cardPreview.html", bingoCards);
    MyDom.setContent("#listOfCards", {"innerHTML": cardTemplate});

    MyDom.showContent(".showOnLoaded");

    onSetPreselectedCards();

    // Add search for content
    MySearcher.addSearchBar("Cards", "#listOfCards", "#searchBarSection");
    
});

// Set pre-selected cards
function onSetPreselectedCards(){ 
    console.log("Setting preselected cards"); 
    var cardIds = MyUrls.getSearchParam("cards")?.split(",");
    cardIds?.forEach( (x) => {
        let _action = document.querySelector(`[data-card-id="${x}"] button`)?.click();
    });
}

function onToggleCardSelect(button) {

    // Get the selected bloc
    let block = button.closest(".cardPreview");
    let cardID = block.getAttribute("data-card-id") ?? "";
    let isSelected = block.classList.contains("selected");

    // Show/hide things based on the content
    if(!isSelected) {
        MyDom.replaceClass(`[data-card-id='${cardID}']`, "unselected", "selected");
        MyDom.replaceClass(`[data-card-id='${cardID}'] .selectCardButton`, "unselected", "dlf_button_red");
        MyDom.setContent(`[data-card-id='${cardID}'] .selectCardButton`, {"innerText": "UNSELECT"});
    } else {
        MyDom.replaceClass(`[data-card-id='${cardID}']`, "selected",  "unselected");
        MyDom.replaceClass(`[data-card-id='${cardID}'] .selectCardButton`, "dlf_button_red", "unselected");
        MyDom.setContent(`[data-card-id='${cardID}'] .selectCardButton`, {"innerText": "SELECT"});
    }

    // Hide warning
    MyDom.hideContent("#useCardWarning");

    // Clear the search bar (if anything in it)
    // onClearSearch();

    // Get the amount selected
    let amountSelected = document.querySelectorAll(".cardPreview.selected")?.length ?? 0;

    // Toggle the hiding of buttons & cards
    onHideSelectButton( (amountSelected == 3) );
    onHideUnselected( (amountSelected == 3) );
    onUseCardClickable(amountSelected);
}

// Toggle showing the selected cards only
function onShowSelectedCards(event){
    // Clear the search (as that hides cards too);
    var target = event.target;
    var selected = document.querySelectorAll(".cardPreview.selected")?.length;
    onHideUnselected( (target.checked && selected > 0));
}

// Hide the select button
function onHideSelectButton(hideAll=false) {
    var _action = (hideAll) ?  MyDom.hideContent(".selectCardButton.unselected") : MyDom.showContent(".selectCardButton.unselected");
}

// Show only selected cards
function onHideUnselected(hideAll=false){
    var _action = (hideAll) ? MyDom.hideContent(".cardPreview.unselected") : MyDom.showContent(".cardPreview.unselected") ;
    // Set the state of the select button
    MyDom.setContent("#showSelectedCards", {"checked":hideAll } );
}

// Toggle the state of the "Use Card" button
function onUseCardClickable(amountSelected=0) {
    let s = (amountSelected == 0 || amountSelected > 1) ? 'S' : '' ;
    let message = `USE ${amountSelected} CARD${s}`;
    var disabled = (amountSelected > 0) ? "" : "true";
    MyDom.setContent("#useCardButton", {"innerHTML": message, "disabled": disabled});
    var _clickable = (disabled == "") ? MyDom.showContent(".showOnUseSelectedClickable") : MyDom.hideContent(".hideOnUseSelectedNotClickable");
}

// Use the selected cards
function onUseSelectedCards()
{
    let cardIDs = [];
    let selectedCards = document.querySelectorAll(".cardPreview.selected");
    if( (selectedCards?.length ?? 0) == 0) {
        MyDom.showContent("#useCardWarning");
        return;
    }
    // Don't show warning if we can proceed
    MyDom.hideContent("#useCardWarning");

    // Loop through cards & build list of IDs to pass along.
    selectedCards.forEach( (block) =>{
        let id = block.getAttribute("data-card-id");
        cardIDs.push(id);
    });
    let cardIDsList = cardIDs.join(",");
    location.href = `/play/?cards=${cardIDsList}`;
}