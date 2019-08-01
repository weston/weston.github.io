// Example request:
// /stream/results.html?competition_id=4547&event=333&round=1&mode=3
//
// Parameters. These should change every competition.
// You can get the COMPETITION_ID by looking at the cid url param
// in cubecomps.
COMPETITION_NAME = "Cubing USA Nationals 2019"

// Settings (These should not have to change every competition)
RESULT_TABLE_ID = "results-table"
RESULTS_PER_PAGE = 6
REFRESH_SECONDS = 10
TITLE_ID = "title"

ROUND_START_INDEX = 0
LUNCH_MODE_TIMEOUT = 1000 * 5
LUNCH_MODE_EVENT_INDEX = 0


// "top" mode: print the top 16 results of a round so far
// "round" mode: scroll through all results of a round
// The mode can either be "top", "round", or an integer. If it is an integer,
// displays that many results.
TOP_MODE = "top"
ROTATE_MODE = "rotate"
LUNCH_MODE = "lunch"

function updateTitle(eventName, round) {
    eventID = eventNameToID(eventName)
    var cb = function (eventData) {
        var final_round = false;
        for (var i = 0; i < eventData.length; i++) {
          if (eventData[i]["rounds"][0]["event_id"] == eventID
              && eventData[i]["rounds"].length == round) {
            final_round = true;
            break;
          }
        }
        var title = document.getElementById(TITLE_ID);
        title.innerHTML = COMPETITION_NAME + " - " + prettyEvent(eventName)
        if (final_round) {
          title.innerHTML += " Final";
            } else {
          title.innerHTML += " Round " + round;
        }
    };
    queryUrlWithCallback(BASE_CUBECOMPS_URL + "events.json", cb)
}

function main() {
    COMPETITION_ID = getParameter("competition_id")
    BASE_CUBECOMPS_URL = "http://m.cubecomps.com/competitions/" + COMPETITION_ID + "/"
    var mode = getParameter("mode")
    if (mode == LUNCH_MODE) {
        handleLunchMode()
        return
    }

    // see eventNameToID
    var eventName = getParameter("event")
    var eventID = eventNameToID(eventName)
    // 1 2 3 4 or 5
    var round = getParameter("round");
    updateTitle(eventName, round);
    if (!isNaN(parseInt(mode))) {
        handleCountMode(eventID, round, parseInt(mode))
    } else if (mode == ROTATE_MODE) {
        handleRotateMode(eventID, round)
    } else if (mode == TOP_MODE) {
        handleTopMode(eventID, round)
        setTimeout(function () { location.reload(true); }, 1000 * REFRESH_SECONDS);
    }
}

function handleTopMode(eventID, round) {
    var cb = function(roundData) {
        if (roundData.length == 0) {
            return
        }
        placeTableHeaders(roundData)
        for (var i = 0; i < roundData.length; i++) {
            var competitorResult = roundData[i]
            if (competitorResult === undefined) {
                return
            }
            if (competitorResult["top_position"] == false) {
                return
            }
            appendResultRow(competitorResult, i % 2 == 0)
        }
    }
    getResultsResponseWithCallback(eventID, round, cb)
}


function handleCountMode(eventID, round, count) {
    var cb = function(roundData) {
        if (roundData.length == 0) {
            return
        }
        placeTableHeaders(roundData)
        for (var i = 0; i < Math.min(roundData.length, count); i++) {
            var competitorResult = roundData[i]
            if (competitorResult === undefined) {
                return
            }
            appendResultRow(competitorResult, i % 2 == 0)
        }
    }
    getResultsResponseWithCallback(eventID, round, cb)
}


function handleRotateMode(eventID, round) {
    getResultsResponseWithCallback(eventID, round, handleRoundModeHelper)
}


function handleRoundModeHelper(results) {
    var table = document.getElementById(RESULT_TABLE_ID);
    table.innerHTML = ""
    if (ROUND_START_INDEX + 1 > results.length) {
        location.reload(true)
        return
    }
    placeTableHeaders(results)
    resultsToDisplay = results.slice(
        ROUND_START_INDEX, ROUND_START_INDEX + RESULTS_PER_PAGE)
    for (var i = 0; i < resultsToDisplay.length; i++) {
        appendResultRow(resultsToDisplay[i], i % 2 == 0)
    }
    ROUND_START_INDEX = ROUND_START_INDEX + RESULTS_PER_PAGE
    setTimeout(
        function () {
            handleRoundModeHelper(results);
        },
        1000 * REFRESH_SECONDS
    );
}


function handleLunchMode() {
    queryUrlWithCallback(BASE_CUBECOMPS_URL + "events.json", displayLunchRounds)
}


