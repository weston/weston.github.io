ACTION_CHECK = "check"
ACTION_JAM = "jam"
ACTION_FOLD = "check/fold"
ACTION_CALL = "check/call"

IP_ACTIONS = [ACTION_JAM, ACTION_CHECK]
OOP_ACTIONS = [ACTION_CALL, ACTION_FOLD]


class Strategy {
    constructor(name, hands, possibleActions) {
        this.name = name
        this.possibleActions = possibleActions
        this.hands = []
        for (var i = 0; i < hands.length; i++) {
            var h = hands[i]
            this.hands.push([h[0] + h[1], h[2] + h[3]])
        }
        this.handToAction = {}
        this.handToScore = {}
        this.resetScores()
        this.initializeStrategy()
    }

    initializeStrategy() {
        for (var i = 0; i < this.hands.length; i++) {
            this.handToAction[this.hands[i]] = this.possibleActions[0]
        }
        for (var i = 0; i < this.hands.length; i++) {
            var randAction = Math.floor(Math.random()*2)
            this.handToAction[this.hands[i]] = this.possibleActions[randAction]
        }

    }

    resetScores() {
        for (var i = 0; i < this.hands.length; i++) {
            this.handToScore[this.hands[i]] = 0
        }
    }

    getValue() {
        var total = 0
        for (var i = 0; i < this.hands.length; i++) {
            total += this.handToScore[this.hands[i]]
        }
        return total
    }

    incrementValue(hand, amount) {
        this.handToScore[hand] += amount
    }

    getHands() {
        return this.hands
    }

    getAction(hand) {
        return this.handToAction[hand]
    }

    copyStrategy(other) {
        for (var i = 0; i < this.hands.length; i++ ){
            this.handToAction[this.hands[i]] = other.handToAction[this.hands[i]]
            this.handToScore[this.hands[i]] = other.handToScore[this.hands[i]]

        }
    }

    printDump() {
        print(this.name + " strategy total: " + this.getValue())
        for (var i = 0; i < this.hands.length; i++) {
            var hand = this.hands[i]
            print("\t" + hand + " " + this.handToAction[hand] + " " + this.handToScore[hand])
        }
    }

    modifyStrategy() {
        this.flipWorst()
        this.flipWorst()
        this.flipWorst()
        this.flipRandom()
    }

    flipWorst(){
        var worstScore = this.handToScore[this.hands[0]]
        var worstHand = this.hands[0]
        for (var i = 1; i < this.hands.length; i++) {
            if (this.handToScore[this.hands[i]] < worstScore) {
                worstScore = this.handToScore[this.hands[i]]
                worstHand = this.hands[i]
            }
        }
        var currentAction = this.handToAction[worstHand]
        if (currentAction == this.possibleActions[0]){
            this.handToAction[worstHand] = this.possibleActions[1]
        }else{
            this.handToAction[worstHand] = this.possibleActions[0]
        }
    }

    flipRandom() {
        var index = Math.floor(Math.random()*this.hands.length)
        var hand = this.hands[index]
        var currentAction = this.handToAction[hand]
        if (currentAction == this.possibleActions[0]){
            this.handToAction[hand] = this.possibleActions[1]
        }else{
            this.handToAction[hand] = this.possibleActions[0]
        }
    }
}


