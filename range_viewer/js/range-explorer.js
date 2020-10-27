DECK = []
for (var i = 0; i < SUITS.length; i++) {
    for (var j = 0; j < RANKS.length; j++) {
        DECK.push(RANKS[j] + SUITS[i])
    }
}

STOP = true

function main() {
    console.log("hello")
    NewRangeSelector("left-column", "rs1")
    NewRangeSelector("right-column", "rs2")

    document.getElementById("slider").oninput = handleSliderChange
}


function appendBoard(button) {
    document.getElementById("board").value = document.getElementById(
        "board").value + button.value
}

function randomKey(m) {
    var elements = []
    for (let k in m) {
        for (var i = 0; i < m[k]; i++) {
            elements.push(k)
        }
    }
    return randomElement(elements)
}

function randomElement(items) {
    return items[Math.floor(Math.random() * items.length)]
}

function runAnalysis(cachedData) {
    if (STOP) {
        return
    }
    var board = getBoard()
    var r1 = getSelectedHands("rs1")
    var r2 = getSelectedHands("rs2")
    var data = {
        "player1HandWins": {},
        "player2HandWins": {},
        "player1HandLosses": {},
        "player2HandLosses": {},
        "numTrials": 0,
        "ties": 0,
        "player1Wins": 0,
        "player2Wins": 0,
    }
    if (cachedData != undefined) {
        data = cachedData
    }
    var numTotalHands = 0
    for (var i = 0; i < 300; i++) {
        var hg1 = randomKey(r1)
        var hg2 = randomKey(r2)
        var h1 = randomElement(expandHands(hg1))
        var h2 = randomElement(expandHands(hg2))
        if (isBlocked(h1, h2, board)) {
            continue
        }
        data["numTrials"]++
        var handList1 = [h1[0] + h1[1], h1[2] + h1[3]]
        var handList2 = [h2[0] + h2[1], h2[2] + h2[3]]
        var completedBoardList = completeBoardStringToList(
            board, handList1.concat(handList2))
        var hand1 = Hand.solve(completedBoardList.concat(handList1))
        var hand2 = Hand.solve(completedBoardList.concat(handList2))
        var winners = Hand.winners([hand1, hand2]);
        if (winners.length == 2) {
            data["ties"]++
        } else if (winners[0] == hand1) {
            data["player1Wins"]++
        } else {
            data["player2Wins"]++
        }
    }
    updateBarGraph(data["player1Wins"], data["ties"], data["player2Wins"])
    setTimeout(function(){runAnalysis(data)}, 0)
}


function completeBoardStringToList(board, deadCards) {
    var boardList = []
    for (var i = 0; i < board.list; i+=2) {
        boardList.push(board[i] + board[i+1])
    }
    if (boardList.length == 5) {
        return boardList
    }
    if (board.length == 10) {
        return boardList
    }
    var deck = new Set(DECK)
    for (var i = 0; i < deadCards.length; i++) {
        deck.delete(deadCards[i])
    }
    for (var i = 0; i < boardList.length; i++) {
        deck.delete(boardList[i])
    }
    while(boardList.length < 5) {
        let items = Array.from(deck);
        var chosen = items[Math.floor(Math.random() * items.length)]
        deck.delete(chosen)
        boardList.push(chosen)
    }
    return boardList
}


function isBlocked(h1, h2, board) {
    cards = new Set()
    cards.add(h1[0] + h1[1])
    cards.add(h1[2] + h1[3])
    cards.add(h2[0] + h2[1])
    cards.add(h2[2] + h2[3])
    for (var i = 0; i < board.length; i+= 2) {
        cards.add(board[i] + board[i+1])
    }
    return cards.size != (board.length/2) + 4
}

function getBoard() {
    //TODO: Validate board
    //TODO: Also this doesn't work
    var boardString = ""
    var unparsedString = document.getElementById("board").value
    for (var i = 0; i < unparsedString.length; i++) {
        var c = unparsedString[i]
        if (c == "♣️") {
            unparsedString += "c"
        } else if (c == "♠️") {
            unparsedString += "s"
        } else if (c == "♥️") {
            unparsedString += "h"
        } else if (c == "♦️") {
            unparsedString += "d"
        } else {
            boardString += unparsedString[i]
        }
    }
    return boardString
}

function updateBarGraph(p1win, tie, p2win) {
    var total = p1win + tie + p2win
    var p1WinsPercent = 100 * p1win/total
    var p2WinsPercent = 100 * p2win/total
    var tiesPercent = (100 - p1WinsPercent) - p2WinsPercent
    document.getElementById("p1-wins").style.width = p1WinsPercent + "%"
    document.getElementById("ties").style.width = tiesPercent + "%"
    document.getElementById("p2-wins").style.width = p2WinsPercent + "%"
    document.getElementById("p1-wins").innerHTML = p1WinsPercent.toFixed(2) + "%"
    document.getElementById("ties").innerHTML = tiesPercent.toFixed(2) + "%"
    document.getElementById("p2-wins").innerHTML = p2WinsPercent.toFixed(2) + "%"
}

function toggleStop(){
    if (STOP) {
        STOP = false
        document.getElementById("run-button").value = "Stop Analysis"
    }else{
        STOP = true
        document.getElementById("run-button").value = "Start Analysis"
    }
}
