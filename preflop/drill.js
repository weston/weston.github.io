RIGHT_COLOR = "#d1fac5"
WRONG_COLOR = "#e6baba"

function main() {
    buttons = document.getElementById("buttons")
    previousType = null
    RANGES.forEach(function (item, index) {
        if (item["type"] != previousType) {
            buttons.appendChild(document.createElement("br"))
            var allButton = document.createElement("button")
            allButton.innerHTML = "<b>All " +item["type"] + "</b>"
            allButton.onclick = function() {
                //startGameByType(previousType)
            }
            //buttons.appendChild(allButton)
        }
        var btn = document.createElement("button");
        btn.innerHTML = item["name"]
        btn.onclick = function(){runGame(item["name"], null)}
        buttons.appendChild(btn)
        previousType = item["type"]
    });
}


function runGame(rangeName, previousResult) {
    if (previousResult != null) {
        pr = document.getElementById("previous_result")
        pr.innerHTML = previousResult
    }
    range = getRangeByName(rangeName)
    var hand = getTrialHand(range)

    situationElement = document.getElementById("situation")
    situationElement.innerHTML = range["name"]
    drawHand(hand)
    outButton = document.getElementById("out_button")
    inButton = document.getElementById("in_button")
    inButton.innerHTML = range["in"] + " (p)"
    outButton.innerHTML = range["out"] + " (q)"
    parsedHands = parseHandString(range["hands"])
    isIn = parsedHands.includes(hand)
    if (isIn) {
        inButton.onclick = function() {
            changeBackgroundColor(RIGHT_COLOR)
            runGame(rangeName, "Correct! (" + hand + ")")
        }
        outButton.onclick = function() {
            changeBackgroundColor(WRONG_COLOR)
            runGame(rangeName, "Incorrect! (" + hand + ")")
        }
    }else {
        inButton.onclick = function() {
            changeBackgroundColor(WRONG_COLOR)
            runGame(rangeName, "Incorrect! (" + hand + ")")
        }
        outButton.onclick = function() {
            changeBackgroundColor(RIGHT_COLOR)
            runGame(rangeName, "Correct! (" + hand + ")")
        }
    }
}


function drawHand(hand) {
    handElement = document.getElementById("hand")
    suits = [
        "♠",
        "<span style='color:red'>♥</span>",
        "<span style='color:blue'>♦</span>",
        "<span style='color:green'>♣</span>",
    ]
    s1 = suits[Math.floor(Math.random() * suits.length)]
    s2 = suits[Math.floor(Math.random() * suits.length)]
    if (hand.length == 2) {
        while (s2 == s1) {
            s2 = suits[Math.floor(Math.random() * suits.length)]
        }
        handElement.innerHTML = hand[0] + s1 + " " + hand[1] + s2
    } else if (hand[2] == "s") {
        handElement.innerHTML = hand[0] + s1 + " " + hand[1] + s1
    } else {
        handElement.innerHTML = hand[0] + s1 + " " + hand[1] + s2
    }
    handElement = document.getElementById("hand")
}


function getRangeByName(name) {
    for (var i = 0; i < RANGES.length; i++ ) {
        if (RANGES[i]["name"] == name){
            return RANGES[i]
        }
    }
    return null
}


function getTrialHand(range){
    // TODO: Get hands on the border more
    ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]
    n1 = Math.floor(Math.random() * ranks.length)
    n2 = Math.floor(Math.random() * ranks.length)
    c1 = ranks[Math.max(n1, n2)]
    c2 = ranks[Math.min(n1, n2)]
    if (c1 == c2) {
        return c1+c2
    }
    suitedness = ["o", "s"][Math.floor(Math.random() * 2)]
    return c1+c2+suitedness

}


function parseHandString(handString) {
    parsedHands = []
    hands = handString.split(",")
    for (var i = 0; i < hands.length; i++){
        hand = hands[i]
        if( hand.length == 3){
            parsedHands.push(hand)
        } else if (hand[0] == hand[1]) {
            parsedHands.push(hand)
        }else{
            parsedHands.push(hand + "o")
            parsedHands.push(hand + "s")
        }
    }
    return parsedHands
}


function acceptInput(evt){
    if (evt["key"] == "q") {
        document.getElementById("out_button").click()
    }
    if (evt["key"] == "p") {
        document.getElementById("in_button").click()
    }
}


function changeBackgroundColor(color){
    body = document.getElementById("body")
    body.style.backgroundColor=color
}
