// A class to help manage multiple cards
class CardManager {

    constructor() {
        this.Cards = [];
        this.CurrentCard = undefined;
    }
    
    addCard(cardCode) {

        if(this.Cards.includes(cardCode))
            return;

        // Add card to the list
        this.Cards.push(cardCode);
        this.setCurrentCard(cardCode);
    }

    // Set the current card being used
    setCurrentCard(code)
    {
        this.CurrentCard = code;
        // mydoc.setContent("#cardName", {"innerHTML": this.CurrentCard});
        // let cardIdx = this.Cards.indexOf(code)+1;
        // mydoc.setContent("#cardIndex", {"innerHTML": `#${cardIdx}`});

        // Show the latest card to be set
        // this.showCardBlock(code);
    }

    // Show the current card block
    // showCardBlock(code)
    // {
    //     // Hide all other blocks first
    //     mydoc.addClass(".cardBlock", "hidden");

    //     // Show the one block
    //     mydoc.showContent(`[data-card-block='${code}']`);
    // }

    // Toggle to the next card
    setNextCard(direction="next") {
        if(this.Cards.length == 0 || this.CurrentCard == undefined)
            return undefined

        let currIdx = this.Cards.indexOf(this.CurrentCard);
        let nextIdx = (direction == "prev") ? currIdx-1 : currIdx+1;
        nextIdx = (nextIdx >= this.Cards.length) ? 0 : nextIdx;

        // Setting the next card
        this.setCurrentCard(this.Cards[nextIdx]);
    }
}


