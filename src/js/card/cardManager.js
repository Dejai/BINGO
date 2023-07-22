/* 
    Used to doing standard actions related to cards
*/

const CardManager = {

    getListID: (listName) => {
        return new Promise( resolve =>{
            BingoTrelloWrapper.GetListByName(listName, (data)=>{
                let response = JSON.parse(data.responseText);
                let listID = response?.[0]?.["id"] ?? undefined;
                resolve(listID);
            });
        })
    },

    getCard: (cardID) => {
        return new Promise( resolve =>{
            BingoTrelloWrapper.GetCard(cardID, (cardData)=>{
                let card = myajax.GetJSON(cardData.responseText);
                resolve(card);                
            });
        });
    },

    createCard: (listID, cardName)=>{

        return new Promise( resolve => {
            BingoTrelloWrapper.CreateCard(listID, cardName,(data)=>{
                let response = JSON.parse(data.responseText);
                resolve(response);
            });
        });
    },

    updateCardDescription: (cardID, cardDesc)=>{
        return new Promise( resolve => {
            BingoTrelloWrapper.UpdateCardDescription(cardID, cardDesc, (data)=>{
                let response = JSON.parse(data.responseText);
                resolve(response);
            });
        });
    },

    // Async function to get cards based on list name
    getCardsByList: (listName) =>{
        return new Promise ( resolve =>{
            BingoTrelloWrapper.GetCardsByListName(listName, (data)=>{
                let response = JSON.parse(data.responseText);
                // Sort the cards by name
                response = response.sort( (a,b) =>{
                    return a["name"].localeCompare(b["name"]);
                });
                resolve(response);
            }, Logger.errorMessage)
        });
    },

    // Get a set of cards as objects
    async getBingoCardsByList(listName) {
        let cardObjects = [];
        let cards = await CardManager.getCardsByList(listName);
        cards.forEach( (card) =>{
            cardObjects.push( new BingoCard(card) );
        })
        return cardObjects;
    },

    updateCardName: (cardID, cardName) => {
        return new Promise( (resolve) =>{
            BingoTrelloWrapper.UpdateCardName(cardID, cardName, (data)=>{
                resolve("Name updaed");
            });
        });
    },

    moveCard: (cardID, destination) =>{
        return new Promise( resolve => {
            BingoTrelloWrapper.GetListByName(destination, (data)=>{
                let response = JSON.parse(data.responseText);
                let listID = response[0]?.id;
                BingoTrelloWrapper.UpdateCardList(cardID, listID, (data2) =>{
                    resolve("Card moved");
                }, (err)=>{ resolve(err); });
            },(err)=>{ resolve(err);})
        });
    },

    // Save a card by updating it's name & moving it
    saveCard: async (cardID, cardName) =>{
        // Set new name
        await CardManager.updateCardName(cardID, cardName);
        // Then move card
        await CardManager.moveCard(cardID, "NAMED_CARDS");
    },


    // Ignore letters on a card, as they don't need to be viewed at this time.
    ignoreLetters(lettersToIgnore=[]){
        console.log("Ignoring letters");
        if(lettersToIgnore.length > 0)
        {
            lettersToIgnore.forEach( (letter) => {
                console.log(letter);
                var selector = `[data-letter^="${letter}"]`;
                console.log(document.querySelectorAll(selector));
                mydoc.removeClass(selector, "cell_unseen");
                mydoc.addClass(selector, "inelligible");
            });    
        } else {
            CardManager.showIgnoredLetters();
        }
    },

    showIgnoredLetters(){
        list = Array.from(document.querySelectorAll(".inelligible"));
        list.forEach(function(obj){
            obj.classList.remove("inelligible");
            obj.classList.add("cell_unseen");
        });
    },

    setNeededCells: (slots) => {  

        console.log("Trying for these slots");
        console.log(slots);

        // Loop through required slots & mark them as required
        slots.forEach ( (slot) =>{
            var selector = `.number_slot_${slot}`;
            document.querySelectorAll(selector)?.forEach( (ele) =>{
                ele.classList.add("number_cell_needed");
            });
        });
    },

    // Clear the "needed" cells
    clearNeededCells: () =>  {
        document.querySelectorAll(".number_cell").forEach( (obj) =>{
            obj.classList.remove("number_cell_needed");
        });
    },

    // Reset the seen cells
    clearSeenCells: ()  => {
        document.querySelectorAll(".bingo_cell")?.forEach( (obj) => {
            obj.classList.remove("cell_seen");
            obj.classList.add("cell_unseen");
        });
    },

    // Set a card in BINGO state
    setBingoHeader: (blockSelector) => {

        let block = document.querySelector(blockSelector);
        
        // Add class to represent the block is in BINGO
        block?.classList.add("IS-BINGO");

        // Update the header class list
        let headers = block?.querySelectorAll(`[class*='card_header_']`);
        headers?.forEach( (header) =>{
            header.classList.remove("game_table_header");
            header.classList.add("bingo_blink");
        });
    },

    // Clear Bingo Header
    clearBingoHeaders: () => {
        document.querySelectorAll(`[class*='card_header_']`)?.forEach( (header) =>{
            header.classList.add("game_table_header");
            header.classList.remove("bingo_blink");
        });
        // Clear IS-BINGO class too
        document.querySelectorAll(".IS-BINGO")?.forEach( (o) => {
            o.classList.remove("IS-BINGO");
        })
    },


    // Hide all cards that are NOT currently In BINGO state
    onlyShowCardsInBingo: () =>{
        document.querySelectorAll(".cardBlock")?.forEach( (table) =>{
            if( !table.classList.contains("IS-BINGO")) {
                table.classList.add("hidden");
            }
        })
    },

    // Make sure all cards are visible
    showAllCards: () => {
        document.querySelectorAll(".cardBlock")?.forEach( (table) => {
            table.classList.remove("hidden");
        });
    }

}