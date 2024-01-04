// The details (from Cloudflare) for a Bingo game
class BingoCardDetails {
    constructor(jsonObj){
        this.Key = jsonObj?.key ?? "";
        this.CardName = jsonObj?.cardName ?? "";
        this.B = jsonObj?.b ?? "";
        this.I = jsonObj?.i ?? "";
        this.N = jsonObj?.n ?? "";
        this.G = jsonObj?.g ?? "";
        this.O = jsonObj?.o ?? "";
        this.Date = jsonObj?.date ?? new Date();
    }
}

// The Bingo card as used on the site
class BingoCard {
    constructor(bingoCard){
        this.Details = new BingoCardDetails(bingoCard);
        this.SlotsFilled = new Set();  
        // Setup each letter as a separate attribute
        var bingo = "BINGO";
        for(var letter of bingo){
            var idx = 1;
            var nums = this.Details[letter]?.split(",") ?? [];
            for(var n of nums){
                var key = letter + idx;
                this[key] = n.replaceAll("FS", `<span class='freeSpace number_cell'><i class="number_cell fa-regular fa-star"></i></span>`);
                idx ++;
            }
        }
    }

    // Reset this card
    reset(){ this.SlotsFilled = new Set(); }

    // Adding and removing slot
    addSlot(slot){ this.SlotsFilled.add(slot); }
    removeSlot(slot){ if(this.SlotsFilled.has(slot)){ this.SlotsFilled.delete(slot) } }

    // Check if this card has seen a specific list of numers (i.e. balls);
    hasSlotsFilled(list){ return (list.length > 0) && (list.map(slot => this.SlotsFilled.has(slot))?.filter(y => y == false)?.length == 0); }

    // Set slots based on balls seen
    setSlotsFilled(balls, setFreeSlot=false){
      // Setting the free slot if it is marked to be set
      if(setFreeSlot && !this.SlotsFilled.has("N3")) {         this.SlotsFilled.add("N3");     } 
      else if (!setFreeSlot && this.SlotsFilled.has("N3")) {  this.SlotsFilled.delete("N3");  }

      for(var ball of Array.from(balls)){
        var cardAttribute = Array.from(Object.entries(this)).filter( arr => arr[0][0]+arr[1] == ball)?.[0] ?? [];
        if(cardAttribute.length > 0){
          this.SlotsFilled.add(cardAttribute[0]);
        }
      }
    }
    
    // Check if the card has seen all the numbers in the required slots
    hasBingo(bingoGame){
      var results = false;
      try {
        console.log("Checking this card for bingo");
        console.log(this.SlotsFilled);
        console.log(bingoGame.RequiredSlots);
        // If this game has straightlines, check those
        if(bingoGame.StraightLines.length > 0){
          for(var line of bingoGame.StraightLines) {
            results = this.hasSlotsFilled(line);
            if(results){ break; }
          }
        } else { 
          results = this.hasSlotsFilled(bingoGame.RequiredSlots);
        }
      } catch(err){
        MyLogger.LogError(err);
      } finally {
        return results;
      }
    }
}

// Keep track of cards on a page
class BingoCardTracker {
  constructor(){
    this.Cards = {};
  }
  addCard(bingoCard){ this.Cards[bingoCard.Details.Key] = bingoCard;}
  getCard(key){ return this.Cards[key] ?? undefined;  }
  getFirstCard(){ return Object.values(this.Cards)?.[0] ?? undefined; }

}

// Keep track of bingo balls
class BingoBalls {

  constructor(){
    this.Called = new Set();
    this.Balls = new Set();
    this.Letters = {
      "B": { "start": 1, "end": 15, "counter": 0 },
      "I": { "start": 16, "end": 30, "counter": 0 },
      "N": { "start": 31, "end": 45, "counter": 0 },
      "G": { "start": 46, "end": 60, "counter": 0 },
      "O": { "start": 61, "end": 75, "counter": 0 }
    }
    this.newBalls();
  }

