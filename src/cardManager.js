/* 
    Used to doing standard actions related to cards
*/

const CardManager = {

    // Load a card (with one of these options: play/example/build)
    loadCard: async(type, identifier, cardObject, append=false) =>{
        let templatePath = (type == "play") ? "/templates/cardPlay.html" : "/templates/cardExample.html";
        let template = await CardPromises.getTemplate(templatePath, cardObject);
        mydoc.setContent(identifier, {"innerHTML":template}, append);
    },

    // Save a card by updating it's name & moving it
    saveCard: async (cardID, cardName) =>{

        // Set new name
        await CardPromises.UpdateCardName(cardID, cardName);

        // Then move card
        await CardPromises.MoveCard(cardID, "NAMED_CARDS");
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
            "Code":cardCode
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

        let cardTables = document.querySelectorAll(".bingo_card_table tbody");

        for(var rowIdx in expected)
        {
            // Get the row of needed cells
            let neededRow = expected[rowIdx];

            // Loop through all the tabes & highlight the cells
            cardTables.forEach( (table)=>{

                // Get the row that matches the current rowIdx
                let row = table.querySelectorAll("tr")?.[rowIdx];
                // Get the cells in that row
                let cells = row.querySelectorAll("td");
                
                for(var cellIdx in cells)
                {
                    // If the neededRow index says 1 or 8, then highlight it.
                    if(neededRow[cellIdx] == 1 || neededRow[cellIdx] == 8)
                    {
                        let cell = cells[cellIdx];
                        cell.classList.add("number_cell_needed");
                    }
                }
            });
        }
    },

    // Clear the "needed" cells
    clearNeededCells: () =>  {
        document.querySelectorAll(".number_cell").forEach( (obj) =>{
            obj.classList.remove("number_cell_needed");
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
        CardManager.toggleBingoHeaders(cardElement, bingoState);
    },




    /* HELPER FUNCTIONS:  */
    getBoardState: (xml=document)=> {
        
        let state = [];

        xml.querySelectorAll(".bingo_row")?.forEach( (row) =>{

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

    // Toggling the state of the BINGO headers
    toggleBingoHeaders: (card, state) =>   {

        card.querySelectorAll("[class*='card_header_']").forEach( (cell)=>{

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

}