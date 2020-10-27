ALL_CARDS = [
    ["AA","AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s"],
    ["AKo","KK","KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","K4s","K3s","K2s"],
    ["AQo","KQo","QQ","QJs","QTs","Q9s","Q8s","Q7s","Q6s","Q5s","Q4s","Q3s","Q2s"],
    ["AJo","KJo","QJo","JJ","JTs","J9s","J8s","J7s","J6s","J5s","J4s","J3s","J2s"],
    ["ATo","KTo","QTo","JTo","TT","T9s","T8s","T7s","T6s","T5s","T4s","T3s","T2s"],
    ["A9o","K9o","Q9o","J9o","T9o","99","98s","97s","96s","95s","94s","93s","92s"],
    ["A8o","K8o","Q8o","J8o","T8o","98o","88","87s","86s","85s","84s","83s","82s"],
    ["A7o","K7o","Q7o","J7o","T7o","97o","87o","77","76s","75s","74s","73s","72s"],
    ["A6o","K6o","Q6o","J6o","T6o","96o","86o","76o","66","65s","64s","63s","62s"],
    ["A5o","K5o","Q5o","J5o","T5o","95o","85o","75o","65o","55","54s","53s","52s"],
    ["A4o","K4o","Q4o","J4o","T4o","94o","84o","74o","64o","54o","44","43s","42s"],
    ["A3o","K3o","Q3o","J3o","T3o","93o","83o","73o","63o","53o","43o","33","32s"],
    ["A2o","K2o","Q2o","J2o","T2o","92o","82o","72o","62o","52o","42o","32o","22"],
]
SUITS = ["c", "d", "h", "s"]
RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
HAND_SPLITTER = ", "
SUIT_TO_SYMBOL = {
    "c": "♣️",
    "d": "♦️",
    "h": "♥️",
    "s": "♠️",
}
SYMBOL_TO_SUIT = {
    "♣️": "c",
    "♦️": "d",
    "♥️": "h",
    "♠️": "s",
}

function getPicker(){
    return document.getElementById("hand-picker")
}



function NewRangeSelector(parent_id, range_selector_id) {
    range_selector = document.createElement("div")
    range_selector.id = range_selector_id

    for (var x = 0; x < 13; x++) {
        var newRow = document.createElement("tr")
        for (var y = 0; y < 13; y++) {
            var c = document.createElement("td")
            c.className = "cell"
            c.innerHTML = ALL_CARDS[x][y]
            c.id = getCellID(ALL_CARDS[x][y], range_selector_id)
            if (x == y) {
                c.classList.add("pocket-pair")
            }
            c.classList.add("noselect")
            c.onmousedown = (function(card, range_selector_id) {
                return function(){
                    toggleSelection(card, range_selector_id)
                    toggleDragToSelect("on", range_selector_id)
                }
            })(ALL_CARDS[x][y], range_selector_id);
            c.onmouseup = function(){toggleDragToSelect("off", range_selector_id)}
            newRow.appendChild(c)
            c.addEventListener("mouseover", function(){
                handleMouseHover(this, range_selector_id)
            });
        }
        range_selector.appendChild(newRow)
    }
    document.getElementById(parent_id).appendChild(range_selector)
}


function toggleDragToSelect(direction, range_selector_id){
    for (var x = 0; x < 13; x++) {
        for (var y = 0; y < 13; y++) {
            var e = document.getElementById(
                getCellID(ALL_CARDS[x][y], range_selector_id))
            if (direction == "on"){
                e.onmouseenter = (function(i) {
                    return function(){
                        toggleSelection(i, range_selector_id)
                        toggleDragToSelect("on", range_selector_id)
                    }
                })(ALL_CARDS[x][y]);
            } else{
                e.onmouseenter = function(){}
            }
        }
    }
}


function getSelectedHands(selector_id) {
    var selectedHands = {}
    for (var x = 0; x < 13; x++) {
        for (var y = 0; y < 13; y++) {
            var e = document.getElementById(getCellID(ALL_CARDS[x][y], selector_id))
            if (e.classList.contains("selected-cell")) {
                var hand = ALL_CARDS[x][y]
                selectedHands[hand] = getHandWeightInt(hand, selector_id)
            }
        }
    }
    return selectedHands
}


function selectHand(hand, selector_id) {
    var weight = getSliderValue()
    var e = document.getElementById(getCellID(hand, selector_id))
    if (e == undefined || e == null) {
        console.log("Not selecting hand" + hand + ". Picker not loaded yet.")
        console.log("Expected on initial load")
        return
    }
    removeAllWeightClasses(hand, selector_id)
    e.classList.add("selected-cell")
    var weightClass = "weight-" + weight
    e.classList.add(weightClass)
}


