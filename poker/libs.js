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
            table.innerHTML += `\n<tr><td><b>${streets.pop()}</b></td></tr>`
            continue;
        }

    }
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
