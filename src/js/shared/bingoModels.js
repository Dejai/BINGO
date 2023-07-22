



//************ VARIABLE: BINGO GAMES ************************************************************************************************************
// The "one true" Trello Wrapper
const BingoTrelloWrapper = new TrelloWrapper("bingo");

// A set of Games
const BingoGames = [
    {
      "name": "Full House",
      "group": "Classic Games",
      "details": "The game is Full House! All the spaces on your card.",
      "desc": "B=1,1,1,1,1 \n I=1,1,1,1,1 \n N=1,1,8,1,1 \n G=1,1,1,1,1 \n O=1,1,1,1,1"
    },
    {
      "name": "Inner Box",
      "group": "Classic Games",
      "details": "The game is Inner Box!",
      "desc": "B=0,0,0,0,0 \n I=0,1,1,1,0 \n N=0,1,3,1,0 \n G=0,1,1,1,0 \n O=0,0,0,0,0",
      "ignores": ["B","O"]
    },
    {
      "name": "Outer Box",
      "group": "Classic Games",
      "details": "The game is Outer Box!",
      "desc": "B=1,1,1,1,1 \n I=1,0,0,0,1 \n N=1,0,3,0,1 \n G=1,0,0,0,1 \n O=1,1,1,1,1"
    },
    {
      "name": "Straight Line",
      "group": "Classic Games",
      "details": "The game is any Straight Line! Any vertical, horizontal, or diagonal line of 5!",
      "desc": "B= \n I= \n N= \n G= \n O= ",
      "variations":[
        "B=1,1,1,1,1\n I=0,0,0,0,0 \n N=0,0,3,0,0 \n G=0,0,0,0,0 \n O=0,0,0,0,0 ",
        "B=1,0,0,0,0 \n I=1,0,0,0,0 \n N=1,0,3,0,0 \n G=1,0,0,0,0 \n O=1,0,0,0,0 ",
        "B=0,0,0,0,0 \n I=1,1,1,1,1\n N=0,0,3,0,0 \n G=0,0,0,0,0 \n O=0,0,0,0,0 ",
        "B=0,1,0,0,0 \n I=0,1,0,0,0 \n N=0,1,3,0,0 \n G=0,1,0,0,0 \n O=0,1,0,0,0 ",
        "B=0,0,0,0,0 \n I=0,0,0,0,0 \n N=1,1,8,1,1 \n G=0,0,0,0,0 \n O=0,0,0,0,0 ",
        "B=0,0,1,0,0 \n I=0,0,1,0,0 \n N=0,0,8,0,0 \n G=0,0,1,0,0 \n O=0,0,1,0,0 ",
        "B=0,0,0,0,0 \n I=0,0,0,0,0 \n N=0,0,3,0,0 \n G=1,1,1,1,1\n O=0,0,0,0,0 ",
        "B=0,0,0,1,0 \n I=0,0,0,1,0 \n N=0,0,3,1,0 \n G=0,0,0,1,0 \n O=0,0,0,1,0 ",
        "B=0,0,0,0,0 \n I=0,0,0,0,0 \n N=0,0,3,0,0 \n G=0,0,0,0,0 \n O=1,1,1,1,1",
        "B=0,0,0,0,1 \n I=0,0,0,0,1 \n N=0,0,3,0,1 \n G=0,0,0,0,1 \n O=0,0,0,0,1 ",
        "B=0,0,0,0,1 \n I=0,0,0,1,0 \n N=0,0,8,0,0 \n G=0,1,0,0,0 \n O=1,0,0,0,0 ",
        "B=1,0,0,0,0 \n I=0,1,0,0,0 \n N=0,0,8,0,0 \n G=0,0,0,1,0 \n O=0,0,0,0,1 "

        // // Columns
        // "B=1,1,1,1,1\n I=0,0,0,0,0 \n N=0,0,3,0,0 \n G=0,0,0,0,0 \n O=0,0,0,0,0 ",
        // "B=0,0,0,0,0 \n I=1,1,1,1,1\n N=0,0,3,0,0 \n G=0,0,0,0,0 \n O=0,0,0,0,0 ",
        // "B=0,0,0,0,0 \n I=0,0,0,0,0 \n N=1,1,8,1,1 \n G=0,0,0,0,0 \n O=0,0,0,0,0 ",
        // "B=0,0,0,0,0 \n I=0,0,0,0,0 \n N=0,0,3,0,0 \n G=1,1,1,1,1\n O=0,0,0,0,0 ",
        // "B=0,0,0,0,0 \n I=0,0,0,0,0 \n N=0,0,3,0,0 \n G=0,0,0,0,0 \n O=1,1,1,1,1",
        // // Rows
        // "B=1,0,0,0,0 \n I=1,0,0,0,0 \n N=1,0,3,0,0 \n G=1,0,0,0,0 \n O=1,0,0,0,0 ",
        // "B=0,1,0,0,0 \n I=0,1,0,0,0 \n N=0,1,3,0,0 \n G=0,1,0,0,0 \n O=0,1,0,0,0 ",
        // "B=0,0,1,0,0 \n I=0,0,1,0,0 \n N=0,0,8,0,0 \n G=0,0,1,0,0 \n O=0,0,1,0,0 ",
        // "B=0,0,0,1,0 \n I=0,0,0,1,0 \n N=0,0,3,1,0 \n G=0,0,0,1,0 \n O=0,0,0,1,0 ",
        // "B=0,0,0,0,1 \n I=0,0,0,0,1 \n N=0,0,3,0,1 \n G=0,0,0,0,1 \n O=0,0,0,0,1 ",
        // // Diag
        // "B=1,0,0,0,0 \n I=0,1,0,0,0 \n N=0,0,8,0,0 \n G=0,0,0,1,0 \n O=0,0,0,0,1 ",
        // "B=0,0,0,0,1 \n I=0,0,0,1,0 \n N=0,0,8,0,0 \n G=0,1,0,0,0 \n O=1,0,0,0,0 "
      ]
    },
    {
      "name": "Bird",
      "group": "Random Games",
      "details": "The game is Bird! Down the N, and across the middle row.",
      "desc": "B=0,0,1,0,0 \n I=0,0,1,0,0 \n N=1,1,8,1,1 \n G=0,0,1,0,0 \n O=0,0,1,0,0"
    },
    {
      "name": "Greater Than",
      "group": "Random Games",
      "details": "The game is Greater Than! The greater than symbol.",
      "desc": "B=1,0,0,0,1 \n I=0,1,0,1,0 \n N=0,0,8,0,0 \n G=0,0,0,0,0 \n O=0,0,0,0,0",
      "ignores": ["N","G","O"]
    },
    {
      "name": "Grid!",
      "group": "Random Games",
      "details": "The game is Grid! Down the B, down the N, and down…across the middle row, and across the bottom row.",
      "desc": "B=1,1,1,1,1 \n I=1,0,1,0,1 \n N=1,1,8,1,1 \n G=1,0,1,0,1 \n O=1,1,1,1,1"
    },
    {
      "name": "Ladder",
      "group": "Random Games",
      "details": "The game is Ladder! Across the top row, middle row, and bottom row",
      "desc": "B=1,0,1,0,1 \n I=1,0,1,0,1 \n N=1,0,8,0,1 \n G=1,0,1,0,1 \n O=1,0,1,0,1"
    },
    {
      "name": "Less Than",
      "group": "Random Games",
      "details": "The game is Less Than! The less than symbol.",
      "desc": "B=0,0,0,0,0 \n I=0,0,0,0,0 \n N=0,0,8,0,0 \n G=0,1,0,1,0 \n O=1,0,0,0,1",
      "ignores": ["B","I","N"]
    },
    {
      "name": "Popsicle",
      "group": "Random Games",
      "details": "The game is Popsicle! The shape looks like a popsicle.",
      "desc": "B=0,0,0,0,0 \n I=1,1,1,0,0 \n N=1,1,8,1,1 \n G=1,1,1,0,0 \n O=0,0,0,0,0",
      "ignores": ["B","O"]

    },
    {
      "name": "Stripes",
      "group": "Random Games",
      "details": "The game is Stripes! Down the B, N, and O",
      "desc": "B=1,1,1,1,1 \n I=0,0,0,0,0 \n N=1,1,8,1,1 \n G=0,0,0,0,0 \n O=1,1,1,1,1",
      "ignores": ["I","G"]
    },
    {
      "name": "Toy Car",
      "group": "Random Games",
      "details": "The game is Toy Car! Down the N, and add some wheels!",
      "desc": "B=0,0,0,0,0 \n I=0,1,0,1,0 \n N=1,1,8,1,1 \n G=0,1,0,1,0 \n O=0,0,0,0,0",
      "ignores": ["B","O"]
    },
    {
      "name": "Train Tracks",
      "group": "Random Games",
      "details": "The game is Train Tracks! Down the I and G",
      "desc": "B=0,0,0,0,0 \n I=1,1,1,1,1 \n N=0,0,3,0,0 \n G=1,1,1,1,1 \n O=0,0,0,0,0",
      "ignores": ["B","N", "O"]
    },
    {
      "name": "Winner's Podium",
      "group": "Random Games",
      "details": "The game is Winner's Podium! Bottom row, the middle three in the 4th row, and the Free Space.",
      "desc": "B=0,0,0,0,1 \n I=0,0,0,1,1 \n N=0,0,8,1,1 \n G=0,0,0,1,1 \n O=0,0,0,0,1"
    },
    {
      "name": "Letter: A",
      "group": "Letter Games",
      "details": "The game is the Letter A!",
      "desc": "B=1,1,1,1,1 \n I=1,0,1,0,0 \n N=1,0,8,0,0 \n G=1,0,1,0,0 \n O=1,1,1,1,1"
    },
    {
      "name": "Letter: B",
      "group": "Letter Games",
      "details": "The game is the Letter B!",
      "desc": "B=1,1,1,1,1 \n I=1,0,1,0,1 \n N=1,0,8,0,1 \n G=1,0,1,0,1 \n O=1,1,1,1,1"
    },
    {
      "name": "Letter: C",
      "group": "Letter Games",
      "details": "The game is the Letter C!",
      "desc": "B=1,1,1,1,1 \n I=1,0,0,0,1 \n N=1,0,3,0,1 \n G=1,0,0,0,1 \n O=1,0,0,0,1"
    },
    {
      "name": "Letter: E",
      "group": "Letter Games",
      "details": "The game is the Letter E!",
      "desc": "B=1,1,1,1,1 \n I=1,0,1,0,1 \n N=1,0,8,0,1 \n G=1,0,1,0,1 \n O=1,0,1,0,1"
    },
    {
      "name": "Letter: F",
      "group": "Letter Games",
      "details": "The game is the Letter F! F is for Fy-field!",
      "desc": "B=1,1,1,1,1 \n I=1,0,1,0,0 \n N=1,0,8,0,0 \n G=1,0,1,0,0 \n O=1,0,1,0,0"
    },
    {
      "name": "Letter: H",
      "group": "Letter Games",
      "details": "The game is the Letter H!",
      "desc": "B=1,1,1,1,1 \n I=0,0,1,0,0 \n N=0,0,8,0,0 \n G=0,0,1,0,0 \n O=1,1,1,1,1",
      "ignores": ["N"]     
    },
    {
      "name": "Letter: I",
      "group": "Letter Games",
      "details": "The game is the Letter I!",
      "desc": "B=1,0,0,0,1 \n I=1,0,0,0,1 \n N=1,1,8,1,1 \n G=1,0,0,0,1 \n O=1,0,0,0,1"
    },
    {
      "name": "Letter: L",
      "group": "Letter Games",
      "details": "The game is the Letter L!",
      "desc": "B=1,1,1,1,1 \n I=0,0,0,0,1 \n N=0,0,3,0,1 \n G=0,0,0,0,1 \n O=0,0,0,0,1"
    },
    {
      "name": "Letter: M",
      "group": "Letter Games",
      "details": "The game is the Letter M!",
      "desc": "B=1,1,1,1,1 \n I=0,1,0,0,0 \n N=0,0,8,0,0 \n G=0,1,0,0,0 \n O=1,1,1,1,1",
      "ignores": ["N"]     
    },
    {
      "name": "Letter: N",
      "group": "Letter Games",
      "details": "The game is the Letter N!",
      "desc": "B=1,1,1,1,1 \n I=0,1,0,0,0 \n N=0,0,8,0,0 \n G=0,0,0,1,0 \n O=1,1,1,1,1",
      "ignores": ["N"]     
    },
    {
      "name": "Letter: P",
      "group": "Letter Games",
      "details": "The game is the Letter P!",
      "desc": "B=1,1,1,1,1 \n I=1,0,1,0,0 \n N=1,0,8,0,0 \n G=1,0,1,0,0 \n O=1,1,1,0,0"
    },
    {
      "name": "Letter: S",
      "group": "Letter Games",
      "details": "The game is the Letter S!",
      "desc": "B=1,1,1,0,1 \n I=1,0,1,0,1 \n N=1,0,8,0,1 \n G=1,0,1,0,1 \n O=1,0,1,1,1"
    },
    {
      "name": "Letter: T",
      "group": "Letter Games",
      "details": "The game is the Letter T!",
      "desc": "B=1,0,0,0,0 \n I=1,0,0,0,0 \n N=1,1,8,1,1 \n G=1,0,0,0,0 \n O=1,0,0,0,0"
    },
    {
      "name": "Letter: U",
      "group": "Letter Games",
      "details": "The game is the Letter U!",
      "desc": "B=1,1,1,1,1 \n I=0,0,0,0,1 \n N=0,0,3,0,1 \n G=0,0,0,0,1 \n O=1,1,1,1,1"
    },
    {
      "name": "Letter: W",
      "group": "Letter Games",
      "details": "The game is the Letter W!",
      "desc": "B=1,1,1,1,1 \n I=0,0,0,1,0 \n N=0,0,8,0,0 \n G=0,0,0,1,0 \n O=1,1,1,1,1",
      "ignores": ["N"]
    },
    {
      "name": "Letter: X",
      "group": "Letter Games",
      "details": "The game is the Letter X!",
      "desc": "B=1,0,0,0,1 \n I=0,1,0,1,0 \n N=0,0,8,0,0 \n G=0,1,0,1,0 \n O=1,0,0,0,1",
      "ignores": ["N"]
    },
    {
      "name": "Letter: Y",
      "group": "Letter Games",
      "details": "The game is the Letter Y!",
      "desc": "B=1,0,0,0,0 \n I=0,1,0,0,0 \n N=0,0,8,1,1 \n G=0,1,0,0,0 \n O=1,0,0,0,0"
    },
    {
      "name": "Letter: Z",
      "group": "Letter Games",
      "details": "The game is the Letter Z!",
      "desc": "B=1,0,0,0,1 \n I=1,0,0,1,1 \n N=1,0,8,0,1 \n G=1,1,0,0,1 \n O=1,0,0,0,1"
    }
];

