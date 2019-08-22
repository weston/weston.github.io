ROOT = {
    name: "preflop range",
    cards: "",
    children: [],
    number: 0,
}
NODE_COUNT = 0

function main(){
    redraw()
}


function createNewNode(){
    var parentNumber = parseInt(document.getElementById("new-node-parent").value, 10)
    var newChildName = document.getElementById("new-node-name").value
    var newInputRange = document.getElementById("new-input-range").value
    if (newChildName.length == 0) {
        console.log("You must provide a child name")
        return
    }
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
        cards: newInputRange,
        children: [],
        number: NODE_COUNT,
    })
    redraw()
}


function deleteNode(){
    var nodeToDeleteNumber = parseInt(document.getElementById("delete-node-number").value, 10)
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
    var updateNodeNumber = parseInt(document.getElementById("update-node-number").value, 10)
    var newCards = document.getElementById("input-range").value
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
}

// Looks at the poker.js nodes and turns them into
// treant.js style node structures
function getNodeStructureForNode(node) {
    // TODO Make this a photo of the cards instead of text
    var currentNodeConfig = {
        text: {
            title: node.number,
            name: node.name,
            desc: node.cards,
        },
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
        console.log(root.children[i].number)
        console.log(nodeNumber)
        if (root.children[i].number == nodeNumber){
            return root
        }
    }
    return null
}
