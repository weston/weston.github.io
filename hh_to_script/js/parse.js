PREFLOP_MARKER = "*** HOLE CARDS ***"
FLOP_MARKER = "*** FLOP ***"
TURN_MARKER = "*** TURN ***"
RIVER_MARKER = "*** RIVER ***"


class Action {
	translateAction = {
		"raises": "raise",
		"folds": "fold",
		"checks": "check",
		"bets": "bet",
		"calls": "call",
	}

	constructor(action_string) {
		var components = action_string.split(" ")
		this.username = components[0]
		this.type = this.translateAction[components[1]]
		if (this.type == "bet" || this.type == "raise") {
			this.amount = Number(components[2].replace("$", ""))
		} else {
			this.amount = null
		}
	}
}


class HandHistory {
    constructor(hh_text) {
        this.hh_lines = hh_text.split("\n")
        this.parseSeatsAndStacks()
		this.parseActions()
        this.parseFlopCards()
        console.log(this.flop, this.pot, this.preflopType())
    }

    parseSeatsAndStacks() {
        this.usernameToPosition = {}
        this.usernameToStartingStack = {}
        var lineIndex = 3
        var orderedPositions = ["BTN", "SB", "BB", "LJ", "HJ", "CO"]
        while (this.hh_lines[lineIndex].includes("Seat ")) {
            var components = this.hh_lines[lineIndex].split(" ")
            var position = orderedPositions[parseInt(components[1].split(":")[0])]
            var username = components[2]
            var stack = Number(components[3].slice(2).split(")")[0])
            this.usernameToPosition[username] = stack
            this.usernameToStartingStack[username] = stack
            lineIndex += 1
        }
    }

	parseActions() {
		var streetToMarker = {
			"preflop": PREFLOP_MARKER,
			"flop": FLOP_MARKER,
			"turn": TURN_MARKER,
			"river": RIVER_MARKER,
		}
		this.actions = {
			"preflop": [],
			"flop": [],
			"turn": [],
			"river": [],
		}

		for (const [street, marker] of Object.entries(streetToMarker)) {
			var startIndex = 0
			for (var i = 0; i < this.hh_lines.length; i++) {
				var line = this.hh_lines[i]
				if (line.includes(marker)) {
					startIndex = i + 2
					break
				}
			}
			for (var i = startIndex; i < this.hh_lines.length; i++) {
				var line = this.hh_lines[i]
				if (line.includes("***")) {
					break
				}
				this.actions[street].push(new Action(line))
			}
		}
	}

    parseFlopCards() {
        for (var i = 0; i < this.hh_lines.length; i++) {
            var line = this.hh_lines[i]
            if (line.includes(FLOP_MARKER)) {
                this.flop = line.split("[")[1].split("]")[0].split(" ")
                this.pot = Number(this.hh_lines[i+1].split(" ")[2].replace("$", ""))
                return
            }
        }
        this.flop = null
        this.pot = 0
    }

	preflopType() {
		var numRaises = 0
		for (var i = 0; i < this.actions["preflop"].length; i++) {
			if (this.actions["preflop"][i].type == "raise") {
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

	postflopPositions() {
		return ["BB", "SB"]
	}
}


/////////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////


function init(){
    document.getElementById('file-input').addEventListener('change', handleFileSelect, false);
}


function handleFileSelect(event){
    const reader = new FileReader()
    reader.onload = function(event) {
        document.getElementById("uploaded-file").innerHTML = event.target.result
    }
    reader.readAsText(event.target.files[0])
}


function parse() {
    var hhText = document.getElementById("uploaded-file").innerHTML
    var hands = hhText.split("\n\n")
    var parsedHands = [];
    for (var i = 0; i < hands.length-1; i++) {
        parsedHands.push(parseHand(hands[i]))
    }
    return parsedHands
}


function parseHand(handText) {
    return new HandHistory(handText)
}


