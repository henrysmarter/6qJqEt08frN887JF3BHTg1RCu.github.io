// Loads the game scripts all at once
(async function() {
  const scripts = [
      // "scsocket.js", // This is commented out, but you can add it back if needed.
      "vars.js",
      "render.js",
      "sha256.js",
      "game.js",
      "handlers.js",
      "events.js",
      "settings.js",
      "leaderboard.js"
  ];

  let fullSource = "";

  // Fetch and concatenate the content of each script
  for (let s of scripts) {
      try {
          const response = await fetch(s);
          if (!response.ok) {
              throw new Error(`Failed to load script: ${s}`);
          }
          const text = await response.text();
          fullSource += text + "\n"; // Append the content of each script
      } catch (error) {
          console.error("Error loading script:", error);
      }
  }

  // Evaluate the combined source
  try {
      eval("(function() {" + fullSource + "})();");
  } catch (error) {
      console.error("Error executing the scripts:", error);
  }
})();
