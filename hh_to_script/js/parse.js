PREFLOP_MARKER = "*** HOLE CARDS ***"
FLOP_MARKER = "*** FLOP ***"
TURN_MARKER = "*** TURN ***"
RIVER_MARKER = "*** RIVER ***"

PREFLOP = "PREFLOP"
FLOP = "FLOP"
TURN = "TURN"
RIVER = "RIVER"

BET = "BET"
CALL = "CALL"
CHECK = "CHECK"
FOLD = "FOLD"
RAISE  = "RAISE"


class Action {
	translateAction = {
		"raises": RAISE,
		"folds": FOLD,
		"checks": CHECK,
		"bets": BET,
		"calls": CALL,
	}

	constructor(action_string) {
		var components = action_string.split(" ")
		this.username = components[0]
		this.type = this.translateAction[components[1]]
		if (this.type == BET) {
			this.amount = Number(components[2].replace("$", ""))
		} else if (this.type == RAISE){
			this.amount = Number(components[4].replace("$", ""))
		}else {
			this.amount = null
		}
	}
}


class HandHistory {
    constructor(hh_text) {
        this.hhLines = hh_text.split("\n")
        this.parseSeatsAndStacks()
		this.parseActions()
        this.parseFlopCards()
		this.parsePotSizes()
		this.parseEffectiveStacks()
    }

    parseSeatsAndStacks() {
        this.usernameToPosition = {}
        this.usernameToStartingStack = {}
        var lineIndex = 3
		// Seats are 1 indexed
        var orderedPositions = ["", "BTN", "SB", "BB", "LJ", "HJ", "CO"]
        while (this.hhLines[lineIndex].includes("Seat ")) {
            var components = this.hhLines[lineIndex].split(" ")
            var position = orderedPositions[parseInt(components[1].split(":")[0])]
            var username = components[2]
            var stack = Number(components[3].slice(2).split(")")[0])
            this.usernameToPosition[username] = position
            this.usernameToStartingStack[username] = stack
            lineIndex += 1
        }
    }

	parseActions() {
		var streetToMarker = {
			PREFLOP: PREFLOP_MARKER,
			FLOP: FLOP_MARKER,
			TURN: TURN_MARKER,
			RIVER: RIVER_MARKER,
		}
		this.actions = {
			PREFLOP: [],
			FLOP: [],
			TURN: [],
			RIVER: [],
		}

		for (const [street, marker] of Object.entries(streetToMarker)) {
			var startIndex = 0
			for (var i = 0; i < this.hhLines.length; i++) {
				var line = this.hhLines[i]
				if (line.includes(marker)) {
					startIndex = i + 2
					break
				}
			}
			for (var i = startIndex; i < this.hhLines.length; i++) {
				var line = this.hhLines[i]
				if (line.includes("***")) {
					break
				}
				this.actions[street].push(new Action(line))
			}
		}
	}

	parsePotSizes() {
		this.potSizes = {}
		for (var i = 0; i < this.hhLines.length; i++) {
			var line = this.hhLines[i]
			var street = ""
			if (line.includes(FLOP_MARKER)){
				street = FLOP
			}
			if (line.includes(TURN_MARKER)){
				street = TURN
			}
			if (line.includes(RIVER_MARKER)){
				street = RIVER
			}
			if (street != "") {
				var potLine = this.hhLines[i+1]
				var potSize = Number(potLine.split(" ")[2].replace("$", ""))
				this.potSizes[street] = potSize
			}
		}
	}

    parseFlopCards() {
        for (var i = 0; i < this.hhLines.length; i++) {
            var line = this.hhLines[i]
            if (line.includes(FLOP_MARKER)) {
                this.flop = line.split("[")[1].split("]")[0].split(" ")
                this.pot = Number(
					this.hhLines[i+1].split(" ")[2].replace("$", ""))
                return
            }
        }
        this.flop = null
        this.pot = 0
    }

	parseEffectiveStacks() {
		this.effectiveStacks = {
			PREFLOP: null,
			FLOP: null,
			TURN: null,
			RIVER: null,
		}
		var activeUsernames = this.activeUsernames()
		if (activeUsernames.length != 2) {
			return
		}
		this.effectiveStacks[PREFLOP] = Math.min(
			this.usernameToStartingStack[activeUsernames[0]],
			this.usernameToStartingStack[activeUsernames[1]],
		)
		var streets = [PREFLOP, FLOP, TURN, RIVER]
		for (var i = 1; i < streets.length; i++) {
			var street = streets[i]
			var previousStreetActions = this.actions[streets[i-1]]
			var adjustmentFromPreviousStreet = 0
			for (var j = 0; j < previousStreetActions.length; j++) {
				var action = previousStreetActions[j]
				if ([RAISE, BET].includes(action.type)) {
					adjustmentFromPreviousStreet = action.amount
				}
			}
			this.effectiveStacks[street] = this.effectiveStacks[
				streets[i-1]] - adjustmentFromPreviousStreet
		}
	}

	preflopType() {
		var numRaises = 0
		for (var i = 0; i < this.actions[PREFLOP].length; i++) {
			if (this.actions[PREFLOP][i].type == RAISE) {
				numRaises += 1
			}
		}
		if (numRaises == 0){
			return "limped"
		}
		if (numRaises == 1){
			return "SRP"
		}
		return (numRaises + 1).toString() + "BP"
	}

	flopCBetAction() {
		// Get the bet size of the last preflop raiser
		var username = this.lastPreflopRaiser()
		for (var i = 0; i < this.actions[FLOP].length; i++) {
			var action = this.actions[FLOP][i]
			if (action.username == username && action.type == BET) {
				return action
			}
		}
		return null
	}

	lastPreflopRaiser() {
		var username = null
		for (var i = 0; i < this.actions[PREFLOP].length; i++) {
			var action = this.actions[PREFLOP][i]
			if (action.type == RAISE) {
				username = action.username
			}
		}
		return username
	}


	activeUsernames() {
		// Get the two players active on the flop
		var usernames = []
		for (var i = 0; i < this.actions[FLOP].length; i++) {
			var action = this.actions[FLOP][i]
			if (usernames.includes(action.username)){
				continue
			}
			usernames.push(action.username)
		}
		return usernames
	}

	activePositions() {
		var positions = []
		var usernames = this.activeUsernames()
		for (var i = 0; i < usernames.length; i++) {
			positions.push(this.usernameToPosition[usernames[i]])
		}
		var orderedActivePositions = []
		var allOrderedPositions = ["SB", "BB", "LJ", "HJ", "CO", "BTN"]
		for (var i = 0; i < allOrderedPositions.length; i++) {
			if (positions.includes(allOrderedPositions[i])){
				orderedActivePositions.push(allOrderedPositions[i])
			}
		}
		return orderedActivePositions
	}
}
