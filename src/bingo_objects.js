const bingo_letters = 
	{
		"B": [1,15],
		"I": [16,30],
		"N": [31,45],
		"G": [46,60],
		"O": [61,75]
	};

const games_object =
	{
		"Full House": {
			"group": "Classic Games",
			"desc": "The game is Full House! All the spaces on your card.",
			"cost": "This game costs 2 dollars",
			"example": 	[
							[1,1,1,1,1],
							[1,1,1,1,1],
							[1,1,8,1,1],
							[1,1,1,1,1],
							[1,1,1,1,1]
						]
		},
		"Inner Box": {
			"group": "Classic Games",
			"desc": "The game is Inner Box!",
			"ignore": ["B", "O"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[0,0,0,0,0],
							[0,1,1,1,0],
							[0,1,3,1,0],
							[0,1,1,1,0],
							[0,0,0,0,0]
						]
		},
		"Outer Box":{
			"group": "Classic Games",
			"desc": "The game is Outer Box!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,1],
							[1,0,3,0,1],
							[1,0,0,0,1],
							[1,1,1,1,1]
						]
		},
		"Straight Line": {
			"group": "Classic Games",
			"desc": "The game is any Straight Line! Any vertical, horizontal, or diagonal line of 5!",
			"cost": "This game costs 1 dollar",
			"example": 	[]
		},
		

		
		// The Random Games
		"Bird": {
			"group": "Random Games",
			"desc": "The game is Bird! Down the N, and across the middle row.",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[0,0,1,0,0],
							[0,0,1,0,0],
							[1,1,8,1,1],
							[0,0,1,0,0],
							[0,0,1,0,0]
						]
		},
		"Greater Than": {
			"group": "Random Games",
			"desc": "The game is Greater Than! The greater than symbol.",
			"ignore": ["N","G","O"],
			"cost": "This game costs 50 cents",
			"example": 	[
							[1,0,0,0,0],
							[0,1,0,0,0],
							[0,0,8,0,0],
							[0,1,0,0,0],
							[1,0,0,0,0]
						]
		},
		"Grid!": {
			"group": "Random Games",
			"desc": "The game is Grid! The 1st, 3rd, and last columns. Also the 1st, 3rd, and last rows.",
			"cost": "This game costs 2 dollars",
			"example": 	[
							[1,1,1,1,1],
							[1,0,1,0,1],
							[1,1,8,1,1],
							[1,0,1,0,1],
							[1,1,1,1,1]
						]
		},
		"Ladder": {
			"group": "Random Games",
			"desc": "The game is Ladder! Across the top row, middle row, and bottom row",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[0,0,0,0,0],
							[1,1,8,1,1],
							[0,0,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Less Than": {
			"group": "Random Games",
			"desc": "The game is Less Than! The less than symbol.",
			"ignore": ["B", "I", "N"],
			"cost": "This game costs 50 cents",
			"example": 	[
							[0,0,0,0,1],
							[0,0,0,1,0],
							[0,0,8,0,0],
							[0,0,0,1,0],
							[0,0,0,0,1]
						]
		},
		
		"Popsicle": {
			"group": "Random Games",
			"desc": "The game is Popsicle! The shape looks like a popsicle.",
			"ignore": ["B", "O"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[0,1,1,1,0],
							[0,1,1,1,0],
							[0,1,8,1,0],
							[0,0,1,0,0],
							[0,0,1,0,0]
						]
		},
		"Stripes": {
			"group": "Random Games",
			"desc": "The game is Vertical Stripes! Down the B, N, and O",
			"ignore": ["I", "G"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,1,0,1],
							[1,0,1,0,1],
							[1,0,8,0,1],
							[1,0,1,0,1],
							[1,0,1,0,1]
						]
		},
		"Toy Car": {
			"group": "Random Games",
			"desc": "The game is Greater Than! The greater than symbol.",
			"ignore": ["B","O"],
			"cost": "This game costs 50 cents",
			"example": 	[
							[0,1,0,1,0],
							[0,1,1,1,0],
							[0,0,8,0,0],
							[0,1,1,1,0],
							[0,1,0,1,0]
						]
		},
		"Train Tracks": {
			"group": "Random Games",
			"desc": "The game is Train Tracks! Down the I and G",
			"ignore": ["B", "N", "O"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[0,1,0,1,0],
							[0,1,0,1,0],
							[0,1,3,1,0],
							[0,1,0,1,0],
							[0,1,0,1,0]
						]
		},
		"Winner's Podium": {
			"group": "Random Games",
			"desc": "The game is Winner's Podium! Bottom row, the middle three in the 4th row, and the Free Space.",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[0,0,0,0,0],
							[0,0,0,0,0],
							[0,0,8,0,0],
							[0,1,1,1,0],
							[1,1,1,1,1]
						]
		},
	

		// The Letter Games
		"Letter: A":{
			"group": "Letter Games",
			"desc": "The game is the Letter A!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,1],
							[1,1,8,1,1],
							[1,0,0,0,1],
							[1,0,0,0,1]
						]
		},
		"Letter: B":{
			"group": "Letter Games",
			"desc": "The game is the Letter B!",
			"cost": "This game costs 2 dollars",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,1],
							[1,1,8,1,1],
							[1,0,0,0,1],
							[1,1,1,1,1]
						]
		},
		"Letter: C":{
			"group": "Letter Games",
			"desc": "The game is the Letter C!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,0],
							[1,0,3,0,0],
							[1,0,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Letter: E": {
			"group": "Letter Games",
			"desc": "The game is the Letter E!",
			"cost": "This game costs 2 dollars",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,0],
							[1,1,8,1,1],
							[1,0,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Letter: F":{
			"group": "Letter Games",
			"desc": "The game is the Letter F! F is for Fy-field!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,0],
							[1,1,8,1,1],
							[1,0,0,0,0],
							[1,0,0,0,0]
						]

		},
		"Letter: H": {
			"group": "Letter Games",
			"desc": "The game is the Letter H!",
			"ignore": ["N"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,0,0,1],
							[1,0,0,0,1],
							[1,1,8,1,1],
							[1,0,0,0,1],
							[1,0,0,0,1]
						]
		},
		"Letter: I": {
			"group": "Letter Games",
			"desc": "The game is the Letter I!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[0,0,1,0,0],
							[0,0,8,0,0],
							[0,0,1,0,0],
							[1,1,1,1,1]
						]
		},
		"Letter: L": {
			"group": "Letter Games",
			"desc": "The game is the Letter L!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,0,0,0],
							[1,0,0,0,0],
							[1,0,3,0,0],
							[1,0,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Letter: M": {
			"group": "Letter Games",
			"desc": "The game is the Letter M!",
			"ignore": ["N"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,0,0,1],
							[1,1,0,1,1],
							[1,0,8,0,1],
							[1,0,0,0,1],
							[1,0,0,0,1]
						]
		},
		"Letter: N": {
			"group": "Letter Games",
			"desc": "The game is the Letter N!",
			"ignore": ["N"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,0,0,1],
							[1,1,0,0,1],
							[1,0,8,0,1],
							[1,0,0,1,1],
							[1,0,0,0,1]
						]
		},
		"Letter: P": {
			"group": "Letter Games",
			"desc": "The game is the Letter P!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,1],
							[1,1,8,1,1],
							[1,0,0,0,0],
							[1,0,0,0,0]
						]
		},
		"Letter: S": {
			"group": "Letter Games",
			"desc": "The game is the Letter S!",
			"cost": "This game costs 2 dollars",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,0],
							[1,1,8,1,1],
							[0,0,0,0,1],
							[1,1,1,1,1]
						]
		},
		"Letter: T": {
			"group": "Letter Games",
			"desc": "The game is the Letter T!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[0,0,1,0,0],
							[0,0,8,0,0],
							[0,0,1,0,0],
							[0,0,1,0,0]
						]
		},
		"Letter: U": {
			"group": "Letter Games",
			"desc": "The game is the Letter U!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,0,0,1],
							[1,0,0,0,1],
							[1,0,3,0,1],
							[1,0,0,0,1],
							[1,1,1,1,1]
						]
		},
		"Letter: W": {
			"group": "Letter Games",
			"desc": "The game is the Letter W!",
			"ignore": ["N"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,0,0,1],
							[1,0,0,0,1],
							[1,0,8,0,1],
							[1,1,0,1,1],
							[1,0,0,0,1]
						]
		},
		"Letter: X": {
			"group": "Letter Games",
			"desc": "The game is the Letter X!",
			"ignore": ["N"],
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,0,0,1],
							[0,1,0,1,0],
							[0,0,8,0,0],
							[0,1,0,1,0],
							[1,0,0,0,1]
						]
		},
		"Letter: Y": {
			"group": "Letter Games",
			"desc": "The game is the Letter Y!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,0,0,0,1],
							[0,1,0,1,0],
							[0,0,8,0,0],
							[0,0,1,0,0],
							[0,0,1,0,0]
						]
		},
		"Letter: Z": {
			"group": "Letter Games",
			"desc": "The game is the Letter Z!",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[0,0,0,1,0],
							[0,0,8,0,0],
							[0,1,0,0,0],
							[1,1,1,1,1]
						]
		}
	};