// The letters and their corresponding numbers
const BingoLetters = 
	{
		"B": [1,15],
		"I": [16,30],
		"N": [31,45],
		"G": [46,60],
		"O": [61,75]
	};

const bingo_version = "2.5";
(function add_bingo_version(){ 
	document.getElementsByTagName("body")[0].innerHTML += `<p id="bingo_version" class="dlf_paragraph_medium">v${bingo_version}</p>`
}());

//************CLASS: BINGO CARD ************************************************************************************************************
// Used to represent a single card
class BingoCard {

    constructor(cardData, isExample=false, isVariation=false) {

        this.CardID = cardData?.["id"] ?? "";
        this.FullName = cardData?.["name"] ?? this.getRandomName();
        this.Name = this.getCardName();
        this.Code = this.getCardCode();
        this.Group = cardData?.["group"] ?? "";
        this.Desc  = cardData?.["details"] ?? "";
        this.IgnoreLetters = cardData?.["ignores"] ?? [];

        // Flag this card as different types
        this.IsExample = isExample;
        this.IsVariation = isVariation;
        this.IsRandom = (this.Name == "RANDOM");
        this.IsFreeSpaceRequired = false;
        
        // Required Slots (based on key)
        this.RequiredSlots = []; 

        // Set the card numbers
        this.Numbers = [];
        this.NumberCells = this.getCardNumbers(cardData?.["desc"] ?? "");

        // Set variations (if applicable)
        this.Variations = [];
        this.#setVariations( cardData?.["variations"] ?? [] )
    }

