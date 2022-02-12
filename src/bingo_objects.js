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
		"Straight Line": {
			"group": "Classic Games",
			"desc": "The game is any Straight Line! Any vertical, horizontal, or diagonal line of 5!",
			"cost": "This game costs 1 dollar",
			"example": 	[]
		},
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
		"Popsicle": {
			"group": "Random",
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
		"The Cross": {
			"group": "Random",
			"desc": "The game is The Cross! Down the N, and across the middle row.",
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
			"group": "Random",
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
		"Less Than": {
			"group": "Random",
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
		
		"The Ladder": {
			"group": "Random",
			"desc": "The game is The Ladder! Across the top row, middle row, and bottom row",
			"cost": "This game costs 1 dollar",
			"example": 	[
							[1,1,1,1,1],
							[0,0,0,0,0],
							[1,1,8,1,1],
							[0,0,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Stripes": {
			"group": "Random",
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
		"The Grid!": {
			"group": "Random",
			"desc": "The game is The Grid!! The 1st, 3rd, and last columns. Also the 1st, 3rd, and last rows.",
			"ignore": ["I", "G"],
			"cost": "This game costs 2 dollars",
			"example": 	[
							[1,1,1,1,1],
							[1,0,1,0,1],
							[1,1,8,1,1],
							[1,0,1,0,1],
							[1,1,1,1,1]
						]
		},
		"Train Tracks": {
			"group": "Random",
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
		"Letter: A":{
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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
			"group": "Letters",
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

