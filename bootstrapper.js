// Loads the game scripts all at once
(async function() {
    const scripts = [
        // "scsocket.js",
        "vars.js",
        "render.js",
        "sha256.js",
        "game.js",
        "handlers.js",
        "events.js",
        "settings.js",
        "leaderboard.js"
    ]
    let fullSource = "";
    for (let s in scripts) {
        await fetch(scripts[s]).then(function(response) {
          return response.text();
        }).then(function(text) {
          fullSource += text;
        });;
    }
    eval("(function() {" + fullSource + "})();");
})();