    // Return a random name
    getRandomName(){
        let gameCode = Helper.getCode();
        return `RANDOM - ${gameCode}`;
    }

    // Get just the name; 
    getCardName(){
        var splits = this.FullName.split(" - ");
        var result = (splits.length > 0) ? splits[0] : "";
        return result;
    }

    // Set the card Code
    getCardCode(){
        var splits = this.FullName.split(" - ");
        var result = (splits.length > 1) ? splits[1] : splits[0];
        return result;
    }

    // Get a mapping of the numbers;
    getCardNumbers(numberString="") { 
        // If no specific numbers passed, then use random ones
        numberString = (numberString == "") ? this.getRandomNumbersString() : numberString;
        let arr = numberString.split("\n");
        let numbersMap = {};

        arr.forEach( (val)=>{
            val = val.trim() // trim any spaces;

            // Then map the letters to their letters
            let splits = val.split("=");
            let letter = splits[0];
            let numbers = splits[1].split(",")

            // Loop through the numbers
            for (var idx in numbers){
                let cardIdx = Number(idx)+1;
                let cardNum = numbers[idx];
                let stateNum = cardNum == "" ? "FS" : cardNum;

                let cardKey = `${letter.toUpperCase()}${cardIdx}`;

                this.Numbers.push(stateNum); // Add the list of Numbers in order

                if(this.IsExample){
                    if(cardNum != "0" && cardNum != "3"){
                        this.RequiredSlots.push(cardKey);
                    }
                    if(cardNum == "8"){ this.IsFreeSpaceRequired = true; }
                    cardNum = ( ["3", "8", "FS"].includes(cardNum) ) ? "FREE" : (cardNum == "1") ? "X" : "-";

                } else {
                    cardNum = (stateNum == "FS") ? this.#getFreeSpaceIcon() : cardNum; 
                }
                numbersMap[cardKey] = cardNum;
            }
        });
        return numbersMap;
    }

