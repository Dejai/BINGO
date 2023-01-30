
/************************ GLOBAL VARIABLES ****************************************/
var GAME_BOARD_CELLS = [];
var CURR_GAME = "";
var IS_CARD_SET = false;
var IS_BINGO = false;
var IS_RANDOM_CARD = false;
var IS_CUSTOM_CARD = false;
var TYPE_OF_CARD = "";

// List IDs for Trello
var LIST_IDS = {};

// Card map
var CARDS = {};
var SAVED_CARDS = []; // list of saved cards

// Setup the default card manager
// var CARD_MANAGER = new CardManager();

var touchEvent = "ontouchstart" in window ? "touchstart" : "click";

/*********************** GETTING STARTED *****************************/

    // Once doc is ready
    mydoc.ready(()=>{

        // Set Trello board name
    	MyTrello.SetBoardName("bingo");

        populateCard();
        TYPE_OF_CARD = "RANDOM";
        getListID(TYPE_OF_CARD);
    });


    // Populate the build card table
    async function populateCard()
    {
        let options = getNumberOptions();
        let template = await CardPromises.getTemplate("/templates/cardCreate.html", options);
        mydoc.setContent("#bingo_card_body", {"innerHTML":template});
        setRandomNumbers();
    }

    // Get the options for each letter
    function getNumberOptions()
    {
        let options = {
            "B":"",
            "I":"",
            "N":"",
            "G":"",
            "O":""
        };

        Object.keys(options).forEach( (letter)=>{

            let optionHtml = "";
            range = bingo_letters[letter];
            lower = range[0];
            upper = range[1]+1;
            for(var idx = lower; idx < upper; idx++)
            {
                optionHtml += `<option value="${idx}">${idx}</option>`;
            }
            options[letter] = optionHtml;
        });

        return options;
    }

    // Set random numbers
    function setRandomNumbers()
    {
        var letters = ["B", "I", "N", "G", "O"];

        // Loop through th eletters
        letters.forEach( (letter) =>{

            let randomNumbers = generateRandomNumbers(letter);
            let lowerCaseLetter = letter.toLowerCase();
            let letterCells = document.querySelectorAll(`#bingo_card_body .build_card_${lowerCaseLetter}`);
            
            // Only proceed if the total numbers matches the cells available
            if(randomNumbers.length == (letterCells?.length ?? 0))
            {
                for(var idx in randomNumbers)
                {
                    let num = randomNumbers[idx];
                    let cell = letterCells[idx];

                    // Don't do anything for Free Space
                    if(num != "FS")
                    {
                        cell.querySelectorAll("option")?.forEach( (cell) =>{

                            let cellValue = cell.getAttribute("value") ?? "";
                            var _action = (cellValue == num) ? cell.setAttribute("selected", true) :
                                            cell.removeAttribute("selected");
                        });
                    }
                }
            }
        });
    }

    // Generate the numbers for the card
    function generateRandomNumbers(letter, isEmptyCard=false)
    {
        // Using 'bingo_letters' from bingo_objects.js
        let min = bingo_letters[letter][0];
        let max = bingo_letters[letter][1];
        let numbers = [];

        // Get 5 random numbers (not repeated);
        while(numbers.length < 5)
        {
            rand = Math.floor(Math.random() * (max - min + 1) + min)

            if (numbers.includes(rand)) continue;

            if(numbers.length == 2 && letter == "N")
            {
                // numbers.push(`<span class='freeSpace number_cell'><i class="number_cell fa fa-star-o"></i></span>`);
                numbers.push("FS");
            }
            else if(isEmptyCard)
            {
                numbers.push("*");
            }
            else
            {
                numbers.push(rand);
            }
        }

        return numbers;
    }
    // Get the list ID based on type of card
    function getListID(type)
    {
        let typeName = type.toUpperCase();
        let listName = `${typeName}_CARDS`;

        MyTrello.get_list_by_name(listName, (listData)=>{
            let list = myajax.GetJSON(listData.responseText);
            if(list.length == 1)
            {
                LIST_IDS[type] = list[0].id
            }
        });
    }
    
   // Validate and use a card
   function onUseCard()
   {
       // By default, we assume this card is all set.
       var valid_card = true;

       // Default the cardName to the type of card value
       let cardName = `${TYPE_OF_CARD}`;

       // Validate the numbers on the card
       letters = Object.keys(bingo_letters);
       card_values = getCardValues();
       keys = Object.keys(card_values);
       for(var idx = 0; idx < keys.length; idx++)
       {
           letter = keys[idx];
           upper = letter.toUpperCase();
           values = card_values[letter];

           if(values.length != 5)
           {
               let errMessage = `ERROR:<br/>Cannot have duplicate values for letter: ${upper}`;
               mydoc.setContent("#createCardMessage", {"innerHTML":errMessage})
               valid_card = false;
               break;
           }
       }

       // Validate that a Built card has a valid name
       let cardNameField = document.getElementById("name_of_custom_card");
       if(cardNameField != undefined)
       {
           let nameVal = cardNameField.value;

           // Check against existing names
           let existingNames = []
           Object.keys(CARDS).forEach( (key)=>{
               let splits = key.split("-");
               let name = splits[0]?.trim() ?? ""
               existingNames.push(name.toUpperCase());
           });
           let nameAlreadyUsed = existingNames.includes(nameVal.toUpperCase());

           if(nameVal != "" && !nameAlreadyUsed)
           {
               cardName = nameVal;
           }
           else
           {
               let uniqueNameErr = "ERROR:<br/>This name is already used. Please use another name."
               let noNameErr = "ERROR:<br/>Please enter a name for this card."
               let errMessage = (nameAlreadyUsed) ? uniqueNameErr : noNameErr; 
               MyNotification.notify("#build_card_instructions",errMessage, "notify_red");
               valid_card = false;
           }
       }


       if(valid_card)
       {
           b = "b=" + card_values["b"].join(",");
           i = "i=" + card_values["i"].join(",");
           n = "n=" + card_values["n"].join(",");
           g = "g=" + card_values["g"].join(",");
           o = "o=" + card_values["o"].join(",");

           let content = [b,i,n,g,o].join("\n");
           content = encodeURI(content);

           let gameCode = Helper.getCode();
           let fullCardName = `${cardName} - ${gameCode}`
           createTrelloCard("RANDOM", fullCardName, content, (newCardID)=>{
               location.href = `/card/play/?cardlist=${newCardID}`
           });
       }
   }

    // Get the values from the cells
    function getCardValues()
    {
        valuesByLetter = {"b":[],"i":[],"n":[],"g":[],"o":[]};

        letters = Object.keys(bingo_letters);

        letters.forEach( (letter) => {

            lower = letter.toLowerCase();

            // Check all the cells for their values
            document.querySelectorAll(`.number_cell_${lower}`).forEach( (cell)=> {

                let cellText = cell.innerText;
                let cellValue = cell.querySelector(`select.build_card_${lower}`)?.value ?? undefined;
                let value = (cellValue != undefined) ? cellValue : cellText;

                // Append value if not already there;
                if(!valuesByLetter[lower].includes(value))
                {
                    valuesByLetter[lower].push(value);
                }

            });
        });
        return valuesByLetter;

    }

    // Create a trello card
    async function createTrelloCard(listType, cardName, content, successCallback)
    {
        let listID = await CardPromises.getListID(`${listType}_CARDS`);

        if(listID == undefined)
        {
            alert("Invalid List ID. Cannot create card");
            return;
        }

        console.log(`Creating card ${cardName} on list ${listID}`);
        let encodedName = encodeURIComponent(cardName);

        // Create the card
        let createdCard = await CardPromises.createCard(listID, encodedName);

        // Update the card
        await CardPromises.updateCardDescription(createdCard["id"], content);

        // Call the callback;
        successCallback(createdCard["id"]);
    }


    // Create a batch of cards
    async function onCreateCardsBatch()
    {

        let cardData = mydoc.getContent("#card_input_text_area")?.value?.trim() ?? ""

        if(cardData != "")
        {

            let batchStatus = document.getElementById("create_batch_status");
            mydoc.showContent("#trackStatusSection");
            mydoc.hideContent("#enterCardsSection");

            let cards = cardData.split("\n");

            for(var idx in cards)
            {
                let newCard = cards[idx];
                console.log(newCard);

                // Get teh appropriate card info
                let cardInfo = newCard.split("/");
                let givenCardName = cardInfo[0].trim() ?? "NAME NOT GIVEN";
                let numbers = cardInfo[1]?.trim().split(" ") ?? [];
                let cardCode = Helper.getCode();


                    // Add an element to the tracking
                let elementTrack = `
                    <hr/>
                    <span id="${cardCode}">
                            <img src="https://dejai.github.io/scripts/assets/img/loading1.gif" style="width:5%;height:5%;">
                    </span> &nbsp; >>>
                    <span>
                        ${newCard}
                    </span><br/>
                `;

                // Set the tracking of the creating of the card
                mydoc.setContent("#create_batch_status", {"innerHTML":elementTrack}, true);

                // Should have 24 numbers
                if(numbers.length == 24)
                {
                    // Add the FS symbol at 
                    numbers.splice(12,0,"FS");

                    // Build the BINGO fields
                    b = "b=" + numbers.slice(0,5).join(",")
                    i = "i=" + numbers.slice(5,10).join(",")
                    n = "n=" + numbers.slice(10,15).join(",")
                    g = "g=" + numbers.slice(15,20).join(",")
                    o = "o=" + numbers.slice(20,25).join(",")
                    let content = [b,i,n,g,o].join("\n");
                    content = encodeURI(content);

                    let cardName = `${givenCardName} - ${cardCode}`;

                    await createTrelloCard("NAMED", cardName, content, (card)=>{
                        if(card != undefined){
                            mydoc.setContent(`#${cardCode}`, {"innerHTML": "SUCCESS!"});
                        }
                    });
                }
                else
                {
                    mydoc.setContent(`#${givenCardName}`,{"innerHTML":"FAIL!"});
                }
            }
        }

        // let ele = document.getElementById("card_input_text_area");
        // let value = ele?.value;
        // let cards = value.split("\n");

        // // Track the status of each created
        // let batchStatus = document.getElementById("create_batch_status");
        // mydoc.showContent("#trackStatusSection");
        // mydoc.hideContent("#enterCardSection");

        // // Loop through the cards
        // cards.forEach( (card)=>{

        //     if(card != "")
        //     {
                

        //         // Add an element to the tracking
        //         let elementTrack = `
        //             <hr/>
        //             <span id="${givenCardName}">
	    //                  <img src="https://dejai.github.io/scripts/assets/img/loading1.gif" style="width:5%;height:5%;">
        //             </span> &nbsp; >>>
        //             <span>
        //                 ${card}
        //             </span><br/>
        //         `;
        //         batchStatus.innerHTML += elementTrack;

        //         // Ensure it is only 24 (no free space yet)
        //         if(numbers.length == 24)
        //         {
        //             // Add the FS symbol at 
        //             numbers.splice(12,0,"FS");

        //             b = "b=" + numbers.slice(0,5).join(",")
        //             i = "i=" + numbers.slice(5,10).join(",")
        //             n = "n=" + numbers.slice(10,15).join(",")
        //             g = "g=" + numbers.slice(15,20).join(",")
        //             o = "o=" + numbers.slice(20,25).join(",")

        //             let content = [b,i,n,g,o].join("\n");
        //             content = encodeURI(content);

        //             let gameCode = Helper.getCode();
        //             let cardName = `${givenCardName} - ${gameCode}`
        //             // console.log("Creating a card = " + cardName);

        //             createTrelloCard("RANDOM", cardName, content, (cardID)=>{
        //                 if(cardID != null)
        //                 {
        //                     mydoc.loadContent("SUCCESS",givenCardName);
        //                 }
        //             });
        //         }
        //         else
        //         {
        //             mydoc.loadContent("FAIL!",givenCardName);
        //         }
        //     }
        // });
    }
