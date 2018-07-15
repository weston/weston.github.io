// Parameters. These should change every competition.
// You can get the COMPETITION_ID by looking at the cid url param
// in cubecomps.
COMPETITION_NAME = "WCCT Cupertino"
COMPETITION_ID = 3167


// Settings (These should not have to change every competition)
BASE_CUBECOMPS_URL = "http://m.cubecomps.com/competitions/" + COMPETITION_ID + "/"
RESULT_TABLE_ID = "results-table"
RESULTS_PER_PAGE = 8
REFRESH_SECONDS = 10
TITLE_ID = "title"


// "top" mode: print the top 16 results of a round so far
// "round" mode: scroll through all results of a round
// The mode can either be "top", "round", or an integer. If it is an integer,
// displays that many results.
TOP_MODE = "top"
ROTATE_MODE = "rotate"
LUNCH_MODE = "lunch"

function updateTitle(eventID, round) {
    eventData = queryUrl(BASE_CUBECOMPS_URL + "events.json")
    console.log(eventData);

    var final_round = false;
    for (var i = 0; i < eventData.length; i++) {
      if (eventData[i]["rounds"][0]["event_id"] == eventID
          && eventData[i]["rounds"].length == round) {
        final_round = true;
        break;
      }
    }
    var title = document.getElementById(TITLE_ID);
    title.innerHTML = COMPETITION_NAME + " - " + prettyEvent(getParameter("event"))
    if (final_round) {
      title.innerHTML += " Final";
		} else {
      title.innerHTML += " Round " + round;
    }
}

function main() {
    var mode = getParameter("mode")
    // see eventNameToID
    var eventID = eventNameToID(getParameter("event"))
    // 1 2 3 4 or 5
    var round = getParameter("round");
    updateTitle(eventID, round);
    if (!isNaN(parseInt(mode))) {
        handleCountMode(eventID, round, parseInt(mode))
    } else if (mode == ROTATE_MODE) {
        handleRotateMode(eventID, round)
    } else if (mode == TOP_MODE) {
        handleTopMode(eventID, round)
        setTimeout(function () { location.reload(true); }, 1000 * REFRESH_SECONDS);
    } else if (mode == LUNCH_MODE) {
        handleLunchMode()
    }
}

function handleTopMode(eventID, round) {
    var roundData = getResultsResponse(eventID, round)
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


function handleCountMode(eventID, round, count) {
    var roundData = getResultsResponse(eventID, round)
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


function handleRotateMode(eventID, round) {
    var roundData = getResultsResponse(eventID, round)
    handleRoundModeHelper(roundData, 0)
}


function handleRoundModeHelper(results, startIndex) {
    var table = document.getElementById(RESULT_TABLE_ID);
    table.innerHTML = ""
    if (startIndex + 1 > results.length) {
        location.reload(true)
        return
    }
    placeTableHeaders(results)
    resultsToDisplay = results.slice(startIndex, startIndex + RESULTS_PER_PAGE)
    for (var i = 0; i < resultsToDisplay.length; i++) {
        appendResultRow(resultsToDisplay[i], i % 2 == 0)
    }
    newStartIndex = startIndex + RESULTS_PER_PAGE
    setTimeout(
        function () {
            handleRoundModeHelper(results, newStartIndex);
        },
        1000 * REFRESH_SECONDS
    );
}


function handleLunchMode() {
    var eventsData = queryUrl(BASE_CUBECOMPS_URL + "events.json")
    handleLunchModeHelper(eventsData, 0)
    // Rotate through the latest round results for all events
}


function handleLunchModeHelper(eventsData, index) {
    if (startIndex + 1 > results.length) {
        location.reload(true)
        return
    }
    var evnt = eventsData[index]
    var lastFinished = null
    var currentLive = null
    var name = evnt["name"]
    for (var i = 0; i < evnt["rounds"].length; i++) {
        var round = envt["rounds"][i]
        if (round["finished"]) {
            lastFinished = round
        }
        if (round["live"]) {
            displayLunchRound(name, round)
            // set timeout
            return
        }
    }
    if (lastFinished != null) {
        displayLunchRound(name, round)
        // set timeout
        return
    }
    handleLunchModeHelper(eventsData, index + 1)
}


function displayLunchRound(name, roundData) {
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
    // Make a query to the results api
    // Display these results
}




function appendResultRow(resultData, isEven) {
    var table = document.getElementById(RESULT_TABLE_ID);
    var newRow = document.createElement("tr")
    var columns = ["position", "name", "country", "t1", "t2", "t3", "t4", "t5", "mean", "average", "best"]
    for (var i = 0; i < columns.length; i++) {
        console.log(resultData)
        columnString = columns[i]
        if (!(columnString in resultData)) {
            continue
        }
        var col = document.createElement("td")
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

function queryUrl(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false );
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
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
    name = name.toLowerCase()
    if (name == "333") return "3x3"
    if (name == "222") return "2x2"
    if (name == "444") return "4x4"
    if (name == "555") return "5x5"
    if (name == "666") return "6x6"
    if (name == "777") return "7x7"
    if (name == "clock") return "Clock"
    if (name == "mega") return "Megaminx"
    if (name == "pyra") return "Pyraminx"
    if (name == "squan") return "Square-1"
    if (name == "oh") return "3x3 One Handed"
    if (name == "feet") return "3x3 With Feet"
    if (name == "fmc") return "FMC"
    if (name == "bld" || name == "3bld") return "BLD"
    if (name == "4bld") return "4BLD"
    if (name == "5bld") return "5BLD"
    if (name == "mbld") return "MBLD"
    if (name == "skewb") return "Skewb"
    return name
}
