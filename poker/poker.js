
CHART_CONFIG= {
    chart: {
        container: "#main-chart"
    },
    nodeStructure: {
        text: { name: "Preflop Range" },
        children: [
            {
                text: { name: "First child" }
            },
            {
                text: { name: "Second child" }
            }
        ]
    }
};

ROOT = {
    name: "preflop",
    cards: "",
    children: [],
}


function main(){
    new Treant( CHART_CONFIG );
}


function createNewNode(){
    parentName = document.getElementById("new-node-parent").value
    newChildName = document.getElementById("new-node-name").value
    if (parentName.length == 0 || newChildName.length == 0) {
        console.log("Must provide both a new child and an existing parent")
        return
    }
    if (!nodeNameExists(ROOT, parentName)) {
        console.log("This parent does not exist")
        return
    }
    if (nodeNameExists(ROOT, newChildName)) {
        console.log("Child by this name already exists")
        return
    }
    console.log("Creating a new node")
}


function deleteNode(){
    nodeToDeleteName = document.getElementById("delete-node-name").value
    if (!nodeNameExists(ROOT, nodeToDeleteName)){
        console.log("Node does not exist")
        return
    }
}


// Recursively checks to see if a node by
// the name nodeName exists.
function nodeNameExists(root, nodeName) {
    if (root.name == nodeName) {
        return true
    }
    for (var n in root.children) {
        if (nodeNameExists(n, nodeName)) {
            return true
        }
    }
    return false
}
// Create, Delete, Edit node
