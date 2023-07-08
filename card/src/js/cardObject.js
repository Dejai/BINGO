
/*
    A new object to represent a single Card; Used to loading & validing cards
*/


class CardObject {

    constructor(cardData, isExample=false) {

        this.CardID = cardData["id"] ?? "";
        this.FullName = cardData["name"];
        this.Name = this.getCardName();
        this.Code = this.getCardCode();

        // Get description for example cards
        this.Group = cardData["group"] ?? "";
        this.Desc  = cardData["details"] ?? "";
        this.Ignores = cardData["ignores"] ?? [];

        // Flag this card as different types
        this.IsExample = isExample;
        this.IsRandom = (this.Name == "RANDOM");
        this.IsFreeSpaceRequired = false;
        
        // Required Slots (based on key)
        this.RequiredSlots = []; 

        // Set the card numbers
        this.Numbers = [];
        this.NumberCells = this.getCardNumbers(cardData["desc"]);
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
        var result = (splits.length > 1) ? splits[1] : "";
        return result;
    }

    // Get the icon to use for the free space
    getFreeSpaceIcon() {
        return `<span class='freeSpace number_cell'><i class="number_cell fa fa-star-o"></i></span>`;
    }

    // Get a mapping of the numbers;
    getCardNumbers(numberString) { 
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
                    if(cardNum != "0"){
                        this.RequiredSlots.push(cardKey);
                    }

                    if(cardNum == "8"){ this.IsFreeSpaceRequired = true; }
                    cardNum = ( ["3", "8", "FS"].includes(cardNum) ) ? "FREE" : (cardNum == "1") ? "X" : "-";
                    
                    

                } else {
                    cardNum = (stateNum == "FS") ? this.getFreeSpaceIcon() : cardNum; 
                }
                numbersMap[cardKey] = cardNum;
            }
        });
        return numbersMap;
    }

    // Set the card's state (based on a set of given called numbers)
    getCardState(givenNumbers=[]) {
        
        console.log("Get State");

        var state = "";
        if(this.IsExample){
            state = this.Numbers.join("");
        } else {
            for(var idx = 0; idx < this.Numbers.length; idx++){
                let currNum = this.Numbers[idx];
                state += givenNumbers.includes(currNum) ? "1" : "0";
            }
        }
        return state;
    }


    // Card has required slots filled (given a set of numbers and required slots)
    hasRequiredSlotsFilled(numbers=[], requiredSlots=[]){

        console.log("Checking required Slots");
        var slotsFilled = 0;
        console.log(requiredSlots);
        console.log(this);

        requiredSlots.forEach( (key) =>{
            let isFreeSpace = (key == "N3");
            let cardHasNum = numbers.includes(this.NumberCells[key]);
            console.log(cardHasNum + key);
            slotsFilled += (isFreeSpace || cardHasNum ) ? 1 : 0;
        });

        return (slotsFilled == requiredSlots.length);
    }

    // Get the actual card representation
    async getCardTable(){
        // return this.CardTable;
        let templatePath = (this.IsExample) ? "/examples/src/templates/cardExample.html" : "/card/src/templates/cardPlay.html";
        let cardTemplateObj = this.getCardTemplateObject();

        return new Promise( (resolve) => {
            MyTemplates.getTemplate(templatePath, cardTemplateObj, (template) =>{
                resolve(template);
            });
        });
    }

    // Get object for template building
    getCardTemplateObject(){ 
        let template = this.NumberCells;
        template["Code"] = this.Code;
        template["IsRandom"] = (this.IsRandom) ? "random" : "hidden";
        template["FreeSpaceReq"] = (this.IsFreeSpaceRequired) ? "Required" : "";
        return template;
    }

}