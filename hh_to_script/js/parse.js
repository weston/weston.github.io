class HandHistory {
    constructor(hh_text) {
        this.hh_lines = hh_text.split("\n")
        this.parseSeatsAndStacks()
        this.parseFlop()
        console.log(this.flop, this.pot)
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

    parseFlop() {
        for (var i = 0; i < this.hh_lines.length; i++) {
            var line = this.hh_lines[i]
            if (line.includes("*** FLOP ***")) {
                this.flop = line.split("[")[1].split("]")[0].split(" ")
                this.pot = Number(this.hh_lines[i+1].split(" ")[2].replace("$", ""))
                return
            }
        }
        this.flop = null
        this.pot = 0
    }
}

class PIOScript {
    generate() {
        return ""
    }
}


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


