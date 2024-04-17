// Preflop
const RFI = 'RFI';
const OPEN_FOLD = 'Fold';
const CALL_VS_RFI = 'Call RFI';
const FOLD_VS_RFI = 'Fold v. RFI';
const THREE_BET_VS_RFI = '3b';
const CALL_VS_THREE_BET = 'Call 3b';
const FOLD_VS_THREE_BET = 'Fold to 3b';
const FOUR_BET_VS_THREE_BET = '4b';

// flop
const CBET = 'CBet';
const DECLINE_TO_CBET = 'XB';
const FOLD_VS_CBET = 'Fold vs CBet';
const CALL_VS_CBET = 'Call CBet';
const RAISE_VS_CBET = 'Raise CBet';

const DELAY_CBET = 'Delay CB'
const DECLINE_DELAY_CBET = 'X DCB Opp.'
const DEFEND_VS_DELAY_CBET = 'Defend DCB'
const FOLD_TO_DELAY_CBET = 'Fold to DCB'

const PROBE_TURN = 'Probe Turn'
const DECLINE_PROBE_TURN = 'X T Prb Opp.'
const DEFEND_VS_TURN_PROBE = 'Def vs T Probe'
const FOLD_VS_TURN_PROBE = 'FOLD vs T Probe'

// turn
const STAT_TO_SIBLING_STATS = {}

const ALL_STATS = [
    RFI,
    OPEN_FOLD,
    CALL_VS_RFI,
    FOLD_VS_RFI,
    THREE_BET_VS_RFI,
    CALL_VS_THREE_BET,
    FOLD_VS_THREE_BET,
    FOUR_BET_VS_THREE_BET,
    CBET,
    DECLINE_TO_CBET,
    FOLD_VS_CBET,
    CALL_VS_CBET,
    RAISE_VS_CBET,
    DELAY_CBET,
    DECLINE_DELAY_CBET,
    DEFEND_VS_DELAY_CBET,
    FOLD_TO_DELAY_CBET,
    PROBE_TURN,
    DECLINE_PROBE_TURN,
    DEFEND_VS_TURN_PROBE,
    FOLD_VS_TURN_PROBE,
]

class HudDb {
    constructor(namespace) {
        this.data = {}
        /*
        Player name to stat_name to {
            value: number
            sample: number
        }
        */
        this.namespace = namespace;
        this.load(namespace)
    }

    load(namespace) {
        const data = localStorage.getItem(namespace + "data");
        if (data) {
            this.data = JSON.parse(data)
        }
    }

    flush() {
        const newData = JSON.stringify(this.data)
        localStorage.setItem(this.namespace + "data", newData)
    }

    get(player, statName) {
        const statData = this.data[player][statName]
        if (!statData) {
            this.data[player][statName] = {
                'value': 0,
                'sample': 0,
            }
        }
        return this.data[player][statName]
    }

    inc(player, statName) {
        if (!this.data[player][statName]['value']) {
            this.data[player][statName]['value'] = 0;
        }
        if (!this.data[player][statName]['sample']) {
            this.data[player][statName]['sample'] = 0;
        }
        this.data[player][statName]['value'] += 1;
        this.data[player][statName]['sample'] += 1;
        for (const sibling of STAT_TO_SIBLING_STATS[statName]) {
            this.data[player][sibling]['sample'] += 1;
        }
        this.flush()
    }

    playerList() {
        return Object.keys(this.data).sort()
    }

    newPlayer(playerName) {
        this.data[playerName] = {}
        this.flush()
    }

    removePlayer(playerName) {

    }

    initStats(playerName) {
        if (!this.data[playerName]) {
            this.data[playerName] = {}
        }
        for (const statName of ALL_STATS) {
            if (!this.data[playerName][statName]) {
                this.data[playerName][statName] = {
                    "sample": 0,
                    "value": 0,
                }
            }
        }

    }
}

