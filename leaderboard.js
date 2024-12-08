const tokeiUrl = "https://tokei.nightly.pw";
const playerContId = "lb-player-cont";
const lbContainer = document.getElementById(playerContId);

const disabledTimelyAreas = [
    "Nightmare 20"
];
const disabledCompletionLevels = [
    "Nightmare"
];

const lbPlayerLimit = 100;

const completionBasedButton = document.getElementById("completion-based-btn");
const timelyBasedButton = document.getElementById("time-based-btn");

const currentlyViewingP = document.getElementById("currently-viewing");

const buttonToCompletionLevel = new Map();
buttonToCompletionLevel.set("exodus-lb", "Exodus");
buttonToCompletionLevel.set("spaceadv-lb", "Space Advanced");
buttonToCompletionLevel.set("infernus-lb", "Infernus");
buttonToCompletionLevel.set("inferno-lb", "Inferno");
buttonToCompletionLevel.set("nightmare-lb", "Nightmare");

const buttonToTimelyArea = new Map();
buttonToTimelyArea.set("exodus50-lb", "Exodus 50 VICTORY");
buttonToTimelyArea.set("exodus100-lb", "Exodus 100 VICTORY");
buttonToTimelyArea.set("exodus150-lb", "Exodus 150 VICTORY");
buttonToTimelyArea.set("spaceadv20-lb", "Space Advanced 20 VICTORY");
buttonToTimelyArea.set("infernus25-lb", "Infernus 25");
buttonToTimelyArea.set("inferno25-lb", "Inferno 25");
buttonToTimelyArea.set("nightmare20-lb", "Nightmare 20");

const TYPE_COMPLETION = 0;
const TYPE_TIMELY = 1;

let currentLeaderboardType = TYPE_TIMELY;

function setCurrentType(type) {
    if (type != TYPE_COMPLETION && type != TYPE_TIMELY)
        return;

    if (type == TYPE_COMPLETION) {
        loadCompletionLeaderboards("Exodus");
        showButtons(buttonToCompletionLevel);
        hideButtons(buttonToTimelyArea);
        completionBasedButton.classList.add("green-highlighted-btn");
        timelyBasedButton.classList.remove("green-highlighted-btn");
    } else {
        loadTimelyLeaderboards("Exodus 100 VICTORY");
        showButtons(buttonToTimelyArea);
        hideButtons(buttonToCompletionLevel);
        timelyBasedButton.classList.add("green-highlighted-btn");
        completionBasedButton.classList.remove("green-highlighted-btn");
    }
}

function hideButtons(buttonToXMap) {
    for (let [button, _] of buttonToXMap) {
        document.getElementById(button).hidden = true;
    }
}

function showButtons(buttonToXMap) {
    for (let [button, _] of buttonToXMap) {
        document.getElementById(button).hidden = false;
    }
}

function setCurrentlyViewing(s) {
    currentlyViewingP.textContent = "Currently viewing " + s + `. (Top ${lbPlayerLimit})`;
}

function clearLbContainer() {
    lbContainer.textContent = '';
}

function addRowToLb(classes, ...text) {
    const tr = document.createElement('tr');
    const tds = text.map(t => {
        const td = document.createElement("td");
        td.textContent = t;
        return td;
    });
    tr.append(...tds);

    if (classes.length > 0)
        tr.classList.add(classes);
    lbContainer.appendChild(tr);
}

function loadCompletionLeaderboards(level) {
    setCurrentlyViewing(level);
    if (disabledCompletionLevels.includes(level)) {
        clearLbContainer();
        addRowToLb(["lb-maintenence"], "This leaderboard is currently disabled for maintenence.");
        return;
    }
    fetch(tokeiUrl + `/api/leaderboard/completion?area=${level}&limit=${lbPlayerLimit}`).catch((err) => {
        console.log(err);
        clearLbContainer();
        addRowToLb(["load-failed"], "Failed to load completion leaderboard.");
    }).then((resp) => {
        return resp.json();
    }).then((data) => {
        clearLbContainer();
        if (!data.placements)
            return;
        let playersAdded = 0;
        for (let player of data.placements) {
            let localDate = new Date(player.dateReached);
            // Localize the date from UTC
            localDate = new Date(localDate - localDate.getTimezoneOffset() * 60000);
            // This thing really likes to overflow (why is it so long)
            const timeString = localDate.toLocaleString();
            playersAdded++;
            addRowToLb(["normal-placement"], `#${playersAdded}`, player.playerName, player.areaReached, timeString);
        }
        if (playersAdded == 0) {
            addRowToLb(["empty-leaderboard"], "No one has played this level!");
        }
    });
}

function loadTimelyLeaderboards(area) {
    setCurrentlyViewing(area);
    if (disabledTimelyAreas.includes(area)) {
        clearLbContainer();
        addRowToLb(["lb-maintenence"], "This leaderboard is currently disabled for maintenence.");
        return;
    }
    fetch(tokeiUrl + `/api/leaderboard/timely?area=${area}&limit=${lbPlayerLimit}`).catch((err) => {
        console.log(err);
        clearLbContainer();
        addRowToLb(["load-failed"], "Failed to load timely leaderboard.");
    }).then((resp) => {
        return resp.json();
    }).then((data) => {
        clearLbContainer();
        if (!data.placements)
            return;
        let playersAdded = 0;
        for (let player of data.placements) {
            let localDate = new Date(player.dateReached);
            // Localize the date from UTC
            localDate = new Date(localDate - localDate.getTimezoneOffset() * 60000);
            const timeString = localDate.toLocaleString();
            playersAdded++;
            addRowToLb(["normal-placement"], `#${playersAdded}`, player.playerName, timeString, msToTime(player.timeReachedMs));
        }
        if (playersAdded == 0) {
            addRowToLb(["empty-leaderboard"], "No one has reached this area!");
        }
    });
}

function msToTime(s) {
    var pad = (n, z = 2) => ('00' + n).slice(-z);
    return pad(s/3.6e6|0) + ':' + pad((s%3.6e6)/6e4 | 0) + ':' + pad((s%6e4)/1000|0) + '.' + pad(s%1000, 3);
}

for (let [button, levelName] of buttonToCompletionLevel) {
    document.getElementById(button).addEventListener('click', () => {
        loadCompletionLeaderboards(levelName);
    });
}

for (let [button, levelName] of buttonToTimelyArea) {
    document.getElementById(button).addEventListener('click', () => {
        loadTimelyLeaderboards(levelName);
    });
}

completionBasedButton.addEventListener("click", () => {
    setCurrentType(TYPE_COMPLETION);
});
timelyBasedButton.addEventListener("click", () => {
    setCurrentType(TYPE_TIMELY);
});

setCurrentType(TYPE_TIMELY);