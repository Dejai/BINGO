
/************************ GLOBAL VARIABLES ****************************************/
var GAME_BOARD_CELLS = [];
var CURR_GAME = "";
var touchEvent = "ontouchstart" in window ? "touchstart" : "click";


/*********************** GETTING STARTED *****************************/

    // Once doc is ready
    mydoc.ready(function(){

        // Make sure the page doesn't close once the game starts
        window.addEventListener("beforeunload", onClosePage);

        // Load the game options
        loadGameOptions();
        
        // Generate a card
        generateCard();
    });

    // Prevent the page accidentally closing
    function onClosePage(event)
    {
        event.preventDefault();
        event.returnValue='';
    }

    // Add the listener for the cells
    function addNumberListener()
    {
        var touchEvent = "ontouchstart" in window ? "touchstart" : "click";
        let cells = document.querySelectorAll(".number_cell");
        
        cells.forEach( (obj)=>{
            obj.addEventListener(touchEvent, onSelectNumber);
        });
    }

    // Generate the numbers for the card
    function generateRandomNumbers(letter)
    {
        let min = bingo_letters[letter][0];
        let max = bingo_letters[letter][1];
        let numbers = [];

        // Get 5 random numbers (not repeated);
        while(numbers.length < 5)
        {
            rand = randomIntFromInterval(min,max);
            if (numbers.includes(rand)) continue;

            if(numbers.length == 2 && letter == "N")
            {
                numbers.push(`<span class='freeSpace number_cell'><i class="number_cell fa fa-star-o"></i></span>`);
            }
            else
            {
                numbers.push(rand);
            }
        }

        return numbers;
    }

    // Generate the card
    function generateCard()
    {
        let b = generateRandomNumbers("B");
        let i = generateRandomNumbers("I");
        let n = generateRandomNumbers("N");
        let g = generateRandomNumbers("G");
        let o = generateRandomNumbers("O");

        let cardHtml = "";

        for(var idx = 0; idx < 5; idx ++)
        {
            let row = `<tr class="bingo_row">
                            <td class="number_cell">${b[idx]}</td>
                            <td class="number_cell">${i[idx]}</td>
                            <td class="number_cell">${n[idx]}</td>
                            <td class="number_cell">${g[idx]}</td>
                            <td class="number_cell">${o[idx]}</td>
                        </tr>
                        `
            cardHtml += row;
        }

        // Add content to page
        document.getElementById("bingo_card_body").innerHTML = cardHtml;

        // Add listener after adding content
        addNumberListener();

        // Map the number cells 
        mapNumberCells();
    }

    // Maps each number cell to a 2D array; Easy of checking and updating each cell;
    function mapNumberCells()
    {  
        document.querySelectorAll(".bingo_row")?.forEach( (row) =>{
            rowList = [];

            row.querySelectorAll("td").forEach( (cell) =>{
                rowList.push(cell);
            });
            // Push the cell into the global storage
            GAME_BOARD_CELLS.push(rowList);
        });
        console.log(GAME_BOARD_CELLS);
    }



/*********************** DOM: Update Page *****************************/

    // Load the game options object
    function loadGameOptions()
    {	
        data = games_object;

        options = "<option value=''>Select Game...</option>";
        for(var key in data)
        {
            if(key !== "contains")
            {
                options += "<option class='game_option' value=\"" + key + "\">" + key + "</option>";
            }
        }
        mydoc.loadContent(options, "gameOptionsOnCard");
    }

    // Select a value
    function onSelectNumber(event)
    {

        if(CURR_GAME == "")
        {
            alert("Please select the game being played.");
            return;
        }

        let target = event.target;
        let className = "number_selected"
        let closest = target.closest("td.number_cell");
        let isSelected = closest.classList.contains(className);


        if(isSelected)
        {
            closest.classList.remove(className);
        }
        else
        {
            closest.classList.add(className);
        }

        // Always check for BINGO after changing the selected cells
        checkForBingo();
    }

    // Indicate which ones are needed
    function onIndicateNeeded()
    {

        // Always clear first when changing games;
        onClearNeededCells();

        CURR_GAME = document.getElementById("gameOptionsOnCard").value
        if(CURR_GAME != "" && CURR_GAME != "Straight Line")
        {
            let expected = games_object[CURR_GAME]["example"];

            for(var rowIdx = 0; rowIdx < 5; rowIdx ++)
            {
                for(var colIdx = 0; colIdx < 5; colIdx++ )
                {
                    needed = expected[rowIdx][colIdx];
                    if(needed == 1 || needed == 8)
                    {
                        GAME_BOARD_CELLS[rowIdx][colIdx].classList.add("number_cell_needed");
                    }
                }
            }
        }
        
    }

    // Clear the card
    function onClearCard()
    {
        let proceed = confirm("Are you sure you want to clear the card?");
        if(proceed)
        {
            document.querySelectorAll(".number_cell").forEach( (obj) =>{
                obj.classList.remove("number_selected");
            });

            // Clear needed cells;
            onClearNeededCells();

        }
    }

    // Clear the "needed" cells
    function onClearNeededCells()
    {
        document.querySelectorAll(".number_cell").forEach( (obj) =>{
            obj.classList.remove("number_cell_needed");
        });
    }

/*********************** HELPERS *****************************/

    // Check if the current card has achieved BINGO!
    function checkForBingo()
    {
        let isBingo = false;
        if(CURR_GAME == "Straight Line")
        {
            isBingo = checkForBingo_StraightLine();
            console.log("Straight Line? " + isBingo);
        }
        else
        {
            let expected = games_object[CURR_GAME]["example"];
            let theBoard = getBoardState();
            isBingo = (expected.toString() == theBoard.toString());
        }

        // Alert if we have acheived BINGO
        if (isBingo){
            setTimeout( ()=> {
                alert("BINGO!");
            }, 500);

        } 
    }

    // Check specifically for any straight line
    function checkForBingo_StraightLine()
    {
        let expectedStraight = "11111";
        let hasStraightLine = false;

        // Check diagonal first;
        diagLeftString = "";
        diagRightString = "";

        for(var idx = 0; idx < 5; idx++)
        {
            left = idx;
            right = (5-idx)-1;

            // Starting top-left down;
            leftCell = GAME_BOARD_CELLS[idx][left];
            diagLeftString  += leftCell.classList.contains("number_selected") ? "1" : "0";
            if(diagLeftString == expectedStraight)
            {
                hasStraightLine = true;
                break;
            }

            // Starting top-right down;
            rightCell = GAME_BOARD_CELLS[idx][right];
            diagRightString += rightCell.classList.contains("number_selected") ? "1" : "0";
            console.log(`Expected: ${expectedStraight} .... DiagRight: ${diagRightString}`);
            if(diagRightString == expectedStraight)
            {
                hasStraightLine = true;
                break;
            }

            // Check the row
            row = GAME_BOARD_CELLS[idx];
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
            GAME_BOARD_CELLS.forEach( (row) =>{
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
    }

    // Gets the state of the board -- represented as a
    function getBoardState()
    {
        let state = [];
        
        document.querySelectorAll(".bingo_row")?.forEach( (row) =>{

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
    }
    // https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript 
    // min and max included 
    function randomIntFromInterval(min, max) 
    { 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }