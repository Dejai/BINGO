const MyCloudflare = new CloudflareWrapper();

MyDom.ready ( async () => { 
    var cards = await MyCloudflare.KeyValues("GET", "/bingo/cards");
    var bingoCards = cards.map(details => new BingoCard(details) )?.filter( card => card.Details.Key != "EXAMPLE");
    var cardTemplate = await MyTemplates.getTemplateAsync("templates/cards/cardPreview.html", bingoCards);
    MyDom.setContent("#listOfCards", {"innerHTML": cardTemplate});

    MyDom.showContent(".showOnLoaded");

    onSetPreselectedCards();

    // Add search for content
    MySearcher.addSearchBar("Cards", "#listOfCards", "#searchBarSection");
    
});

// Set pre-selected cards
function onSetPreselectedCards(){ 
    var cardIds = MyUrls.getSearchParam("cards")?.split(",");
    cardIds?.forEach( (x) => {
        let _action = document.querySelector(`[data-card-id="${x}"] button`)?.click();
    });
}

function onToggleCardSelect(button) {

    // Get the selected block
    let block = button.closest(".cardPreview");
    let cardID = block.getAttribute("data-card-id") ?? "";
    let isSelected = block.classList.contains("selected");
    var isSelectAction = false;

    // Show/hide things based on the content
    if(!isSelected) {
        MyDom.addClass(`[data-card-id='${cardID}']`,"selected");
        MyDom.addClass(`[data-card-id='${cardID}'] .selectCardButton`, "selected");
        MyDom.setContent(`[data-card-id='${cardID}'] .selectCardButton`, {"innerText": "UNSELECT"});
        isSelectAction = true;
    } else {
        MyDom.removeClass(`[data-card-id='${cardID}']`, "selected");
        MyDom.removeClass(`[data-card-id='${cardID}'] .selectCardButton`, "selected");
        MyDom.setContent(`[data-card-id='${cardID}'] .selectCardButton`, {"innerText": "SELECT"});
    }

    // Get the amount selected
    let amountSelected = document.querySelectorAll(".cardPreview.selected")?.length ?? 0;
    let s = (amountSelected == 0 || amountSelected > 1) ? 's' : '' ;
    let message = `You have <strong class='orangeText'>${amountSelected} card${s}</strong> selected.`;
    MyDom.setContent("#numberOfSelectedCards", {"innerHTML": message });
    var _hideSelect = (amountSelected == 3) ?  MyDom.hideContent(".selectCardButton:not(.selected)") : MyDom.showContent(".selectCardButton");

    if(isSelectAction && amountSelected > 0){
        MyDom.hideContent(".hideOnSelectCard");
        MyDom.showContent(".showOnSelectCard");
    }
}

// Toggle back to select another card
function onAdjustSelectedCards(){
    MyDom.hideContent(".hideOnAdjustSelectedCards");
    MyDom.showContent(".showOnAdjustSelectedCards");
}

// Show only the selected cards
function onToggleSelectedCardsView(checkbox){
    var _toggle = (checkbox.checked) ? MyDom.hideContent(".cardPreview:not(.selected)") : MyDom.showContent(".cardPreview");
}

// Use the selected cards
function onUseSelectedCards()
{
    let cardIDs = [];
    let selectedCards = document.querySelectorAll(".cardPreview.selected");
    if(selectedCards.length > 0)
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