    // Get the number range for a letter
    getNumberRange(letter){
        if(!BingoLetters.hasOwnProperty(letter)){ return [0,0]; }
        return BingoLetters[letter];
    }
        
    // Get random numbers
    getRandomNumbers(){
        var letters = ["B", "I", "N", "G", "O"];
        var numbers = {};
        letters.forEach( (letter) => {
            var range = this.getNumberRange(letter);
            let min = range[0];
            let max = range[1];
            // Set of numbers; 5 unique;
            let numSet = new Set();
            while(numSet.size < 5){
                let randNum = Math.floor(Math.random() * (max - min + 1) + min);
                let numToAdd = (letter == "N" && numSet.size == 2) ? "FS" : randNum;
                numSet.add(numToAdd);
            }
            numbers[letter] = Array.from(numSet);
        });
        return numbers;
    }

    // Get the random numbers -- as a string
    getRandomNumbersString(){
        let randomNumbers = this.getRandomNumbers();
        randomNumbers.AllNumbers
        let numberStrings = [];
        Object.keys(randomNumbers).forEach( (key) =>{
            let nums = randomNumbers[key].join(",");
            let keyString = `${key}=${nums}`;
            numberStrings.push(keyString);
        });
        return numberStrings.join("\n");
    }

    // Get the set of required slots 
    getRequiredSlots() {
      var requiredSlots = (this.Variations.length > 0) ? this.Variations.map( x => x.RequiredSlots ) : [this.RequiredSlots];
      return requiredSlots;
    }