function main() {

    var params = getParams()
    NUM_ITERATIONS = params[0]
    var board = params[1]
    var bet = params[2]
    var pot = params[3]
    var IPHands = params[4]
    var OOPHands = params[5]

    var ip = new Strategy("IP", IPHands, IP_ACTIONS)
    var oop = new Strategy("OOP", OOPHands, OOP_ACTIONS)
    evaluateStrategies(ip, oop, pot, bet, board)

    ip.printDump()
    oop.printDump()

    for (var i = 0; i < NUM_ITERATIONS; i++) {
        var trialIP = new Strategy("IP", IPHands, IP_ACTIONS)
        var trialOOP = new Strategy("OOP", OOPHands, OOP_ACTIONS)
        trialIP.copyStrategy(ip)
        trialIP.modifyStrategy()
        trialIP.resetScores()

        trialOOP.copyStrategy(oop)
        trialOOP.modifyStrategy()
        trialOOP.resetScores()

        evaluateStrategies(trialIP, trialOOP, pot, bet, board)

        if (trialIP.getValue() > ip.getValue()) {
            console.log("New IP Strategy Found")
            ip.copyStrategy(trialIP)
            ip.printDump()
        }
        if (trialOOP.getValue() > oop.getValue()) {
            console.log("New OOP Strategy Found")
            oop.copyStrategy(trialOOP)
            ip.printDump()
        }
    }
    ip.printDump()
    oop.printDump()
    print("DONE!")
}

function evaluateStrategies(IPStrategy, OOPStrategy, potSize, betSize, board){
    var ipHands = IPStrategy.getHands()
    var oopHands = OOPStrategy.getHands()

    // Can optimize the solvedness part later
    for (var i = 0; i < ipHands.length; i++) {
        var ipHand = ipHands[i]
        var ipSolved  = Hand.solve(board.concat(ipHand))
        for (var j = 0; j < oopHands.length; j++) {
            var oopHand = oopHands[j]
            if (block(ipHand, oopHand, board)){
                continue
            }
            var oopSolved = Hand.solve(board.concat(oopHand))
            var winner = Hand.winners([oopSolved, ipSolved])
            var oopWins = oopSolved.toString() == winner.toString()
            var ipWins = ipSolved.toString() == winner.toString()
            if (IPStrategy.getAction(ipHand) == ACTION_CHECK){
                if (ipWins && !oopWins) {
                    IPStrategy.incrementValue(ipHand, potSize)
                } else if (!ipWins && oopWins) {
                    OOPStrategy.incrementValue(oopHand, potSize)
                } else{
                    IPStrategy.incrementValue(ipHand, potSize/2)
                    OOPStrategy.incrementValue(oopHand, potSize/2)
                }
            } else if (IPStrategy.getAction(ipHand) == ACTION_JAM){
                var oopAction = OOPStrategy.getAction(oopHand)
                if (oopAction == ACTION_FOLD) {
                    IPStrategy.incrementValue(ipHand, potSize)
                }else if (oopAction == ACTION_CALL) {
                    if (ipWins && !oopWins) {
                        IPStrategy.incrementValue(ipHand, potSize + betSize)
                        OOPStrategy.incrementValue(oopHand, -betSize)
                    } else if (!ipWins && oopWins) {
                        IPStrategy.incrementValue(ipHand, -betSize)
                        OOPStrategy.incrementValue(oopHand, potSize + betSize)
                    } else{
                        IPStrategy.incrementValue(ipHand, potSize/2)
                        OOPStrategy.incrementValue(oopHand, potSize/2)
                    }
                }else{
                    console.log("ERROR1")
                }
            } else{
                console.log("ERROR2")
            }
        }
    }
}


function block(hand1, hand2, board){
    var cards = new Set(board)
    cards.add(hand1[0])
    cards.add(hand1[1])
    cards.add(hand2[0])
    cards.add(hand2[1])
    return cards.size != 9
}


function getParams(){
    var numSims = parseInt(document.getElementById("num_simulations").value)
    var board = document.getElementById("board").value.split(" ")
    var bet  = parseInt(document.getElementById("bet").value)
    var pot = parseInt(document.getElementById("pot").value)
    var ipRange = document.getElementById("ip_range").value.split(" ")
    var oopRange = document.getElementById("oop_range").value.split(" ")
    return [numSims, board, bet, pot, ipRange, oopRange]
}

function print(s) {
    console.log(s)
    document.getElementById("output").innerHTML += s + "\n"
}

function clearStuff(){
    console.log("clear")
    document.getElementById("output").innerHTML = ""
}
