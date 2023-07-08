
/************************ GLOBAL VARIABLES ****************************************/
var touchEvent = "ontouchstart" in window ? "touchstart" : "click";

class CardPicker  {
    constructor(){
        this.Cards = {}
    }
    // Set the cards to be picked
    setCards(cards=[]){
        cards.forEach( (card) =>{
            var bingoCard = new BingoCard(card);
            this.Cards[bingoCard.Code] = bingoCard;
        });
    }
    // Get sorted keys
    getSortedCodes(){
        var codes = Object.values(this.Cards)?.map(x => x.Code)?.sort();
        return codes;
    }
}

const cardPicker = new CardPicker();

var TEST = undefined; 
/*********************** GETTING STARTED *****************************/

    // Once doc is ready
    mydoc.ready( async ()=>{

        // Set Trello board name
    	MyTrello.SetBoardName("bingo");

        // Get the list of cards
        var cards = await CardManager.getCardsByList("NAMED_CARDS");

        // Set the card picker
        cardPicker.setCards(cards);

        // Ordered codes
        var codes = cardPicker.getSortedCodes();

        // Set the full html
        var fullHtml = "";
        for(var idx in codes){
            var code = codes[idx];
            var templates = await cardPicker.Cards[code]?.getTemplates("load");
            var template = templates?.[0];
            fullHtml += template;
        }

        // Show things that were waiting on load
        mydoc.showContent(".showOnLoaded");

        // Set/show the cards
        mydoc.setContent("#listOfCards", {"innerHTML":fullHtml});

        // Set any preselected cards
        onSetPreselectedCards();

        // Search bar focus (after cards loaded);
        onSearchBlur();

    });

    // Set pre-selected cards
    function onSetPreselectedCards(){ 
        console.log("Setting preselected cards"); 
        var cardIds = mydoc.get_query_param("cardlist")?.split(",");
        cardIds?.forEach( (x) => {
            let _action = document.querySelector(`[data-card-id="${x}"] button`)?.click();
        });
    }

    // Toggle a card being selected
    function onToggleCardSelect(event)
    {
        // Get the selected bloc
        let target = event.target;
        let block = target.closest(".cardLoadBlock");
        let cardID = block.getAttribute("data-card-id") ?? "";
        let isSelected = block.classList.contains("selected");

        // Show/hide things based on the content
        if(!isSelected) {
            mydoc.addClass(`[data-card-id='${cardID}']`, "selected");
            mydoc.removeClass(`[data-card-id='${cardID}']`, "unselected");
            mydoc.addClass(`[data-card-id='${cardID}'] .selectCardButton`, "dlf_button_red");
            mydoc.removeClass(`[data-card-id='${cardID}'] .selectCardButton`, "unselected");
            mydoc.setContent(`[data-card-id='${cardID}'] .selectCardButton`, {"innerText": "UNSELECT"});
        } else {
            mydoc.removeClass(`[data-card-id='${cardID}']`, "selected");
            mydoc.addClass(`[data-card-id='${cardID}']`, "unselected");
            mydoc.removeClass(`[data-card-id='${cardID}'] .selectCardButton`, "dlf_button_red");
            mydoc.addClass(`[data-card-id='${cardID}'] .selectCardButton`, "unselected");
            mydoc.setContent(`[data-card-id='${cardID}'] .selectCardButton`, {"innerText": "SELECT"});
        }

        // Hide warning
        mydoc.hideContent("#useCardWarning");

        // Clear the search bar (if anything in it)
        onClearSearch();

        // Get the amount selected
        let amountSelected = document.querySelectorAll(".cardLoadBlock.selected")?.length ?? 0;

        // Toggle the hiding of buttons & cards
        onHideSelectButton( (amountSelected == 3) );
        onHideUnselected( (amountSelected == 3) );
        onUseCardClickable(amountSelected);
    }

    // Toggle showing the selected cards only
    function onShowSelectedCards(event){
        // Clear the search (as that hides cards too);
        onClearSearch();

        var target = event.target;
        var selected = document.querySelectorAll(".cardLoadBlock.selected")?.length;
        onHideUnselected( (target.checked && selected > 0));
    }

    // Hide the select button
    function onHideSelectButton(hideAll=false) {
        var _action = (hideAll) ?  mydoc.hideContent(".selectCardButton.unselected") : mydoc.showContent(".selectCardButton.unselected");
    }

    // Show only selected cards
    function onHideUnselected(hideAll=false){
        var _action = (hideAll) ? mydoc.hideContent(".cardLoadBlock.unselected") : mydoc.showContent(".cardLoadBlock.unselected") ;
        // Set the state of the select button
        mydoc.setContent("#showSelectedCards", {"checked":hideAll } );
    }

    // Toggle the state of the "Use Card" button
    function onUseCardClickable(amountSelected=0){
        if(amountSelected > 0) {
            let s = (amountSelected == 0 || amountSelected > 1) ? 'S' : '' ;
            mydoc.setContent("#useCardButton", {"innerHTML": `USE ${amountSelected} SELECTED CARD${s}`});
            mydoc.addClass("#useCardButton", "dlf_button_limegreen");
            mydoc.removeClass("#useCardButton", "dlf_button_gray");
            return;
        }
        mydoc.setContent("#useCardButton", {"innerHTML": `USE 0 SELECTED CARDS`});
        mydoc.addClass("#useCardButton", "dlf_button_gray");
        mydoc.removeClass("#useCardButton", "dlf_button_limegreen");
    }

    // Use the selected cards
    function onUseSelectedCards()
    {
        let cardIDs = [];
        let selectedCards = document.querySelectorAll(".cardLoadBlock.selected");
        if( (selectedCards?.length ?? 0) == 0) {
            mydoc.showContent("#useCardWarning");
            return;
        }
        // Don't show warning if we can proceed
        mydoc.hideContent("#useCardWarning");

        // Loop through cards & build list of IDs to pass along.
        selectedCards.forEach( (block) =>{
            let id = block.getAttribute("data-card-id");
            cardIDs.push(id);
        });
        let cardIDsList = cardIDs.join(",");
        location.href = `/card/play/?cardlist=${cardIDsList}`;
    }