  // Set the balls to use in a game
  newBalls(ignores=[]){
    this.Called = new Set();
    this.Balls = new Set();
    // Add balls based on list of letters
    for(var letter of Object.keys(this.Letters)) {
      this.Letters[letter].counter = 0;
      if(!ignores.includes(letter)){
        var details = this.Letters[letter];
        for(var idx = details.start; idx < details.end+1; idx++){
          this.Balls.add(letter + idx);
        }
      }
    }
  }

  // Get some basic ball details
  #getBallLetter(ball=""){ return ball[0]; }
  #getBallNumber(ball=""){ return ball.substring(1); }

  getBallHml(ball=""){
    var letter = this.#getBallLetter(ball);
    var number = this.#getBallNumber(ball);
    var letterLower = letter.toLowerCase();
    return `<span id="selected_cell" class="theme_black_bg bingo_ball_circle bingo_ball_letter_${letterLower}">${letter} ${number}</span>`;
  }

  // Get the text from the ball in a readable way
  getBallText(ball){
    var letter = this.#getBallLetter(ball);
    var number = this.#getBallNumber(ball);
    return `${letter} ${number}`;
  }

  // Get the amount of letters already called for this 
  getLetterCount(ball){
    var letter = this.#getBallLetter(ball);
    return this.Letters[letter]?.counter ?? 0;
  }

  // Get a random ball from the pool of balls
  getRandomBall(){
    var ball = "";
    try {
      var keys = Array.from(this.Balls.keys());
      if(keys.length == 0){
        throw new Error("No more balls to pick from");
      }
      var rand = Math.floor(Math.random()*keys.length);
      ball = keys[rand];
      // Adjust sets & account for newly selected ball
      this.Called.add(ball);
      this.Balls.delete(ball);
      var letter = this.#getBallLetter(ball);
      this.Letters[letter].counter += 1;
    } catch(err){
      MyLogger.LogError(err);
    } finally {
      return ball;
    }
  }
}

// A clas to represent the set of bingo games
class BingoGame {
    constructor(details){
        this.Name = details?.name ?? "";
        this.Group = details?.group ?? "";
        this.Description = details?.description ?? "";
        this.SlotDetails = details?.slotDetails ?? "";
        this.Variations = details?.variations ?? [];
        this.Ignores = details?.ignores ?? [];

        // The required vs optional slots
        this.StraightLines = details?.straightLines ?? [];//?.map(x => new Set(x));
        this.RequiredSlots = [];
        this.OptionalSlots = [];
        this.setSlotRequirements();
    }

    // Make note of which slots are required for this game
    setSlotRequirements(){
        var columns = this.SlotDetails.split("\n");
        for(var column of columns){
            var splits = column.split("=").map(x => x.trim());
            var letter = splits[0];
            var slots = splits[1]?.split(",") ?? [];
            var idx = 1;
            for(var slot of slots){
                var key = letter+idx;
                if(slot == "/"){
                    this.OptionalSlots.push(key);
                } else if(slot == "X") {
                    this.RequiredSlots.push(key);
                }
                idx++;
            }
        }
    }

    // Return if this game requires the Free slot
    hasFreeSlotRequired(){
      return this.RequiredSlots.includes("N3");
    }
}

// Given a set of games, setup the <option> list
class BingoGameDictionary {
    constructor(games=[]){
        this.Games = games;
        this.Games = {};
        this.Options = "";
        this.setGames(games);
    }

    getGame(key){
        return this.Games[key] ?? {};
    }

