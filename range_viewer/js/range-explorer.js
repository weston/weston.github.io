DECK = []
for (var i = 0; i < SUITS.length; i++) {
    for (var j = 0; j < RANKS.length; j++) {
        DECK.push(RANKS[j] + SUITS[i])
    }
}

STOP = true
GLOBAL_HAND_STATS = {
    "rs1": {},
    "rs2": {},
}

function main() {
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

function analysisButtonPressed(){
    toggleStop()
    if (STOP){
        return
    }
    getRangeAllocationStats()
    runAnalysis()
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
        if (data["player1HandWins"][h1] == undefined) {
            data["player1HandWins"][h1] = 0
        }
        if (data["player1HandLosses"][h1] == undefined) {
            data["player1HandLosses"][h1] = 0
        }
        if (data["player2HandWins"][h2] == undefined) {
            data["player2HandWins"][h2] = 0
        }
        if (data["player2HandLosses"][h2] == undefined) {
            data["player2HandLosses"][h2] = 0
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
            data["player1HandWins"][h1]++
            data["player2HandLosses"][h2]++
        } else {
            data["player2Wins"]++
            data["player2HandWins"][h2]++
            data["player1HandLosses"][h1]++
        }
    }
    updateBarGraph(data["player1Wins"], data["ties"], data["player2Wins"])
    updateStats(data)
    setTimeout(function(){runAnalysis(data)}, 0)
}


function completeBoardStringToList(board, deadCards) {
    var boardList = []
    for (var i = 0; i < board.length; i+=2) {
        boardList.push(board[i] + board[i+1])
    }
    if (boardList.length == 5) {
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
    if (h1.length == 4){
        cards.add(h1[0] + h1[1])
        cards.add(h1[2] + h1[3])
    }
    if( h2.length == 4){
        cards.add(h2[0] + h2[1])
        cards.add(h2[2] + h2[3])
    }
    for (var i = 0; i < board.length; i+= 2) {
        cards.add(board[i] + board[i+1])
    }
    return cards.size != ((board.length+h1.length+h2.length)/2)
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

function updateStats(data) {
    GLOBAL_HAND_STATS["rs1"] = {
        "hand_losses": data["player1HandLosses"],
        "hand_wins": data["player1HandWins"],
    }
    GLOBAL_HAND_STATS["rs2"] = {
        "hand_losses": data["player2HandLosses"],
        "hand_wins": data["player2HandWins"],
    }
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

function getRangeAllocationStats() {
    var board = getBoard()
    if (board.length < 6) {
        return
    }
    var r1 = getSelectedHands("rs1")
    var r2 = getSelectedHands("rs2")
    var stats1 = getShowdownStatsDistribution(r1, board)
    var stats2 = getShowdownStatsDistribution(r2, board)

    createShowdownStatsChart("p1-results-canvas", stats1)
    createShowdownStatsChart("p2-results-canvas", stats2)
    createGraph()
}

function getShowdownStatsDistribution(range, board) {
    var boardList = cardStringToList(board)
    var typeToCount = {}
    var total = 0
    for (let hg in range) {
        var weight = range[hg]
        var expandedHands = expandHands(hg)
        for (var i = 0; i < expandedHands.length; i++) {
            var handString = expandedHands[i]
            if (isBlocked(handString, "", board)){
                continue
            }
            var solvedHand = Hand.solve(boardList.concat(cardStringToList(handString)))
            if (typeToCount[solvedHand.name] == undefined) {
                typeToCount[solvedHand.name] = 0
            }
            typeToCount[solvedHand.name] += weight
            total += weight
        }
    }
    var typeToPercent = {}
    for (let type in typeToCount) {
        var percent = ((100 * typeToCount[type])/total).toFixed(2)
        typeToPercent[type] = percent
    }
    return typeToPercent
}

function getSortedHands(range, board) {
    var boardList = cardStringToList(board)
    var hands = []
    for (let hg in range) {
        var weight = range[hg]
        var expandedHands = expandHands(hg)
        for (var i = 0; i < expandedHands.length; i++) {
            var handString = expandedHands[i]
            if (isBlocked(handString, "", board)){
                continue
            }
            var solvedHand = Hand.solve(boardList.concat(cardStringToList(handString)))
            hands.push(solvedHand)
        }
    }
    hands.sort(handCompare)
    return hands
}



function cardStringToList(cardString) {
    var l = []
    for (var i = 0; i < cardString.length; i+= 2) {
        l.push(cardString[i] + cardString[i+1])
    }
    return l
}

function createShowdownStatsChart(parent_id, data) {
    document.getElementById(parent_id).innerHTML = ""
    var ctx = document.getElementById(parent_id).getContext("2d")
    var numbers = []
    var labels = []
    var colors = []
    for (let label in data) {
        labels.push(label)
        numbers.push(data[label])
        colors.push('rgba(255, 99, 132, 0.2)')
    }
    data = {
        datasets: [{
            data: numbers,
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(0, 0, 0, 0.6)'
            ],
        }],
        labels: labels,
    };
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options:{}
    });
}

