ROOT = {
    name: "preflop range",
    cards: "",
    children: [],
    number: "0",
}

BASE_URL = "https://weston.github.io/poker/"
NODE_COUNT = 0
SELECTED_NODE = "" // Set to 0 in main

SELECTED_COLOR = "#98d3f5"
DEFAULT_COLOR = "white"
HIGHLIGHT_COLOR = "#d5f7de"

function main(){
    redraw()
    selectNode("0")
    var data = getParameter("data")
    var board = getParameter("board")
    if (data != null && data != undefined && data != ""){
        ROOT = JSON.parse(data)
        // This is a hack. This should be saved in the link, and then
        // set here.
        NODE_COUNT = 100
        redraw()
    }
    if (board != null && board != undefined) {
        document.getElementById("board").value = board
    }
    drawPicker()
}


function createNewNode(){

    var newChildName = document.getElementById("new-node-name").value
    if (newChildName.length == 0) {
        console.log("You must provide a child name")
        return
    }
    createNewNodeWithName(newChildName)
}


function createNewNodeWithName(newChildName){
    if (SELECTED_NODE == "") {
        console.log("No selected node")
        return
    }
    var parentNumber = SELECTED_NODE
    console.log("Creating a new node")
    var parentNode = getNode(ROOT, parentNumber)
    if (parentNode == null){
        console.log(parentNumber)
        console.log("Node does not exist")
        return
    }
    NODE_COUNT += 1
    parentNode.children.push({
        name: newChildName,
        cards: "",
        children: [],
        number: NODE_COUNT.toString(),
    })
    redraw()
}


function deleteNode(){
    var nodeToDeleteNumber = SELECTED_NODE
    if (nodeToDeleteNumber == 0) {
        return
    }
    var parentNode = getParent(ROOT, nodeToDeleteNumber)
    if (parentNode == null) {
        console.log("Node does not exist")
        return
    }
    for( var i = 0; i < parentNode.children.length; i++){
        if (parentNode.children[i].number == nodeToDeleteNumber) {
            parentNode.children.splice(i, 1);
        }
    }
    redraw()
}


function updateNodeCards(){
    var updateNodeNumber = SELECTED_NODE
    var newCards = getSelectedHands().join(HAND_SPLITTER)
    console.log(newCards)
    var node = getNode(ROOT, updateNodeNumber)
    node.cards = newCards
    redraw()
}


function redraw(){
    document.getElementById("main-chart").innerHTML = ""
    var CHART_CONFIG = {
        chart: {
            container: "#main-chart",
            node: {HTMLclass: "customNode"}
        },
        nodeStructure: getNodeStructureForNode(ROOT)
    };
    new Treant(CHART_CONFIG);
    for (var i = 0; i < NODE_COUNT + 1; i++) {
        var nodeID = getNodeID(i.toString())
        var elem = document.getElementById(nodeID)
        if (elem != undefined) {
            // Necessary because javascript sucks
            var nodeNumber = i.toString()
            elem.onclick = (function(i) {
                return function(){selectNode(i)}})(nodeNumber);
            elem.onmouseenter = (function(i) {
                return function(){highlightNode(i)}})(nodeNumber);
            elem.onmouseleave = (function(i) {
                return function(){unHighlightNode(i)}})(nodeNumber);
        }
    }
    colorNode(SELECTED_NODE, SELECTED_COLOR)
    updateLink()
}


function highlightNode(nodeNumber){
    if (nodeNumber == SELECTED_NODE) {
        return
    }
    colorNode(nodeNumber, HIGHLIGHT_COLOR)
    var n = getNode(ROOT, nodeNumber)
    highlightHands(n.cards)
}


function unHighlightNode(nodeNumber){
    if (nodeNumber == SELECTED_NODE) {
        return
    }
    colorNode(nodeNumber, DEFAULT_COLOR)
    unHighlightHands()
}


function colorNode(nodeNumber, color) {
    var n = document.getElementById(getNodeID(nodeNumber))
    if (n != undefined && n != null) {
        n.style.backgroundColor = color
    }
}


function selectNode(nodeNumber){
    if (nodeNumber == "") {
        return
    }
    // Unselect a node
    if (SELECTED_NODE == nodeNumber){
        colorNode(nodeNumber, DEFAULT_COLOR)
        SELECTED_NODE = ""
        return
    }
    colorNode(SELECTED_NODE, DEFAULT_COLOR)
    SELECTED_NODE = nodeNumber
    colorNode(SELECTED_NODE, SELECTED_COLOR)
    var internalNode = getNode(ROOT, nodeNumber)
    setRangePickerRange(internalNode.cards)
}

function getNodeID(nodeNumber){
    return "node-" + nodeNumber
}


// Looks at the poker.js nodes and turns them into
// treant.js style node structures
function getNodeStructureForNode(node) {
    // TODO Make this a photo of the cards instead of text
    var currentNodeConfig = {
        text: {
            name: node.name,
            desc: node.cards,
        },
        HTMLid: "node-" + node.number,
        children: []
    }
    for (var i = 0; i < node.children.length; i++) {
        currentNodeConfig.children.push(getNodeStructureForNode(node.children[i]))
    }
    return currentNodeConfig
}


// Recursively gets a node by number
// returns null if the node does not exist
function getNode(root, nodeNumber) {
    if (root.number == nodeNumber) {
        return root
    }
    for (var i = 0; i < root.children.length; i++) {
        c = getNode(root.children[i], nodeNumber)
        if (c != null) {
            return c
        }
    }
    return null
}


function getParent(root, nodeNumber) {
    if (root.number == nodeNumber) {
        return null
    }
    for (var i = 0; i < root.children.length; i++) {
        if (root.children[i].number == nodeNumber){
            return root
        }
    }
    return null
}


function updateLink(){
    var elem = document.getElementById("generated-link")
    var board = document.getElementById("board").value
    var newURL = BASE_URL + "?data=" + encodeURI(JSON.stringify(ROOT)) + "&board=" + board
    elem.value = newURL
}


function getParameter(name) {
    var url = window.location.href;
    var name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


function appendBoard(button) {
    document.getElementById("board").value = document.getElementById(
        "board").value + button.value
}


function selectParentNodeCards(){
    var parentNode = getParent(ROOT, SELECTED_NODE)
    setRangePickerRange(parentNode.cards)
}


function createXRCCXFChildren(){
    createNewNodeWithName("Check Call")
    createNewNodeWithName("Check Raise")
    createNewNodeWithName("Check Fold")
}