    setGames(games) {
        var optGroups = {};
        var options = "";
        for(var game of games) {
            this.Games[game.Name] = game;  // add game to the map
            var groupKey = game.Group;
            var gameName = game.Name;
            optGroups[groupKey] = optGroups[groupKey] ?? [];
            //  `<optgroup label="${groupKey}">`;
			var option = `<option class="game_option" value="${gameName}">${gameName}</option>`;
            optGroups[groupKey].push(option);
        }

        // For all groups, set the options
        for(var group of Object.keys(optGroups)) {
            this.Options +=  `<optgroup label="${group}">` + optGroups[group].join("") + "</optgroup>";
        }
	}
}

//A set of Games
const BingoGames = [
  {
    "name": "Full House",
    "group": "Classic Games",
    "description": "The game is Full House. All the spaces on your card.",
    "slotDetails": "B=X,X,X,X,X \n I=X,X,X,X,X \n N=X,X,X,X,X \n G=X,X,X,X,X \n O=X,X,X,X,X"
  },
  {
    "name": "Inner Box",
    "group": "Classic Games",
    "description": "The game is Inner Box",
    "slotDetails": "B=*,*,*,*,* \n I=*,X,X,X,* \n N=*,X,/,X,* \n G=*,X,X,X,* \n O=*,*,*,*,*",
    "ignores": ["B","O"]
  },
  {
    "name": "Outer Box",
    "group": "Classic Games",
    "description": "The game is Outer Box",
    "slotDetails": "B=X,X,X,X,X \n I=X,*,*,*,X \n N=X,*,/,*,X \n G=X,*,*,*,X \n O=X,X,X,X,X"
  },
  {
    "name": "Straight Line",
    "group": "Classic Games",
    "description": "The game is any Straight Line. Any vertical, horizontal, or diagonal line of 5",
    "slotDetails": "B= /,/,/,/,/ \n I= /,/,/,/,/ \n N= /,/,/,/,/ \n G= /,/,/,/,/ \n O= /,/,/,/,/",
    "straightLines": [
      // Columns
      ["B1", "B2", "B3", "B4", "B5"],
      ["I1", "I2", "I3", "I4", "I5"],
      ["N1", "N2", "N3", "N4", "N5"],
      ["G1", "G2", "G3", "G4", "G5"],
      ["O1", "O2", "O3", "O4", "O5"],
      // Diag
      ["B1", "I2", "N3", "G4", "O5"],
      ["B5", "I4", "N3", "G2", "O1"],
      // Rows
      ["B1", "I1", "N1", "G1", "O1"],
      ["B2", "I2", "N2", "G2", "O2"],
      ["B3", "I3", "N3", "G3", "O3"],
      ["B4", "I4", "N4", "G4", "O4"],
      ["B5", "I5", "N5", "G5", "O5"]
    ]
  },
  {
    "name": "Bird",
    "group": "Random Games",
    "description": "The game is Bird. Down the N, and across the middle row.",
    "slotDetails": "B=*,*,X,*,* \n I=*,*,X,*,* \n N=X,X,X,X,X \n G=*,*,X,*,* \n O=*,*,X,*,*"
  },
  {
    "name": "Greater Than",
    "group": "Random Games",
    "description": "The game is Greater Than. The greater than symbol.",
    "slotDetails": "B=X,*,*,*,X \n I=*,X,*,X,* \n N=*,*,X,*,* \n G=*,*,*,*,* \n O=*,*,*,*,*",
    "ignores": ["N","G","O"]
  },
  {
    "name": "Grid",
    "group": "Random Games",
    "description": "The game is Grid. Down the B, down the N, and down…across the middle row, and across the bottom row.",
    "slotDetails": "B=X,X,X,X,X \n I=X,*,X,*,X \n N=X,X,X,X,X \n G=X,*,X,*,X \n O=X,X,X,X,X"
  },
  {
    "name": "Ladder",
    "group": "Random Games",
    "description": "The game is Ladder. Across the top row, middle row, and bottom row",
    "slotDetails": "B=X,*,X,*,X \n I=X,*,X,*,X \n N=X,*,X,*,X \n G=X,*,X,*,X \n O=X,*,X,*,X"
  },
  {
    "name": "Less Than",
    "group": "Random Games",
    "description": "The game is Less Than. The less than symbol.",
    "slotDetails": "B=*,*,*,*,* \n I=*,*,*,*,* \n N=*,*,X,*,* \n G=*,X,*,X,* \n O=X,*,*,*,X",
    "ignores": ["B","I","N"]
  },
  {
    "name": "Popsicle",
    "group": "Random Games",
    "description": "The game is Popsicle. The shape looks like a popsicle.",
    "slotDetails": "B=*,*,*,*,* \n I=X,X,X,*,* \n N=X,X,X,X,X \n G=X,X,X,*,* \n O=*,*,*,*,*",
    "ignores": ["B","O"]

  },
  {
    "name": "Stripes",
    "group": "Random Games",
    "description": "The game is Stripes. Down the B, N, and O",
    "slotDetails": "B=X,X,X,X,X \n I=*,*,*,*,* \n N=X,X,X,X,X \n G=*,*,*,*,* \n O=X,X,X,X,X",
    "ignores": ["I","G"]
  },
  {
    "name": "Toy Car",
    "group": "Random Games",
    "description": "The game is Toy Car. Down the N, and add some wheels",
    "slotDetails": "B=*,*,*,*,* \n I=*,X,*,X,* \n N=X,X,X,X,X \n G=*,X,*,X,* \n O=*,*,*,*,*",
    "ignores": ["B","O"]
  },
  {
    "name": "Train Tracks",
    "group": "Random Games",
    "description": "The game is Train Tracks. Down the I and G",
    "slotDetails": "B=*,*,*,*,* \n I=X,X,X,X,X \n N=*,*,/,*,* \n G=X,X,X,X,X \n O=*,*,*,*,*",
    "ignores": ["B","N", "O"]
  },
  {
    "name": "Winner's Podium",
    "group": "Random Games",
    "description": "The game is Winner's Podium. Bottom row, the middle three in the 4th row, and the Free Space.",
    "slotDetails": "B=*,*,*,*,X \n I=*,*,*,X,X \n N=*,*,X,X,X \n G=*,*,*,X,X \n O=*,*,*,*,X"
  },
  {
    "name": "Letter: A",
    "group": "Letter Games",
    "description": "The game is the Letter A",
    "slotDetails": "B=X,X,X,X,X \n I=X,*,X,*,* \n N=X,*,X,*,* \n G=X,*,X,*,* \n O=X,X,X,X,X"
  },
  {
    "name": "Letter: B",
    "group": "Letter Games",
    "description": "The game is the Letter B",
    "slotDetails": "B=X,X,X,X,X \n I=X,*,X,*,X \n N=X,*,X,*,X \n G=X,*,X,*,X \n O=X,X,X,X,X"
  },
  {
    "name": "Letter: C",
    "group": "Letter Games",
    "description": "The game is the Letter C",
    "slotDetails": "B=X,X,X,X,X \n I=X,*,*,*,X \n N=X,*,/,*,X \n G=X,*,*,*,X \n O=X,*,*,*,X"
  },
  {
    "name": "Letter: E",
    "group": "Letter Games",
    "description": "The game is the Letter E",
    "slotDetails": "B=X,X,X,X,X \n I=X,*,X,*,X \n N=X,*,X,*,X \n G=X,*,X,*,X \n O=X,*,X,*,X"
  },
  {
    "name": "Letter: F",
    "group": "Letter Games",
    "description": "The game is the Letter F. F is for Fy-field",
    "slotDetails": "B=X,X,X,X,X \n I=X,*,X,*,* \n N=X,*,X,*,* \n G=X,*,X,*,* \n O=X,*,X,*,*"
  },
  {
    "name": "Letter: H",
    "group": "Letter Games",
    "description": "The game is the Letter H",
    "slotDetails": "B=X,X,X,X,X \n I=*,*,X,*,* \n N=*,*,X,*,* \n G=*,*,X,*,* \n O=X,X,X,X,X",
    "ignores": ["N"]     
  },
  {
    "name": "Letter: I",
    "group": "Letter Games",
    "description": "The game is the Letter I",
    "slotDetails": "B=X,*,*,*,X \n I=X,*,*,*,X \n N=X,X,X,X,X \n G=X,*,*,*,X \n O=X,*,*,*,X"
  },
  {
    "name": "Letter: L",
    "group": "Letter Games",
    "description": "The game is the Letter L",
    "slotDetails": "B=X,X,X,X,X \n I=*,*,*,*,X \n N=*,*,/,*,X \n G=*,*,*,*,X \n O=*,*,*,*,X"
  },
  {
    "name": "Letter: M",
    "group": "Letter Games",
    "description": "The game is the Letter M",
    "slotDetails": "B=X,X,X,X,X \n I=*,X,*,*,* \n N=*,*,X,*,* \n G=*,X,*,*,* \n O=X,X,X,X,X",
    "ignores": ["N"]     
  },
  {
    "name": "Letter: N",
    "group": "Letter Games",
    "description": "The game is the Letter N",
    "slotDetails": "B=X,X,X,X,X \n I=*,X,*,*,* \n N=*,*,X,*,* \n G=*,*,*,X,* \n O=X,X,X,X,X",
    "ignores": ["N"]     
  },
  {
    "name": "Letter: P",
    "group": "Letter Games",
    "description": "The game is the Letter P",
    "slotDetails": "B=X,X,X,X,X \n I=X,*,X,*,* \n N=X,*,X,*,* \n G=X,*,X,*,* \n O=X,X,X,*,*"
  },
  {
    "name": "Letter: S",
    "group": "Letter Games",
    "description": "The game is the Letter S",
    "slotDetails": "B=X,X,X,*,X \n I=X,*,X,*,X \n N=X,*,X,*,X \n G=X,*,X,*,X \n O=X,*,X,X,X"
  },
  {
    "name": "Letter: T",
    "group": "Letter Games",
    "description": "The game is the Letter T",
    "slotDetails": "B=X,*,*,*,* \n I=X,*,*,*,* \n N=X,X,X,X,X \n G=X,*,*,*,* \n O=X,*,*,*,*"
  },
  {
    "name": "Letter: U",
    "group": "Letter Games",
    "description": "The game is the Letter U",
    "slotDetails": "B=X,X,X,X,X \n I=*,*,*,*,X \n N=*,*,/,*,X \n G=*,*,*,*,X \n O=X,X,X,X,X"
  },
  {
    "name": "Letter: W",
    "group": "Letter Games",
    "description": "The game is the Letter W",
    "slotDetails": "B=X,X,X,X,X \n I=*,*,*,X,* \n N=*,*,X,*,* \n G=*,*,*,X,* \n O=X,X,X,X,X",
    "ignores": ["N"]
  },
  {
    "name": "Letter: ",
    "group": "Letter Games",
    "description": "The game is the Letter X",
    "slotDetails": "B=X,*,*,*,X \n I=*,X,*,X,* \n N=*,*,X,*,* \n G=*,X,*,X,* \n O=X,*,*,*,X",
    "ignores": ["N"]
  },
  {
    "name": "Letter: F",
    "group": "Letter Games",
    "description": "The game is the Letter F",
    "slotDetails": "B=X,*,*,*,* \n I=*,X,*,*,* \n N=*,*,X,X,X \n G=*,X,*,*,* \n O=X,*,*,*,*"
  },
  {
    "name": "Letter: Z",
    "group": "Letter Games",
    "description": "The game is the Letter Z",
    "slotDetails": "B=X,*,*,*,X \n I=X,*,*,X,X \n N=X,*,X,*,X \n G=X,X,*,*,X \n O=X,*,*,*,X"
  }
];