function createGraph() {
    var hands1 = getSortedHands(getSelectedHands("rs1"), getBoard())
    var hands2 = getSortedHands(getSelectedHands("rs2"), getBoard())
    var ranks1 = []
    var ranks2 = []
    var rankCounter = 0
    var previousHand = undefined
    while(hands1.length > 0 && hands2.length > 0) {
        var winners = Hand.winners([hands1[0], hands2[0]])
        if (winners.length == 1 && winners[0] == hands2[0]) {
            var isNewHand = previousHand == undefined || Hand.winners([hands1[0], previousHand]).length == 1
            if (isNewHand){
                rankCounter++
            }
            previousHand = hands1.shift()
            ranks1.push(rankCounter)
        } else if (winners.length == 1 && winners[0] == hands1[0]) {
            var isNewHand = previousHand == undefined || Hand.winners([hands2[0], previousHand]).length == 1
            if (isNewHand) {
                rankCounter++
            }
            previousHand = hands2.shift()
            ranks2.push(rankCounter)
        } else if (winners.length == 2) {
            var isNewHand = previousHand == undefined || Hand.winners([hands2[0], previousHand]).length == 1
            if (isNewHand){
                rankCounter ++
            }
            hands1.shift()
            preiousHand = hands2.shift()
            ranks1.push(rankCounter)
            ranks2.push(rankCounter)
        } else {
            console.log("something went wrong")
        }
    }
    while(hands1.length > 0) {
        var isNewHand = previousHand == undefined || Hand.winners([hands1[0], previousHand]).length == 1
        if (isNewHand) {
            rankCounter++
        }
        previousHand = hands1.shift()
        ranks1.push(rankCounter)
    }
    while(hands2.length > 0) {
        var isNewHand = previousHand == undefined || Hand.winners([hands2[0], previousHand]).length == 1
        if (isNewHand) {
            rankCounter++
        }
        previousHand = hands2.shift()
        ranks2.push(rankCounter)
    }
    var normalizedRanks1 = []
    var normalizedRanks2 = []

    var xCounter = 0
    for (var i = 0; i < ranks1.length; i++) {
        normalizedRanks1.push({
            x: xCounter,
            y: ranks1[i]
        })
        xCounter += ranks2.length
    }
    xCounter = 0
    for (var i = 0; i < ranks2.length; i++) {
        normalizedRanks2.push({
            x: xCounter,
            y: ranks2[i],
        })
        xCounter += ranks1.length
    }
    var labels = []
    for (var i = 0; i < normalizedRanks1.length; i++) {
        labels.push(i)
    }

    document.getElementById("graph-stats-canvas").innerHTML = ""
    var ctx = document.getElementById("graph-stats-canvas").getContext("2d")
    var mixedChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            data: normalizedRanks1,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 0.6)',
            order: 1,
            pointRadius: 4,
            showLine: true,
            fill: false,
            label: "",
        }, {
            data: normalizedRanks2,
            type: 'scatter',
            backgroundcolor: 'rgba(102, 255, 102, 0.6)',
            borderColor: 'rgba(102, 255, 102, 0.6)',
            order: 2,
            pointRadius: 4,
            showLine: true,
            fill: false,
            label: "",
        }],
    },
    options: {}
    });
}

function handCompare(h1, h2) {
    var winners = Hand.winners([h1, h2]);
    if (winners.length == 0) {
        return 0
    }
    if (winners[0] == h1) {
        return 1
    }
    return -1
}