    // Return if this card is currently in BINGO (meaning it has all the required slots filled)
    isBingo(numbers=[], requiredSlots=[[]] ) {
        var results = {
          "verdict": false,
          "slots": []
        }
        for(var idx in requiredSlots){
          var slots = requiredSlots[idx];
          var slotsFilled = 0;
          slots.forEach( (key) =>{
              let isFreeSpace = (key == "N3");
              let cardHasNum = numbers.includes(this.NumberCells[key]);
              slotsFilled += (isFreeSpace || cardHasNum ) ? 1 : 0;
          });
          if(slotsFilled == slots.length){
            results["verdict"] = true;
            results["slots"] = slots;
            break;
          }
        }
        return results;
    }

    // Get the template for a card template for a card (ignore variation)
    async getTemplates(type=""){
      var templates = [];
        var cards = (this.Variations.length > 0) ? this.Variations : [this];
        for(var idx in cards){
          var template = await cards[idx].#getCardTemplate(type);
          templates.push(template);
        }
        return templates;
    }

    // PRIVATE: Get the template for a single card (could be a variation)
    async #getCardTemplate(type=""){
        // return this.CardTable;
        let templatePath = "";
        type = (this.IsExample) ? "example" : type;
        switch(type)
        {
            case "example":
                templatePath = "/src/templates/examples/cardExample.html";
                break;
            case "create":
                templatePath = "/src/templates/card/cardCreate.html";
                break;
            case "load":
                templatePath = "/src/templates/card/cardLoad.html";
                break;
            case "board":
                templatePath = "/src/templates/card/boardCard.html";
                break;
            default: // default is "play"
                templatePath = "/src/templates/card/cardPlay.html"
                break;
        };      
        let cardTemplateObj = this.#getCardTemplateObject(type);