function displayLunchRounds(eventList) {
    curEventIndex = LUNCH_MODE_EVENT_INDEX
    if (LUNCH_MODE_EVENT_INDEX + 1 > eventList.length) {
        location.reload(true)
        return
    }
    var evnt = eventList[LUNCH_MODE_EVENT_INDEX]
    var roundToDisplay = null
    var name = evnt["name"]
    for (var h = 0; h < evnt["rounds"].length; h++) {
        var round = evnt["rounds"][h]
        if (round["finished"]) {
            roundToDisplay = round
        }
        if (round["live"]) {
            roundToDisplay = round
            break
        }
    }
    LUNCH_MODE_EVENT_INDEX += 1
    if (roundToDisplay != null) {
        displayLunchRound(name, roundToDisplay)
        setTimeout(function() {
            displayLunchRounds(eventList)}, LUNCH_MODE_TIMEOUT)
        return
    }
    displayLunchRounds(eventList)
}


function displayLunchRound(name, roundData){
    var eventID = roundData["event_id"]
    var round = roundData["id"]
    updateTitle(name, round);
    clearResultsTable()
    handleCountMode(eventID, round, 8)
    /*
    {
        "competition_id": "1094",
        "event_id": "1",
        "id": "1", This is the round number
        "name": "First Round",  Put this somewhere on the screen
        "live": false,
        "finished": true
    },
    */
}


function clearResultsTable() {
    document.getElementById(RESULT_TABLE_ID).innerHTML = ""
}


function appendResultRow(resultData, isEven) {
    var table = document.getElementById(RESULT_TABLE_ID);
    var newRow = document.createElement("tr")
    var columns = ["position", "name", "country", "t1", "t2", "t3", "t4", "t5", "mean", "average", "best"]
    for (var i = 0; i < columns.length; i++) {
        columnString = columns[i]
        if (!(columnString in resultData)) {
            continue
        }
        var col = document.createElement("td")
        col.style="border: 1px solid #00ccff"
        if (columnString == "average"
            || columnString == "mean") {
          col.className = "average";
        }
        col.innerHTML = resultData[columnString]
        newRow.append(col)
    }
    if (isEven) {
        newRow.className = "even"
    }
    table.appendChild(newRow)
}


function placeTableHeaders(roundData) {
    // Some events only have 3 solves.
    var headers = ["#", "Name", "Country", "Solve 1", "Solve 2", "Solve 3"]
    if ("t4" in roundData[0] && "t5" in roundData[0]) {
        headers.push("Solve 4")
        headers.push("Solve 5")
        headers.push("Average")
    } else {
        headers.push("Mean")
    }
    headers.push("Best")
    var table = document.getElementById(RESULT_TABLE_ID);
    var row = document.createElement("tr")
    for (var i = 0; i < headers.length; i++) {
        header = headers[i]
        var column = document.createElement("td")
        if (header == "Average"
            || header == "Mean") {
          column.className = "average";
        }
        column.innerHTML = header
        row.appendChild(column)
    }
    table.appendChild(row)
}

function createCubecompsRoundResultsURL(eventID, round) {
    var url = BASE_CUBECOMPS_URL
    url += "events/" + eventID
    url += "/rounds/" + round
    url += "/results.json"
    return url
}


function getResultsResponse(eventID, round) {
    var url = createCubecompsRoundResultsURL(eventID, round)
    return queryUrl(url)
}

function getResultsResponseWithCallback(eventID, round, cb){
    var url = createCubecompsRoundResultsURL(eventID, round)
    queryUrlWithCallback(url, cb)
}

function queryUrl(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false );
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}

function queryUrlWithCallback(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (this.readyState === this.DONE) {
            callback(JSON.parse(this.responseText))
        }
    }
    xhr.open("GET", url)
    xhr.send()
}

function getParameter(name) {
    url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


function eventNameToID(name) {
    name = name.toLowerCase()
    if (name == "333") return 1
    if (name == "222") return 2
    if (name == "444") return 3
    if (name == "555") return 4
    if (name == "666") return 5
    if (name == "777") return 6
    if (name == "clock") return 7
    if (name == "mega") return 10
    if (name == "pyra") return 11
    if (name == "squan") return 12
    if (name == "oh") return 13
    if (name == "feet") return 14
    if (name == "fmc") return 15
    if (name == "bld" || name == "3bld") return 16
    if (name == "4bld") return 17
    if (name == "5bld") return 18
    if (name == "mbld") return 19
    if (name == "skweb") return 20
    console.log("COULD NOT IDENTIFY EVENT STRING")
    return null
}

function prettyEvent(name) {
    lower_name = name.toLowerCase()
    if (lower_name == "333") return "3x3"
    if (lower_name == "222") return "2x2"
    if (lower_name == "444") return "4x4"
    if (lower_name == "555") return "5x5"
    if (lower_name == "666") return "6x6"
    if (lower_name == "777") return "7x7"
    if (lower_name == "clock") return "Clock"
    if (lower_name == "mega") return "Megaminx"
    if (lower_name == "pyra") return "Pyraminx"
    if (lower_name == "squan") return "Square-1"
    if (lower_name == "oh") return "3x3 One Handed"
    if (lower_name == "feet") return "3x3 With Feet"
    if (lower_name == "fmc") return "FMC"
    if (lower_name == "bld" || name == "3bld") return "BLD"
    if (lower_name == "4bld") return "4BLD"
    if (lower_name == "5bld") return "5BLD"
    if (lower_name == "mbld") return "MBLD"
    if (lower_name == "skewb") return "Skewb"
    return name
}
