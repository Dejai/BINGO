
/************************ GLOBAL VARIABLES ****************************************/
var touchEvent = "ontouchstart" in window ? "touchstart" : "click";

var TYPE_OF_CARD = "";

// List IDs for Trello
var LIST_IDS = {};


/*********************** GETTING STARTED *****************************/

    // Once doc is ready
    mydoc.ready(()=>{

        // Set Trello board name
    	MyTrello.SetBoardName("bingo");

        // Set the random card
        setRandomCard();

        TYPE_OF_CARD = "RANDOM";
        getListID(TYPE_OF_CARD);
    });

    // Set a random card
    async function setRandomCard(){
        let card = new BingoCard();

        let templates = await card.getTemplates("create");
        var template = templates?.[0];
        mydoc.setContent("#bingo_card_body", {"innerHTML":template});

        // Set the card name
        mydoc.setContent("#newCardName", {"innerHTML":card.Code});

        // Set each <select> with the right option
        document.querySelectorAll(".build_card_select")?.forEach( (select) => {
            let initValue = select.getAttribute("data-initial-value");
            let option = select.querySelector(`[value="${initValue}"]`);
            if(option != undefined){ option.selected = true; }
        });
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

    // Validate the card on changing any card number
    function onNumberChange() { 
        onIsValidCard();
    }

    // Validate the current card
    function onIsValidCard() {
        var isValid = true;

        // Clear any messages first
        mydoc.setContent("#createCardMessage", {"innerHTML":""});

        // Validate the numbers on the card
       var card_values = getCardValues();
       keys = Object.keys(card_values);
       for(var idx = 0; idx < keys.length; idx++)
       {
           letter = keys[idx];
           upper = letter.toUpperCase();
           values = card_values[letter];

           if(values.length != 5)
           {
               let errMessage = `ERROR:<br/>Cannot have duplicate values for letter: ${upper}`;
               mydoc.setContent("#createCardMessage", {"innerHTML":errMessage});
               valid_card = false;
               break;
           }
       }

       return isValid;
    }
    

   // Validate and use a card
   function onUseCard()
   {

        // The list of values on the card;
        var card_values = getCardValues();

       // Create card only if valid
       var isValidCard = onIsValidCard();
       if(isValidCard)
       {
           b = "b=" + card_values["b"].join(",");
           i = "i=" + card_values["i"].join(",");
           n = "n=" + card_values["n"].join(",");
           g = "g=" + card_values["g"].join(",");
           o = "o=" + card_values["o"].join(",");

           let content = [b,i,n,g,o].join("\n");
           content = encodeURI(content);

           let gameCode = Helper.getCode();
           let fullCardName = `RANDOM - ${gameCode}`
           createTrelloCard("RANDOM", fullCardName, content, (newCardID)=>{
               location.href = `/card/play/?cardlist=${newCardID}`
           });
       }
   }

   // Get the card values as a string (to save in a card);
   function getCardString(){
        var values = getCardValues();

        b = "b=" + values["b"].join(",");
        i = "i=" + values["i"].join(",");
        n = "n=" + values["n"].join(",");
        g = "g=" + values["g"].join(",");
        o = "o=" + values["o"].join(",");

        let content = [b,i,n,g,o].join("\n");
        return content;
   }

   // Create the new card
   async function onCreateNewCard(){

        mydoc.showContent("#createCardLoading");

        var listID = await CardManager.getListID("RANDOM_CARDS");

        if(listID == undefined){
            mydoc.setContent("#createCardMessage", {"innerHTML":"Could not use this card. :("});
            mydoc.hideContent("#createCardLoading");
            return;
        }

        // Get the name & create card
        let cardName = mydoc.getContent("#newCardName")?.innerText?.trim() ?? "";
        let cardFullName = `RANDOM - ${cardName}`;
        let encodedName = encodeURIComponent(cardFullName);

        // Create New Card
        let newCard = await CardPromises.createCard(listID, encodedName);
        let newCardID = newCard?.["id"] ??""

        // Update card with desc
        if(newCardID != ""){
            var content = getCardString();
            content = encodeURI(content);
            await CardPromises.updateCardDescription(newCard["id"], content);

            // Once all set, then navigate to the new card
            location.href = `/card/play/?cardlist=${newCardID}`
        }
   }

    // Get the values from the cells
    function getCardValues()
    {
        valuesByLetter = {"b":[],"i":[],"n":[],"g":[],"o":[]};

        letters = Object.keys(BingoLetters);

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
    }