        return new Promise( (resolve) => {
            MyTemplates.getTemplate(templatePath, cardTemplateObj, (template) =>{
                resolve(template);
            });
        });
    }

    // PRIVATE: Get object for template building
   #getCardTemplateObject(type=""){ 
        let template = this.NumberCells;
        template["Name"] = this.Name;
        template["CardID"] = this.CardID;
        template["Code"] = this.Code;
        template["IsRandom"] = (this.IsRandom) ? "random" : "hidden";
        template["FreeSpaceReq"] = (this.IsFreeSpaceRequired) ? "Required" : "";

        if(type == "create"){
            template["B-Options"] = this.#getNumberOptions("B");
            template["I-Options"] = this.#getNumberOptions("I");
            template["N-Options"] = this.#getNumberOptions("N");
            template["G-Options"] = this.#getNumberOptions("G");
            template["O-Options"] = this.#getNumberOptions("O");
        }
        return template;
    }

      // Get the icon to use for the free space
      #getFreeSpaceIcon() {
        return `<span class='freeSpace number_cell'><i class="number_cell fa fa-star-o"></i></span>`;
      }

    // PRIVATE: Get the set of <option> tags based on a given letter;
    #getNumberOptions(letter) {
        var range = this.getNumberRange(letter);
        if(range[0] == 0){ return ""; }
        let options = "";
        for(var idx = range[0]; idx < range[1]+1; idx++){
            options += `<option value="${idx}">${idx}</option>`;
        }
        return options;
    }
    // PRIVATE: Set "child" card variations
    #setVariations(variations=[]){
      if(variations.length == 0){
        return;
      }
      this.Variations = variations.map( (vari, idx) => {
        var baseObj = {
          "group": this.Group,
          "details": this.Desc,
          "name": `${this.Name} ~ ${idx}`,
          "desc": `${vari}`
        }
        var card = new BingoCard(baseObj, true);
        return card;
      });
    }
}

//************CLASS: BINGO GAME ************************************************************************************************************
// Used to represent a single game of BINGO
class BingoGame {

    constructor(name=""){
        this.Name = name;
        this.LetterCounts = { "B": 0, "I": 0, "N": 0, "G": 0,"O": 0 };
        // Keep track of all numbers called;
        this.NumbersCalled = new Set();
    }

    // Add number called
    addNumberCalled(number){ 
        this.NumbersCalled.add(number);
    }

    // Remove number called
    removeNumberCalled(number) {
        this.NumbersCalled.delete(number);
    }

    // Get all the numbers called
    getNumbersCalled(){
        return Array.from(this.NumbersCalled);
    }

    // Get one of the remaining numbers
    getRandomBall(){
        // Default results
        var results = { "Letter":"", "Number":"", "Ball":"", "AllNumbers":false};

        // Get set of random remaining cells
        var remainingCells = document.getElementsByClassName("cell_unseen");
        var cellCount = remainingCells.length;
        // If none, then nothing to do;
        if(cellCount == 0){
            return results;
        }

        var randNum = Math.floor(Math.random() * cellCount);

        // Get the cell
        var cell = remainingCells[randNum];
        cell.classList.remove("cell_unseen");
        cell.classList.add("cell_seen");

        // Get letter & number
        var letter = cell.getAttribute("data-letter");
        var number = cell.innerText;

        // Get the ball
        var ball = this.#getBall(letter, number);

        // Keep count of numbers called (and how many per letter)
        this.addNumberCalled(number);
        var allNums = this.#incrementLetterCount(letter);

        results = {
            "Letter":letter,
            "Number":number,
            "BingoNum": `${letter} ${number}`,
            "Ball": ball,
            "AllNumbers": allNums
        };

        return results;
    }