function deselectHand(hand, selector_id) {
    var e = document.getElementById(getCellID(hand, selector_id))
    if (e == undefined || e == null){
        return
    }
    e.classList.remove("selected-cell")
    removeAllWeightClasses(hand, selector_id)
}


function toggleSelection(hand, selector_id) {
    if (handIsSelected(hand, selector_id)){
        if (getSliderValue() == getHandWeightInt(hand, selector_id)) {
            deselectHand(hand, selector_id)
        } else {
            deselectHand(hand, selector_id)
            selectHand(hand, selector_id)
        }
    } else{
        selectHand(hand, selector_id)
    }
}


function handIsSelected(hand, selector_id) {
    var e = document.getElementById(getCellID(hand, selector_id))
    return e.classList.contains("selected-cell")
}


function removeAllWeightClasses(hand, selector_id) {
    var e = document.getElementById(getCellID(hand, selector_id))
    if (e == undefined || e == null){
        return
    }
    for (var i = 0; i <= 100; i+=5) {
        e.classList.remove("weight-"+i)
    }
}

function getHandWeightInt(hand, selector_id) {
    var e = document.getElementById(getCellID(hand, selector_id))
    if (e == undefined || e == null){
        return
    }
    for (var i = 0; i <= 100; i+=5) {
        if (e.classList.contains("weight-"+i)) {
            return i
        }
    }
    return 0
}


function deselectAllHands(range_selector_id) {
    //TODO
    for (var x = 0; x < 13; x++) {
        for (var y = 0; y < 13; y++) {
            deselectHand(ALL_CARDS[x][y], range_selector_id)
        }
    }
}


function getCellID(hand, selector_id) {
    return "cell-" +selector_id + "-" + hand
}

function getCell(hand, selector_id) {
    return document.getElementById(getCellID(hand, range_selector_id))
}

function handleMouseHover(cell, selector_id) {
    var handString = cell.innerHTML
    var hoverBox = document.getElementById("hover-box")
    hoverBox.innerHTML = ""

    var percentElem = document.createElement("div")
    var weight  = getHandWeightInt(handString, selector_id)
    percentElem.innerHTML = weight + "%"
    percentElem.classList.add("pure-u-1-1")
    percentElem.classList.add("weight-" + weight)
    hoverBox.appendChild(percentElem)
    hoverBox.appendChild(document.createElement("br"))
    hoverBox.appendChild(document.createElement("br"))

    var handsToDisplay = expandHands(handString)
    for (var i = 0; i < handsToDisplay.length; i++) {
        var specificHandString = handsToDisplay[i]
        var elem = document.createElement("div")
        var withSymbols = specificHandString[0] + SUIT_TO_SYMBOL[specificHandString[1]] + specificHandString[2] + SUIT_TO_SYMBOL[specificHandString[3]]
        elem.innerHTML += withSymbols
        if (handsToDisplay.length == 4) {
            elem.classList.add("pure-u-1-4")
        }
        if (handsToDisplay.length == 12) {
            elem.classList.add("pure-u-1-4")
        }
        if (handsToDisplay.length == 6) {
            elem.classList.add("pure-u-1-3")
        }
        elem.classList.add("hover-box-elem")
        hoverBox.appendChild(elem)
    }
}

function expandHands(handString) {
    var allHands = []
    if (handString.length == 2) {
        for (var i = 0; i < SUITS.length; i++) {
            for (var j = 0; j < SUITS.length; j++) {
                if (j <= i) {
                    continue
                }
                var s1 = SUITS[i]
                var s2 = SUITS[j]
                allHands.push(handString[0] + s1 + handString[0] + s2)
            }
        }
    } else if (handString[2] == "s") {
        for (var i = 0; i < SUITS.length; i++) {
            var s = SUITS[i]
            allHands.push(handString[0] + s + handString[1] + s)
        }
    } else {
        for (var i = 0; i < SUITS.length; i++) {
            for (var j = 0; j < SUITS.length; j++) {
                var s1 = SUITS[i]
                var s2 = SUITS[j]
                if (s1 == s2) {
                    continue
                }
                allHands.push(handString[0] + s1 + handString[1] + s2)
            }
        }
    }
    return allHands
}


//
// Slider stuff
//
function handleSliderChange() {
    var displayNumber = getSliderValue()
    document.getElementById("selector-weight-value").innerHTML = displayNumber

}

function getSliderValue() {
    var slider = document.getElementById("slider")
    return slider.value * 5
}
