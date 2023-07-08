

class BingoGame {

    constructor(name){
        this.Name = name;
        this.Card = undefined;
        this.LetterCounts = { "B": 0, "I": 0, "N": 0, "G": 0,"O": 0 };
        this.Started = false;

        // Keep track of all numbers called;
        this.NumbersCalled = [];
    }

    // Set the cards
    setCurrentCard(cardObject){
        this.Card = cardObject;
    }

    // Get the current card
    getCurrentCard(){
        return this.Card;
    }

    // Add number called
    addNumberCalled(number){ 
        this.NumbersCalled.push(number);
    }

    // Increment letter count
    incrementLetterCount(letter){
        this.LetterCounts[letter] += 1;

        return (this.LetterCounts[letter] >= 15);
    }

    // Get a ball (given a bingo number)
    getBall(letter, number){

        let letterLower = letter.toLowerCase();
        let ball = `<span id="selected_cell" class="theme_black_bg bingo_ball_circle bingo_ball_letter_${letterLower}">${letter} ${number}</span>`;
        return ball;
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
        var ball = this.getBall(letter, number);

        // Keep count of numbers called (and how many per letter)
        this.addNumberCalled(number);
        var allNums = this.incrementLetterCount(letter);

        results = {
            "Letter":letter,
            "Number":number,
            "BingoNum": `${letter} ${number}`,
            "Ball": ball,
            "AllNumbers": allNums
        };

        return results;
    }
}