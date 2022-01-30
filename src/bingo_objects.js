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
			"desc": "The game is Outer Box!",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,1],
							[1,0,3,0,1],
							[1,0,0,0,1],
							[1,1,1,1,1]
						]
		},
		"Inner Box": {
			"desc": "The game is Inner Box!",
			"ignore": ["B", "O"],
			"example": 	[
							[0,0,0,0,0],
							[0,1,1,1,0],
							[0,1,3,1,0],
							[0,1,1,1,0],
							[0,0,0,0,0]
						]
		},
		"Letter: A":{
			"desc": "The game is the Letter A!",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,1],
							[1,1,8,1,1],
							[1,0,0,0,1],
							[1,0,0,0,1]
						]
		},
		"Letter: B":{
			"desc": "The game is the Letter B!",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,1],
							[1,1,8,1,1],
							[1,0,0,0,1],
							[1,1,1,1,1]
						]
		},
		"Letter: C":{
			"desc": "The game is the Letter C!",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,0],
							[1,0,3,0,0],
							[1,0,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Letter: E": {
			"desc": "The game is the Letter E!",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,0],
							[1,1,8,1,1],
							[1,0,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Letter: F":{
			"desc": "The game is the Letter F! F is for Fy-field!",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,0],
							[1,1,8,1,1],
							[1,0,0,0,0],
							[1,0,0,0,0]
						]

		},
		"Letter: H": {
			"desc": "The game is the Letter H!",
			"ignore": ["N"],
			"example": 	[
							[1,0,0,0,1],
							[1,0,0,0,1],
							[1,1,8,1,1],
							[1,0,0,0,1],
							[1,0,0,0,1]
						]
		},
		"Letter: I": {
			"desc": "The game is the Letter I!",
			"example": 	[
							[1,1,1,1,1],
							[0,0,1,0,0],
							[0,0,8,0,0],
							[0,0,1,0,0],
							[1,1,1,1,1]
						]
		},
		"Letter: L": {
			"desc": "The game is the Letter L!",
			"example": 	[
							[1,0,0,0,0],
							[1,0,0,0,0],
							[1,0,3,0,0],
							[1,0,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Letter: M": {
			"desc": "The game is the Letter M!",
			"ignore": ["N"],
			"example": 	[
							[1,0,0,0,1],
							[1,1,0,1,1],
							[1,0,8,0,1],
							[1,0,0,0,1],
							[1,0,0,0,1]
						]
		},
		"Letter: N": {
			"desc": "The game is the Letter N!",
			"ignore": ["N"],
			"example": 	[
							[1,0,0,0,1],
							[1,1,0,0,1],
							[1,0,8,0,1],
							[1,0,0,1,1],
							[1,0,0,0,1]
						]
		},
		"Letter: P": {
			"desc": "The game is the Letter P!",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,1],
							[1,1,8,1,1],
							[1,0,0,0,0],
							[1,0,0,0,0]
						]
		},
		"Letter: S": {
			"desc": "The game is the Letter S!",
			"example": 	[
							[1,1,1,1,1],
							[1,0,0,0,0],
							[1,1,8,1,1],
							[0,0,0,0,1],
							[1,1,1,1,1]
						]
		},
		"Letter: T": {
			"desc": "The game is the Letter T!",
			"example": 	[
							[1,1,1,1,1],
							[0,0,1,0,0],
							[0,0,8,0,0],
							[0,0,1,0,0],
							[0,0,1,0,0]
						]
		},
		"Letter: U": {
			"desc": "The game is the Letter U!",
			"example": 	[
							[1,0,0,0,1],
							[1,0,0,0,1],
							[1,0,3,0,1],
							[1,0,0,0,1],
							[1,1,1,1,1]
						]
		},
		"Letter: W": {
			"desc": "The game is the Letter W!",
			"ignore": ["N"],
			"example": 	[
							[1,0,0,0,1],
							[1,0,0,0,1],
							[1,0,8,0,1],
							[1,1,0,1,1],
							[1,0,0,0,1]
						]
		},
		"Letter: X": {
			"desc": "The game is the Letter X!",
			"ignore": ["N"],
			"example": 	[
							[1,0,0,0,1],
							[0,1,0,1,0],
							[0,0,8,0,0],
							[0,1,0,1,0],
							[1,0,0,0,1]
						]
		},
		"Letter: Y": {
			"desc": "The game is the Letter Y!",
			"example": 	[
							[1,0,0,0,1],
							[0,1,0,1,0],
							[0,0,8,0,0],
							[0,0,1,0,0],
							[0,0,1,0,0]
						]
		},
		"Letter: Z": {
			"desc": "The game is the Letter Z!",
			"example": 	[
							[1,1,1,1,1],
							[0,0,0,1,0],
							[0,0,8,0,0],
							[0,1,0,0,0],
							[1,1,1,1,1]
						]
		},
		"Straight Line": {
			"desc": "The game is any Straight Line! Any vertical, horizontal, or diagonal line of 5!",
			"example": 	[]
		},
		"Full House": {
			"desc": "The game is Full House! All the spaces on your card.",
			"example": 	[
							[1,1,1,1,1],
							[1,1,1,1,1],
							[1,1,8,1,1],
							[1,1,1,1,1],
							[1,1,1,1,1]
						]
		}
	};

