
/*
    A set of calls that are shared across BINGO pages
*/

class CardObject 
{
	constructor(card)
	{
		// Get key details
		var desc = card["desc"];
		var cols = desc.split("\n");

		// set key parts
		this.cardID = card["id"];
		this.cardName = card["name"];
		
		cols.forEach( (col)=>{

			let splits = col.split("=");
			let key = splits[0] ?? "x";
			let vals = splits[1]?.split(",") ?? [];
			this[key] = vals;
		});
	}
}

const BingoShared = {

	// Get the saved cards - via a promise
	getSavedCardsPromise: (listName) =>	{
		console.log("Getting cards for list = " + listName);
		return new Promise( resolve => {
			MyTrello.get_cards_by_list_name(listName, (data)=>{

				let cards = JSON.parse(data.responseText);
				resolve(cards);

			}, (err)=>{ resolve("Error"); } );
		});
	},

	// Get the list of savd cards;
	getSavedCards: async (listNames="NAMED_CARDS,RANDOM_CARDS") =>{
		
		// Split names of lists to check;
		let lists = listNames.split(",");

		var cards = [];

		for(var idx in lists)
		{
			var listName = lists[idx];
			var listCards = await BingoShared.getSavedCardsPromise(listName);
			cards = cards.concat(listCards);
		}
		return cards;
	},

	// Get a map of the given cards (mapping to the name);
	getCardMap: (cards) =>{

		var cardMap = {};
		cards.forEach( (card)=>{
			let cardObject = new CardObject(card);
			cardMap[cardObject.cardName] = cardObject;
		});

		return cardMap;
	}
}


// Load the saved cards and run a callback (required)
function loadSavedCards(boardName="", successCallback)
{
	// Always reset the cards;
	CARDS = {};

	// Reset the datalist options
	var list = document.getElementById("card_names_data_list");
	if(list!=undefined){ 
		list.innerHTML = "";
	}


    // Get specific list or all of them;
	let lists = (boardName != "") ? [boardName] : ["NAMED_CARDS", "RANDOM_CARDS"];

	// Get the cards from each list
	lists.forEach( (listName)=>{

		MyTrello.get_list_by_name(listName, (listData)=>{

			let theList = myajax.GetJSON(listData.responseText);
			let listID = theList[0]?.id ?? undefined;

			if(listID != undefined)
			{
				// Get the cards in the list;
				MyTrello.get_cards(listID, (cardData)=>{

					let cards = myajax.GetJSON(cardData.responseText);

					// Loop through every card & create the object for it;
					cards.forEach( (card)=>{
						successCallback(card);
					});
				});
			}
		});
	});
}


/***************** CARD OBJECTS ****************************/

// Create and store an object for the given card;
function createCardObject(card)
{
	let desc = card["desc"];
	let cardName = card["name"];
	let cardID = card["id"];

	let cardObj = {"cardID":cardID}

	let cols = desc.split("\n");
	cols.forEach( (col)=>{

		let splits = col.split("=");
		let key = splits[0] ?? "x";
		let vals = splits[1]?.split(",") ?? [];
		cardObj[key] = vals;
	});

	// Store in general CARDS list;
	CARDS[cardName] = cardObj

	// Also add the option in the datalist
	addSavedCardOption(cardName);
}

// Get card object

// Add the card names to set of options
function addSavedCardOption(cardName)
{
	let list = document.getElementById("card_names_data_list");
	if(list != undefined)
	{
		list.innerHTML += `<option value="${cardName}">${cardName}</option>`
	}
}

// Load an existing card
function onLoadExistingCard()
{
	let ele = document.getElementById("check_bingo_card");
	let val = ele?.value ?? "";

	if(val != "")
	{
		let cardID = CARDS[val]?.cardID;
		location.href = `./card.html?cardid=${cardID}`;
	}
}