let db;
function init() {
    STAT_TO_SIBLING_STATS[RFI] =  [OPEN_FOLD];
    STAT_TO_SIBLING_STATS[OPEN_FOLD] = [RFI];
    STAT_TO_SIBLING_STATS[CALL_VS_RFI] = [THREE_BET_VS_RFI, FOLD_VS_RFI];
    STAT_TO_SIBLING_STATS[THREE_BET_VS_RFI] = [CALL_VS_RFI, FOLD_VS_RFI];
    STAT_TO_SIBLING_STATS[FOLD_VS_RFI] = [THREE_BET_VS_RFI, CALL_VS_RFI];

    STAT_TO_SIBLING_STATS[CALL_VS_THREE_BET] = [FOLD_VS_THREE_BET, FOUR_BET_VS_THREE_BET];
    STAT_TO_SIBLING_STATS[FOLD_VS_THREE_BET] = [CALL_VS_THREE_BET, FOUR_BET_VS_THREE_BET];
    STAT_TO_SIBLING_STATS[FOUR_BET_VS_THREE_BET] = [FOLD_VS_THREE_BET, CALL_VS_THREE_BET];


    STAT_TO_SIBLING_STATS[CBET] = [DECLINE_TO_CBET];
    STAT_TO_SIBLING_STATS[DECLINE_TO_CBET] = [CBET];

    STAT_TO_SIBLING_STATS[CALL_VS_CBET] = [FOLD_VS_CBET, RAISE_VS_CBET];
    STAT_TO_SIBLING_STATS[FOLD_VS_CBET] = [CALL_VS_CBET, RAISE_VS_CBET];
    STAT_TO_SIBLING_STATS[RAISE_VS_CBET] = [FOLD_VS_CBET, CALL_VS_CBET];

    STAT_TO_SIBLING_STATS[PROBE_TURN] = [DECLINE_PROBE_TURN];
    STAT_TO_SIBLING_STATS[DECLINE_PROBE_TURN] = [PROBE_TURN];

    STAT_TO_SIBLING_STATS[DEFEND_VS_TURN_PROBE] = [FOLD_VS_TURN_PROBE];
    STAT_TO_SIBLING_STATS[FOLD_VS_TURN_PROBE] = [DEFEND_VS_TURN_PROBE];

    STAT_TO_SIBLING_STATS[DECLINE_DELAY_CBET] = [DELAY_CBET];
    STAT_TO_SIBLING_STATS[DELAY_CBET] = [DECLINE_DELAY_CBET];

    STAT_TO_SIBLING_STATS[FOLD_TO_DELAY_CBET] = [DEFEND_VS_DELAY_CBET];
    STAT_TO_SIBLING_STATS[DEFEND_VS_DELAY_CBET] = [FOLD_TO_DELAY_CBET];


    db = new HudDb('testing');
    loadPlayerList()
    db.initStats(selectedPlayer())
    loadHud(selectedPlayer())
}

function loadHud(player) {
    const hudElement = document.getElementById('hud')
    const table = document.createElement('table')
    const row_0 = [
        RFI, OPEN_FOLD, '', FOUR_BET_VS_THREE_BET, CALL_VS_THREE_BET, FOLD_VS_THREE_BET
    ]
    const row_1 = [
        THREE_BET_VS_RFI, CALL_VS_RFI, FOLD_VS_RFI
    ]
    const row_2 = [
        CBET, DECLINE_TO_CBET, '', RAISE_VS_CBET, CALL_VS_CBET, FOLD_VS_CBET
    ]
    const row_3 = [
        PROBE_TURN, DECLINE_PROBE_TURN, "", DEFEND_VS_TURN_PROBE, FOLD_VS_TURN_PROBE
    ]
    const row_4 = [
        DELAY_CBET, DECLINE_DELAY_CBET, "", DEFEND_VS_DELAY_CBET, FOLD_TO_DELAY_CBET
    ]

    const rows = [
        row_0,
        row_1,
        row_2,
        row_3,
        row_4,
    ]

    for (const rowConfig of rows) {
        const row = document.createElement('tr')
        for (const stat of rowConfig) {
            const rowItem = document.createElement('td')
            const statData = db.get(player, stat)
            rowItem.appendChild(elementForHudCell(
                stat,
                statData,
                ''
            ))
            row.appendChild(rowItem) 
        }
        table.appendChild(row)
    }
    hudElement.innerHTML = ""
    hudElement.appendChild(table)
}

function onclickCreateNewPlayer() {
    const newPlayerNameElement = document.getElementById('new-player-name')
    if (!newPlayerNameElement.value) {
        return
    }
    const newPlayerName = newPlayerNameElement.value;
    const playerList = db.playerList()
    if (playerList.includes(newPlayerName)) {
        console.log('Player already exists')
        return;
    }
    db.newPlayer(newPlayerName)
    newPlayerNameElement.innerHTML = '';
    newPlayerNameElement.value = '';
    loadPlayerList();
    document.getElementById('player-selector').value = newPlayerName;
}

function onUpdateSelectedPlayer() {
    db.initStats(selectedPlayer())
    loadHud(selectedPlayer())
}

function loadPlayerList() {
    const playerSelectorElement = document.getElementById('player-selector')
    playerSelectorElement.innerHTML = '';
    for (const player of db.playerList()) {
        const option = document.createElement('option')
        option.value = player;
        option.innerHTML = player;
        playerSelectorElement.appendChild(option)
    }
}

function selectedPlayer() {
    return document.getElementById('player-selector').value;
}

function elementForHudCell(statName, statData, color) {
    if (statName === '') {
        const buttonElement = document.createElement('button')
        buttonElement.className = "hud-element"
        return buttonElement
    }
    const buttonElement = document.createElement('button')
    let value =  100 * statData['value'] / statData['sample'];
    let sample = statData['sample'].toString()
    if (isNaN(value)) {
        value = '-'
        sample = '0'
    } else {
        value = value.toFixed(1).toString()
    }
    buttonElement.innerHTML = statName + '<br/><span class="button-element-value">' + value + '</span><br/> (' + sample + ')';
    buttonElement.onclick = function() {
        db.inc(selectedPlayer(), statName)
        loadHud(selectedPlayer())
    }
    buttonElement.className = "hud-element"
    return buttonElement;
}


init()