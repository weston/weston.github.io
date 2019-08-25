// Input is a string
function abbreviateHandList(handsString){
    var individualHands = handsString.split(HAND_SPLITTER)
    var pocketPairs = []
    var suitedHands = []
    var offsuitHands = []
    var resultString = ""
    for (var i = 0; i < individualHands.length; i++){
        if (individualHands[i].length == 2){
            pocketPairs.push(individualHands[i])
        } else if (individualHands[i].endsWith("o")) {
            offsuitHands.push(individualHands[i])
        }else{
            suitedHands.push(individualHands[i])
        }
    }

    var ord = {
        "2": 0, "3": 1, "4": 2, "5": 3, "6": 4,
        "7": 5, "8": 6, "9": 7, "T": 8, "J": 9,
        "Q": 10, "K": 11, "A": 12
    }

    // Abbreviate Pocket Pairs
    pocketPairs.sort(function(a, b){return ord[a[0]] - ord[b[0]]})
    if (pocketPairs.length == 1){
        resultString += pocketPairs[0] + ", "
    }
    if (pocketPairs.length > 1){
        var pps = [pocketPairs[0]]
        for (var i = 1; i < pocketPairs.length; i++) {
            var prev = pps[pps.length - 1]
            if (ord[pocketPairs[i][0]] - ord[prev[0]] == 1){
                pps.push(pocketPairs[i])
            } else{
                if (pps.length < 3){
                    resultString += pps.join(", ") + ", "
                }else{
                    resultString += pps[0] + "-" + pps[pps.length-1] + ", "
                }
                pps = [pocketPairs[i]]
            }
        }
        if (pps.length < 3){
            resultString += pps.join(", ") + ", "
        }else{
            resultString += pps[0] + "-" + pps[pps.length-1] + ", "
        }
    }

    // Abbreviate  Other hands
    for (var q = 0; q < 2; q++) {
        var handsArray = [offsuitHands, suitedHands][q]
        handsArray.sort(function(a, b){
            if (ord[a[0]] != ord[b[0]]){
                return ord[a[0]] - ord[b[0]]
            }
            return ord[a[1]] - ord[b[1]]
        })
        var ranks = Object.keys(ord)
        ranks.sort(function(a, b){return ord[a] - ord[b]})
        for (var r = 0; r < ranks.length; r++) {
            var currentRankHands = []
            for (var i = 0; i < handsArray.length; i++) {
                if (handsArray[i][0] == ranks[r]) {
                    currentRankHands.push(handsArray[i])
                }
            }
            if (currentRankHands.length == 0){
                continue
            }
            var handsToJoin = [currentRankHands[0]]
            for (var i = 1; i < currentRankHands.length; i++) {
                var previous =  handsToJoin[handsToJoin.length - 1]
                if (ord[currentRankHands[i][1]] - ord[previous[1]] > 1){
                    if (handsToJoin.length < 3){
                        resultString += currentRankHands.join(", ") + ", "
                    }else {
                        resultString += handsToJoin[0] + "-" + handsToJoin[handsToJoin.length-1] + ", "
                    }

                    handsToJoin = [currentRankHands[i]]
                }else{
                    handsToJoin.push(currentRankHands[i])
                }
            }
            if (handsToJoin.length < 3){
                resultString += currentRankHands.join(", ") + ", "
            } else if (handsToJoin.length >= 3) {
                resultString += handsToJoin[0] + "-" + handsToJoin[handsToJoin.length-1] + ", "
            }
        }
    }
    return resultString.substring(0, resultString.length-2)
}


function getMiniGrid(handString, nodeName){
    var ord = {
        "2": 0, "3": 1, "4": 2, "5": 3, "6": 4,
        "7": 5, "8": 6, "9": 7, "T": 8, "J": 9,
        "Q": 10, "K": 11, "A": 12
    }
    var individualHands = handString.split(HAND_SPLITTER)
    var elems = []
    var container = document.createElement("center")
    var title = document.createElement("div")
    title.innerHTML = nodeName
    title.classList.add("mini-grid-title")
    container.appendChild(title)
    var miniGrid = document.createElement("div")
    container.appendChild(miniGrid)
    miniGrid.classList.add("mini-grid")
    for (var i = 0; i < 13; i++){
        var elemsRow = []
        var row = document.createElement("div")
        row.classList.add("mini-grid-row")
        for (var j = 0; j < 13; j++) {
            var c = document.createElement("span")
            if (i == j ) {
                c.classList.add("pocket-pair")
            }
            c.classList.add("mini-grid-cell")
            elemsRow.push(c)
            row.appendChild(c)
            c.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;"
        }
        elems.push(elemsRow)
        miniGrid.appendChild(row)
    }
    if (individualHands.length == 1 && individualHands[0] == ""){
        return container
    }
    for (var i = 0; i < individualHands.length; i++) {
        var hand = individualHands[i]
        var x = hand[0]
        var y = hand[1]
        if (hand.length == 3 && hand[2] == 'o') {
            x = hand[1]
            y = hand[0]
        }
        elems[12-ord[x]][12-ord[y]].classList.add("mini-grid-selected-cell")
        elems[12-ord[x]][12-ord[y]].backgroundColor = "red"
    }
    return container
}




