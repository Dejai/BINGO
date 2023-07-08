/* 
    Used to doing standard actions related to cards
*/

const CardManager = {

    getListID: (listName) => {
        return new Promise( resolve =>{
            MyTrello.get_list_by_name(listName, (data)=>{
                let response = JSON.parse(data.responseText);
                let listID = response?.[0]?.["id"] ?? undefined;
                resolve(listID);
            });
        })
    },

    getCard: (cardID) => {

        return new Promise( resolve =>{

            MyTrello.get_single_card(cardID, (cardData)=>{

                let card = myajax.GetJSON(cardData.responseText);
                resolve(card);                
            });
        });
    },

    createCard: (listID, cardName)=>{

        return new Promise( resolve => {
            MyTrello.create_card(listID, cardName,(data)=>{
                let response = JSON.parse(data.responseText);
                resolve(response);
            });
        });
    },

    updateCardDescription: (cardID, cardDesc)=>{
        return new Promise( resolve => {
            MyTrello.update_card_description(cardID, cardDesc, (data)=>{
                let response = JSON.parse(data.responseText);
                resolve(response);
            });
        });
    },

    // Async function to get cards based on list name
    getCardsByList: (listName) =>{
        return new Promise ( resolve =>{
            MyTrello.get_cards_by_list_name(listName, (data)=>{
                
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
            MyTrello.update_card_name(cardID, cardName, (data)=>{
                resolve("Name updaed");
            });
        });
    },

    moveCard: (cardID, destination) =>{

        return new Promise( resolve => {
            MyTrello.get_list_by_name(destination, (data)=>{
                
                let response = JSON.parse(data.responseText);
                let listID = response[0]?.id;

                MyTrello.update_card_list(cardID, listID, (data2) =>{

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

    setNeededCells2: (slots) => {  

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




















// MAY BE ABLE TO GET RID OF THESE

    

    // Load a card (with one of these options: play/example/build)
    loadCard: async(type, identifier, cardObject, append=false) =>{
        let templatePath = (type == "play") ? "/card/src/templates/cardPlay.html" : "/examples/src/templates/cardExample.html";
        let template = await CardPromises.getTemplate(templatePath, cardObject);
        mydoc.setContent(identifier, {"innerHTML":template}, append);
    },



    // Get the numbers from the card date
    getCardNumbers: (cardData) =>{
       
        let desc = cardData["desc"]?.split("\n") ?? [];
        let map = {};

        desc.forEach( (val)=>{
            // Then map the letters to their letters
            let splits = val.split("=");
            let letter = splits[0];
            let values = splits[1].split(",")
            map[letter] = values;
        });
        return map;
    },

    // Get a card object to be used in templates 
    getCardObject: (cardData) =>{
        
        // Get the basic details
        let nameValues = cardData["name"].split(" - ");
        let cardID = cardData["id"];
        let cardName = nameValues[0];
        let cardCode = nameValues[nameValues.length-1];


        // Start a basic card object
        var cardObject = {
            "ID": cardID,
            "Name":cardName,
            "Code":cardCode,
            "NameAndCode": `${cardName} - ( ${cardCode} )`
        }

        // Get the numbrs & loop through them to build a key/value pair in the object
        let cardNumbers = CardManager.getCardNumbers(cardData);

        Object.keys(cardNumbers).forEach( (key)  =>{

            let numbers = cardNumbers[key];
            
            for(var idx in numbers)
            {
                let cardIdx = Number(idx)+1;
                let cardNum = numbers[idx];
                cardNum = (cardNum == "" || cardNum == "FS") ? CardManager.getFreeSpaceIcon() : cardNum;
                let cardKey = `${key.toUpperCase()}${cardIdx}`;
                cardObject[cardKey] = cardNum;
            }
        });

        
        

        return cardObject;
    },

    // Get the card bodies
    getCardBodies: ()=>{
        return Array.from(document.querySelectorAll(".bingo_card_table tbody.bingo_card_body"));
    },

    // Get the icon to use for the free space
    getFreeSpaceIcon: () => {
        return `<span class='freeSpace number_cell'><i class="number_cell fa fa-star-o"></i></span>`;
    },


    // Show which cells are needed
    setNeededCellsByGame: (game)=>{
        if (game == "Straight Line")
        { 
            examples = CardManager.getStraightLinExamples();
            idx = 0;
            let straightLineInterval = setInterval( ()=>{

                CardManager.setNeededCells(examples[idx]);	
                idx+=1 
                setTimeout( ()=>{
                    CardManager.clearNeededCells() // clear the needed cells; so folks don't think only one option is acceptable
                },300);

                if(idx == examples.length)
                {
                    clearInterval(straightLineInterval);
                }
            }, 500);
        }
        else
        {
            let expected = games_object[game]["example"];
            CardManager.setNeededCells(expected);
        } 
    },



    setNeededCells: (expected) =>{

        let cardTables = CardManager.getCardBodies();

        cardTables.forEach( (cardBody) =>{

            // Get the rows in this table & loop through them
            let cardRows = Array.from(cardBody.querySelectorAll("tr"));

            // 
            // 

            // Loop through
            for(var idx in cardRows)
            {
                // 

                // Get the expected cells & the actual cells
                let expectedCells = expected[idx];
                let cardRowCells = Array.from(cardRows[idx].querySelectorAll("td"));

                // 
                // 

                if(expectedCells.length == cardRowCells.length)
                {
                    expectedCells.forEach( (expected, idx) =>{

                        if(expected == 1 || expected == 8)
                        {
                            let _action = cardRowCells[idx]?.classList.add("number_cell_needed") ?? "";
                        }
                    });
                }
            }
        });
    },



    // Check a card for bingo
    checkForBingo: (gameName, cardElement) =>  {

        // If we don't have the pieces, just return
        if (gameName == undefined || cardElement == undefined)
            return; 
        
        // Get the expected output
        let expected = games_object[gameName]["example"];
        let isBingo = false;

        // Check if straight line & do something special;
        if(gameName == "Straight Line")
        {
            isBingo = CardManager.isStraightLineBingo(cardElement);
        }
        else
        {
            let cardState = CardManager.getBoardState(cardElement);
            isBingo = (cardState.toString() == expected.toString() );
        }

        let bingoState = (isBingo) ? "show" : "";

        CardManager.toggleBingoHeaders(cardElement.closest("table"), bingoState);

        return isBingo;
    },




    /* HELPER FUNCTIONS:  */
    getBoardState: (card)=> {
        
        let state = [];

        card.querySelectorAll(".bingo_row")?.forEach( (row) =>{

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
    },

    // Get all the straight line examples
    getStraightLinExamples: () => {

        all_examples = [];

        diag_left = CardManager.getBaseGameTable();
        diag_right = CardManager.getBaseGameTable();

        for (var idx = 0; idx < 5; idx++)
        {
            // Setup the diagonal example
            left = idx;
            right = (5-idx)-1;
            diag_left[idx][left] = (idx == 2) ? 8 : 1;
            diag_right[idx][right] = (idx == 2) ? 8 : 1;

            // Setup row-based wins
            let row_based = CardManager.getBaseGameTable()
            row_based[idx] = (idx ==2 ) ? [1,1,8,1,1] : [1,1,1,1,1];
            all_examples.push(row_based);

            // Setup col-based wins
            let col_based = CardManager.getBaseGameTable();
            for(var itr = 0; itr < 5; itr++)
            {
                col_based[itr][idx] = ((idx == 2 && itr == 2)) ? 8 : 1;
            }
            all_examples.push(col_based);
        }

        all_examples.push(diag_left);
        all_examples.push(diag_right);
        return all_examples;
    },

    // Get a base game example
    getBaseGameTable: ()=>  {
        base_game_table = 	[
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,3,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
        ]
        return base_game_table;
    },

    // Cehck if a given card is a straight line bingo
    isStraightLineBingo: (card) =>   {
        Logger.log("Checking for straightline!");
        let expectedStraight = "11111";
        let hasStraightLine = false;

        // Check diagonal first;
        diagLeftString = "";
        diagRightString = "";

        // Get the map of the data cells;
        let cells = Array.from(card.querySelectorAll("tbody td"));
        let gameBoardMap = [];
        let row = [];
        for(var idx in cells)
        {
            let count = Number(idx) + 1;

            // Add to row
            row.push(cells[idx]);

            // If multiple of 5, add to map
            if( count % 5 == 0)
            {
                gameBoardMap.push(row);
                row = [];
            }

        }

        // Loop through & check the cards
        for(var idx = 0; idx < 5; idx++)
        {
            left = idx;
            right = (5-idx)-1;

            // Starting top-left down;
            leftCell = gameBoardMap[idx][left];
            diagLeftString  += leftCell.classList.contains("number_selected") ? "1" : "0";
            if(diagLeftString == expectedStraight)
            {
                hasStraightLine = true;
                break;
            }

            // Starting top-right down;
            rightCell = gameBoardMap[idx][right];
            diagRightString += rightCell.classList.contains("number_selected") ? "1" : "0";
            if(diagRightString == expectedStraight)
            {
                hasStraightLine = true;
                break;
            }

            // Check the row
            row = gameBoardMap[idx];
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
            gameBoardMap.forEach( (row) =>{
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



    // Toggling the state of the BINGO headers
    toggleBingoHeaders: (cardTable, state) =>   {

        cardTable.querySelectorAll("[class*='card_header_']").forEach( (cell)=>{

            var cardBlock = cardTable.closest("div.cardBlock");

            if (state == "show")
            {
                cell.classList.add("bingo_blink");
                cell.classList.remove("game_table_header");
                cardBlock.classList.add("IS-BINGO");
            }
            else
            {
                cell.classList.remove("bingo_blink");
                cell.classList.add("game_table_header");
                cardBlock.classList.remove("IS-BINGO");
            }
        });
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