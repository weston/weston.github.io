function processData() {
    const url = document.getElementById("url-input").value;
    if (!url) {
        return
    }
    console.log(url);
    const hhToken = url.split('?')[1].replace('hhtoken=', '')
    console.log('HH Token=', hhToken)
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://pokerking.winningpokernetwork.com/frontend/histories/hands/replay?token=${hhToken}`, true);
    xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
        handleResponse(JSON.parse(xhr.responseText))
    } else {
        console.error('The request failed!');
    }
    };

    xhr.onerror = function () {
        console.error('The request failed!');
    };

    xhr.send();
}

function processDataWithID() {
    
    const hhID = document.getElementById("hh-id-input").value;
    if (!hhID) {
        return
    }

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("GET", "https://43d0yapqnl.execute-api.us-east-2.amazonaws.com/A2/wpn_history?hand_id=" + hhID, true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            handleResponse(JSON.parse(xhr.responseText))
        } else {
            console.error('The request failed!');
        }
    };

    xhr.onerror = function () {
        console.error('The request failed!');
    };

    xhr.send();
}


function handleResponse(responsePayload) {
    const table = document.getElementById('result-table');
    table.innerHTML = '<tr><td><b>Preflop</b></td></tr>'
    console.log('In handleResponse')
    const messages = responsePayload[0]['messages'];
    const ignoreTypes = [
        'Round',
        'HandStart',
        'PotGather',
        'Round',
        "NoShowCards",
        "ShowCards",
    ]
    const seatToName = {}
    let startParsing = false;
    let counter = -1;
    let board = ''
    let pot = 0;
    let rake = 0;
    const streets = ['River', 'Turn', 'Flop']
    for (const message of messages) {
        counter += 1;
        if (message['messageType'] == 'TableState') {
            const content = message['messageContent']
            const sitters = content['sitters']
            for (const sitter of sitters) {
                seatToName[sitter['seat']] = sitter['name']
            }
            console.log(seatToName)
            continue;
        }
        if (message['messageType'] == 'PotGather') {
            pot = parseFloat(message['messageContent']['potChips']) / 100
            rake = parseFloat(message['messageContent']['potRakes']) / 100
            continue;
        }


        if (message['messageType'] == 'HoleCards') {
            startParsing = true;
            continue;
        }
        if (!startParsing) {
            continue;
        }
        if (ignoreTypes.includes(message['messageType'])) {
            continue
        }
        if (message['messageType'] == 'SelectionResult') {
            const content = message['messageContent']
            let chipText = ''
            if (content['action']['chip']) {
                chipText = '$' + `${parseFloat(content['action']['chip']) / 100}`
            }
            const actionString =  `${content['action']['flag']} ${chipText}`
            const player = seatToName[content['seat']]
            const currentTS = message['dateTime']
            const previousTS = messages[counter-1]['dateTime']
            const tankAmount = calculateTimeDifference(previousTS, currentTS)
            console.log(currentTS, previousTS, tankAmount)
            const completeText = `<td>${player}:</td><td>${actionString}</td><td>(${tankAmount}s)</td>`
            table.innerHTML += `\n<tr>${completeText}</tr>`
        }
        if (message['messageType'] == 'BoardCards') {
            for (const card of message['messageContent']['cards']) {
                board += ' ' + formatCardColor(card)
            }
            table.innerHTML += '\n<tr><td> </td></tr>'
            table.innerHTML += '\n<tr><td> </td></tr>'
            table.innerHTML += '\n<tr><td> </td></tr>'
            table.innerHTML += `\n\n<tr><td><b>${streets.pop()}: ($${pot} - $${rake})     ${board}</b></td></tr>`
            continue;
        }

    }
}

function formatCardColor(card){
    if (card.includes('d')) {
        card = `<b style="color:blue;">${card}</b>`
    }
    if (card.includes('h')) {
        card = `<b style="color:red;">${card}</b>`
    }
    if (card.includes('c')) {
        card = `<b style="color:green;">${card}</b>`
    }
    return card;
}

function calculateTimeDifference(timestamp1, timestamp2) {
    // Parse the timestamps to Date objects
    var date1 = new Date(timestamp1);
    var date2 = new Date(timestamp2);

    // Calculate the difference in milliseconds
    var differenceInMilliseconds = date2 - date1;

    // Convert milliseconds to seconds with precision up to hundredths of a second
    var differenceInSeconds = differenceInMilliseconds / 1000;

    // Round to two decimal places
    return Math.round(differenceInSeconds * 100) / 100;
}