    // PRIVATE: Get a ball (given a bingo number)
    #getBall(letter, number){
        let letterLower = letter.toLowerCase();
        let ball = `<span id="selected_cell" class="theme_black_bg bingo_ball_circle bingo_ball_letter_${letterLower}">${letter} ${number}</span>`;
        return ball;
    }

    // Increment letter count
    #incrementLetterCount(letter){
        this.LetterCounts[letter] += 1;
        return (this.LetterCounts[letter] >= 15);
    }
}

//************CLASS: BINGO BOARD ************************************************************************************************************
// Used to represent a BOARD (or page) used for BINGO
class BingoBoard {

	constructor() {
		this.Cards = {}; // TYPE: {<string>:<BingoCard>}
		this.Game = new BingoGame();
		this.GameStarted = false;

    // Special cards for straight lines;
    // this.#setStraightLineCards();
	}

    // For new games, create a whole new instance of BingoGame
	newGame(name=""){ this.Game = new BingoGame(name); }
 
  // Set the selected game
  setGameName(name){  this.Game.Name = name; }
  // Get the name of the game
  getGameName(){  return this.Game.Name; }
  // Return boolean if game has "started" (i.e. has a valid card)
  gameStarted(){ return (this.getGameCard() != undefined) }
  // Get the card that matches the game's name
  getGameCard(){  return this.getCard( this.getGameName() ); }
  // Get the required slots of the current game
  getRequiredSlots(){ if(this.Game.Name != ""){ return this.getGameCard()?.getRequiredSlots(); } }

  
  // Set the map of cards for this Board/Page
  setCards(cards=[], isExample=false){
      // If given, use the set of cards
      if(cards.length > 0){
          cards.forEach( (card) => {
              try
              {
                  var cardObject = card;
                  var type = (card.constructor.name);
                  if(type != "BingoCard"){
                      cardObject = new BingoCard(card, isExample);
                  }
                  this.Cards[cardObject.Code] = cardObject;
              } catch(e){ console.error(e); }
          });
      }
      
  }

  // PRIVATE: Set the different variations of Straight Line Cards
  #setStraightLineCards(){
    var striaghtLines = BingoGames.filter(x => (x.name == "Straight Line") )?.[0];
    var variations = striaghtLines?.variations ?? [];
    
    
    
    var baseObj = {
      "group":striaghtLines.group,
      "details":striaghtLines.group,
    }
    // Create a card for each variation
    variations.forEach( (vari, idx) => {
      baseObj["name"] = `${striaghtLines.name} ~ #${(idx+1)}`;
      baseObj["desc"] = vari;
      var card = new BingoCard(baseObj, true);
      this.Cards[card.Code] = card;
    });
  }

  // Get a specific card (based on given code);
  getCard(code) { 
      try {
          var card = (this.Cards.hasOwnProperty(code)) ? this.Cards[code] : undefined;
          return card;
      } catch (e){ console.error(e); }
  }
  // Get all cards that are NON-Example cards
  getPlayCards(){
      var cards = Object.values(this.Cards);
      cards = cards.filter(x => !x.IsExample);
      return cards.filter( x => !x.IsExample);
  }


  // Add a number that has been selected/called on the board
  addNumber(number){
      this.Game.addNumberCalled(number);
  }
  // Remove a number that was selected/called
  removeNumber(number) {
      this.Game.removeNumberCalled(number);
  }
  // Get the numbers called
  getNumbers(){
      return this.Game.getNumbersCalled();
  }

	// Get Game Options <option> Tags
	getGameOptions() {
		// let cardObjs = Object.values(this.Cards).filter(x => !x.IsVariation);
		let cardObjs = Object.values(this.Cards);
		var optgroups = {};
		cardObjs.forEach( (card) => {
			let group = card.Group;
			let key = card.Name;

			if(!optgroups.hasOwnProperty(group)) {
				optgroups[group] = `<optgroup label="${group}">`
			}
			var option = "<option class='game_option' value=\"" + key + "\">" + key + "</option>";
			optgroups[group] += option;
		});

		// Build the set of options
		var options = "<option value=''>SELECT GAME...</option>";
		Object.keys(optgroups).forEach( (key)=>{
			var group = optgroups[key];
			group += "</optgroup>";
			options += group;
		});
		return options;
	}
}
