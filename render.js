/**
 * @typedef SkapObject
 * @property {string} id
 * @property {"obstacle" | "lava" | "slime" | "teleporter" | "text" | "door" | "button"} type
 * @property {"0" | "1" | "2" | "3"} dir
 * @property {Object} pos
 * @property {number} pos.x
 * @property {number} pos.y
 * @property {Object} lastPos
 * @property {number} lastPos.x
 * @property {number} lastPos.y
 * @property {Object} size
 * @property {number} size.x
 * @property {number} size.y
 * @property {Object} center
 * @property {number} center.x
 * @property {number} center.y
 * @property {string} text
 * @property {boolean} opened
 * @property {boolean} pressed
 * @property {boolean} switch
 * @property {0 | 1} layer
 * @property {[number, number, number]} color
 * @property {number} opacity
 * @property {number} angle
 * @property {number[]} linkIds
 * @property {number[]} linkIdsOn
 * @property {number[]} linkIdsOff
 * @property {SkapObject[]} linksOn
 * @property {SkapObject[]} linksOff
 * 
 * 
 * @typedef SkapEntity
 * @property {"bomb" | "bouncer" | "spike" | "normal" | "megaBouncer" | "taker" | "wavy" | "freezer" | "snek" | "immune" | "monster" | "stutter" | "contractor" | "expanding" | "turretBullet" | "enemyBullet" | "shield" | "healingGhost" | "meteorBullet" | "path"} type
 * bombs/bouncers/normal/spike
 * @property {number} radius
 * @property {number} opacity
 * @property {boolean} phase
 * @property {boolean} exploding FINALLY TYPO                      v 
 * @property {boolean} triggered why can't you merge these two .-. ^
 * @property {Object} pos
 * @property {number} pos.x
 * @property {number} pos.y
 * @property {Object} lastPos
 * @property {number} lastPos.x
 * @property {number} lastPos.y
 * rotating >:(
 * @property {number} angle
 * snek >:(
 * @property {number} dir
 * @property {{ x: number, y: number, radius: number, time: number }[]} states
 * 
 * 
 * @typedef Player
 * @property {Object} pos
 * @property {number} pos.x
 * @property {number} pos.y
 * @property {Object} lastPos
 * @property {number} lastPos.x
 * @property {number} lastPos.y
 * @property {Object} vel
 * @property {number} vel.x
 * @property {number} vel.y
 * @property {string[]} states
 * @property {number} fuel
 * @property {0 | 1 | 2 | 3} gravDir
 * @property {3 | 2.25} radius
 * @property {string} name
 * @property {[number, number, number]} color
 * @property {string} hat
 *
 * 
 * @typedef SkapMap
 * @property {Object} areaSize
 * @property {number} areaSize.x
 * @property {number} areaSize.y
 * @property {[number, number, number]} areaColor
 * @property {[number, number, number, number]} backgroundColor
 * @property {SkapObject[]} objects
 * 
 * @typedef {Object<string, SkapObject[]>} ParsedMap
 * 
 * @typedef State
 * @property {{id: string, fuel: number, oneCooldown: number | null, twoCooldown: number | null, oneHeat: number, twoHeat: number}} infos
 * @property {Object<string, Player>} players id:Player
 * @property {[string, string, boolean, boolean][]} playerList
 * @property {SkapEntity[]} entities
 * 
 * @typedef Hat
 * @property {[number, number]} offset
 * @property {[number, number]} size
 * @property {number} textOffset
 * @property {HTMLImageElement} texture
 * 
 * @typedef RenderOptions
 * @property {Object<string, boolean>} render
 * @property {Object<string, string>} colors
 * @property {Object} textures
 * @property {Object<string, HTMLImageElement | HTMLImageElement[]>} textures.enemies
 * @property {Object<string, Hat>} textures.hats
 * @property {HTMLImageElement[]} textures.powers
 * @property {Object<string, HTMLImageElement>} textures.skins
 * @property {HTMLImageElement} textures.trail
 * 
 * @typedef Particle
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * 
 * @param {ParsedMap} parsedMap
 * 
 * @param {SkapMap} map
 * 
 * @param {State} state
 * 
 * @param {Object<string, Particle[]>} particles
 * 
 * @param {RenderOptions} renderSettings
 * 
 * @param {number} camX
 * @param {number} camY
 */

var camDiffX = 0;
var camDiffY = 0;

function render() {
    updateStatGraphs();
    updateParticles();

    camDiffX = 0;
    camDiffY = 0;

    // Camera
    if (freeCam) {
        camX += camSpeed / camScale * (keysDown.has(othercontrols[6]) - keysDown.has(othercontrols[4]));
        camY += camSpeed / camScale * (keysDown.has(othercontrols[5]) - keysDown.has(othercontrols[3]));
    } else {
        if (state == null) {
            camX = 0;
            camY = 0;
            return;
        }

        let player = state.players[state.infos.id];
        if (!playerInterpolation) {
            camX = player.pos.x;
            camY = player.pos.y;
        } else {
            var intpPos = getInterpolatedPos(player.lastPos, player.pos);
            //camX = player.pos.x;
            //camY = player.pos.y;
            camX = intpPos.x;
            camY = intpPos.y;
            camDiffX = intpPos.x - player.pos.x;
            camDiffY = intpPos.y - player.pos.y;
        }
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineCap = "round";

    if (map.color.startsWith("hsl") || map.color === "rainbow") map.color = `hsl(${time}, 75%, 40%)`;
    if (useCustomTheme) {
        if (themeWall)
            map.color = themeWall;
        if (themeBg)
            map.background = themeBg;
    } else if (darkMode) {
        map.color = "rgb(15, 15, 15)";
        map.background = "rgb(9, 9, 9)";
    }

    ctx.fillStyle = map.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = map.background;
    ctx.fillRect(
        Math.round(canvas.width / 2 - camScale * camX),
        Math.round(canvas.height / 2 - camScale * camY),
        Math.round(map.areaSize.x * camScale),
        Math.round(map.areaSize.y * camScale)
    );

    if (!state) {
        state = {
            infos: {
                id: "TEMPORARY_ID",
                fuel: 12,
                oneCooldown: null,
                twoCooldown: null,
                oneHeat: 0,
                twoHeat: 0
            },
            players: {},
            playerList: ["Sorry, but the data has not yet loaded.", "", true],
            entities: []
        }
    }
    let mX = (mouse.x - canvas.width / 2) / camScale + camX;
    let mY = (mouse.y - canvas.height / 2) / camScale + camY;
    aimXSpan.innerHTML = mX.toFixed(3);
    aimYSpan.innerHTML = mY.toFixed(3);
    aim(mX, mY);

    if (renderSettings.render.obstacle) {
        renderObstacles();
    }
    // Render the teleporters
    if (renderSettings.render.teleporter) {
        renderTeleporters();
    }
    ctx.fillStyle = renderSettings.colors.lava;
    if (renderSettings.render.lava) {
        renderLava();
    }
    if (renderSettings.render.ice) {
        renderIce();
    }
    if (renderSettings.render.slime) {
        renderSlimes();
    }
    // Render buttons
    renderButtons();
    // Render switches?
    renderSwitches();
    // Renders
    renderDoors();

    // Render blocks(0)
    ctx.globalAlpha = 1;
    if (renderSettings.render.block0) {
        renderBlock0();
    }

    // ENTITIES
    renderEntities();

    renderParticles();

    // Render turrets
    renderTurrets();
    // Render players
    if (renderSettings.render.player) {
        renderPlayers();
    }
    // Render blocks(1)
    ctx.globalAlpha = 1;
    if (renderSettings.render.block1) {
        renderBlock1();
    }
    // Render images(1)
    renderImages();
    if (renderSettings.render.gravityZone) {
        renderGravityZones();
    }
    // Render boxes (wall power)
    renderBoxes();
    if (renderSettings.render.reward) {
        renderRewards();
    }
    // Render text
    ctx.font = camScale * 5 + "px Russo One, Verdana, Arial, Helvetica, sans-serif";
    ctx.strokeStyle = "#000000";
    ctx.setLineDash([]);
    if (renderSettings.render.text) {
        renderText();
    }
    // Render hitboxes
    ctx.setLineDash([]);
    if (renderSettings.render.hitbox) {
        renderHitboxes();
    }
}

function updateStatGraphs() {
    let now = Date.now();
    FPSctx.clearRect(0, 0, FPSCanvas.width, FPSCanvas.height);
    FPSctx.beginPath();
    FPSctx.moveTo(FPSCanvas.width + (FPSHistory[0].time - now) / 15, FPSCanvas.height - FPSHistory[0].fps * FPSCanvas.height / 120);
    for (let { time, fps } of FPSHistory) {
        FPSctx.lineTo(FPSCanvas.width + (time - now) / 15, FPSCanvas.height - fps * FPSCanvas.height / 120);
    }
    FPSctx.stroke();
    if (TPSHistory.length) {
        TPSctx.clearRect(0, 0, TPSCanvas.width, TPSCanvas.height);
        TPSctx.beginPath();
        TPSctx.moveTo(TPSCanvas.width + (TPSHistory[0].time - now) / 15, TPSCanvas.height - TPSHistory[0].tps * TPSCanvas.height / 120);
        for (let { time, tps } of TPSHistory) {
            TPSctx.lineTo(TPSCanvas.width + (time - now) / 15, TPSCanvas.height - tps * TPSCanvas.height / 120);
        }
        TPSctx.stroke();
    }
}

function updateParticles() {
    // Particles
    particles.dash = particles.dash.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.r += 0.1;
        return (p.o -= 0.1) > 0;
    });
    particles.shrink = particles.shrink.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        return (p.r -= 0.1) > 0.2;
    });
    particles.bomb = particles.bomb.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        return (p.o -= 0.1) > 0;
    });
    particles.explosion = particles.explosion.filter(p => {
        p.r += 5;
        return (p.o -= 0.05) > 0;
    });
    particles.ghost = particles.ghost.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.r -= 0.05;
        return (p.o -= 0.05) > 0;
    });
    particles.refuel = particles.refuel.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        return (p.o -= 0.05) > 0;
    });
    particles.jetpack = particles.jetpack.filter(p => {
        p.lx = p.x;
        p.ly = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.hue += 10;
        p.s *= 0.95;
        return (p.o -= 0.02) > 0;
    });
    particles.trail = particles.trail.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        return (p.o -= 0.02) > 0;
    });
}

function renderObstacles() {
    // Render obstacles
    ctx.fillStyle = renderSettings.colors.obstacle ?? map.color;
    for (let obj of map.obstacle) {
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render movObstacle
    for (let obj of map.movingObstacle) {
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render cirObstacle
    for (let obj of map.circularObstacle) {
        ctx.beginPath();
        ctx.ellipse(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x + obj.radius - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y + obj.radius - camY)),
            Math.round(camScale * obj.radius),
            Math.round(camScale * obj.radius),
            0, 0, 7
        );
        ctx.fill();
    }
}

function renderTeleporters() {
    for (let obj of map.teleporter) {
        let gradient;
        switch (obj.dir) {
            case "0":
                gradient = ctx.createLinearGradient(
                    0, Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
                    0, Math.round(canvas.height / 2 + camScale * (obj.pos.y + obj.size.y - camY))
                );
                break;
            case "1":
                gradient = ctx.createLinearGradient(
                    Math.round(canvas.width / 2 + camScale * (obj.pos.x + obj.size.x - camX)), 0,
                    Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)), 0
                );
                break;
            case "2":
                gradient = ctx.createLinearGradient(
                    0, Math.round(canvas.height / 2 + camScale * (obj.pos.y + obj.size.y - camY)),
                    0, Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY))
                );
                break;
            case "3":
                gradient = ctx.createLinearGradient(
                    Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)), 0,
                    Math.round(canvas.width / 2 + camScale * (obj.pos.x + obj.size.x - camX)), 0
                );
                break;
        }
        if (gradient) {
            gradient.addColorStop(0, map.background);
            gradient.addColorStop(1, renderSettings.colors.obstacle ?? map.color);
        } else gradient = map.background;
        ctx.fillStyle = gradient;
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
}

function renderLava() {
    // Render lava
    for (let obj of map.lava) {
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render rotLava
    ctx.globalAlpha = 1;
    for (let obj of map.rotatingLava) {
        ctx.save();
        ctx.translate(
            Math.round(canvas.width / 2 + camScale * (obj.center.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.center.y - camY))
        );
        ctx.rotate(obj.angle);
        ctx.fillRect(-camScale * obj.size.x / 2, -camScale * obj.size.y / 2, camScale * obj.size.x, camScale * obj.size.y);
        ctx.restore();
    }
    // Render movLava
    for (let obj of map.movingLava) {
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render cirLava
    for (let obj of map.circularLava) {
        ctx.beginPath();
        ctx.ellipse(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x + obj.radius - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y + obj.radius - camY)),
            Math.round(camScale * obj.radius),
            Math.round(camScale * obj.radius),
            0, 0, 7
        );
        ctx.fill();
    }
}

function renderIce() {
    // Render ice
    ctx.fillStyle = renderSettings.colors.ice;
    for (let obj of map.ice) {
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render movIce
    for (let obj of map.movingIce) {
        ctx.beginPath();
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render cirIce
    for (let obj of map.circularIce) {
        ctx.beginPath();
        ctx.ellipse(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x + obj.radius - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y + obj.radius - camY)),
            Math.round(camScale * obj.radius),
            Math.round(camScale * obj.radius),
            0, 0, 7
        );
        ctx.fill();
    }
}

function renderSlimes() {
    // Render slime
    ctx.fillStyle = renderSettings.colors.slime;
    for (let obj of map.slime) {
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render movSlime
    for (let obj of map.movingSlime) {
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render cirSlime
    for (let obj of map.circularSlime) {
        ctx.beginPath();
        ctx.ellipse(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x + obj.radius - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y + obj.radius - camY)),
            Math.round(camScale * obj.radius),
            Math.round(camScale * obj.radius),
            0, 0, 7
        );
        ctx.fill();
    }
}

function renderButtons() {
    ctx.setLineDash([]);
    for (let obj of map.button) {
        ctx.beginPath();
        ctx.moveTo(
            Math.round(canvas.width / 2 + camScale * (obj.points[0][0] - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.points[0][1] - camY))
        );
        ctx.lineTo(
            Math.round(canvas.width / 2 + camScale * (obj.points[1][0] - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.points[1][1] - camY))
        );
        ctx.lineTo(
            Math.round(canvas.width / 2 + camScale * (obj.points[2][0] - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.points[2][1] - camY))
        );
        ctx.lineTo(
            Math.round(canvas.width / 2 + camScale * (obj.points[3][0] - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.points[3][1] - camY))
        );
        ctx.fillStyle = obj.pressed ? renderSettings.colors.buttonPressed : renderSettings.colors.button;
        ctx.fill();
    }
}

function renderSwitches() {
    for (let obj of map.switch) {
        ctx.beginPath();
        ctx.moveTo(
            Math.round(canvas.width / 2 + camScale * (obj.points[0][0] - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.points[0][1] - camY))
        );
        ctx.lineTo(
            Math.round(canvas.width / 2 + camScale * (obj.points[1][0] - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.points[1][1] - camY))
        );
        ctx.lineTo(
            Math.round(canvas.width / 2 + camScale * (obj.points[2][0] - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.points[2][1] - camY))
        );
        ctx.lineTo(
            Math.round(canvas.width / 2 + camScale * (obj.points[3][0] - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.points[3][1] - camY))
        );
        ctx.fillStyle = obj.switch ? renderSettings.colors.buttonPressed : renderSettings.colors.button;
        ctx.fill();
    }
}

function renderDoors() {
    ctx.fillStyle = renderSettings.colors.doorFill;
    ctx.lineWidth = camScale;
    for (let obj of map.door) {
        ctx.strokeStyle = obj.opened ? renderSettings.colors.doorOpenedOutline : renderSettings.colors.doorClosedOutline;
        ctx.strokeRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x + 0.5 - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y + 0.5 - camY)),
            Math.round(camScale * (obj.size.x - 1)),
            Math.round(camScale * (obj.size.y - 1))
        );
        if (!obj.opened) ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
        for (let b of obj.linksOn) {
            ctx.beginPath();
            ctx.strokeStyle = b.pressed || b.switch ? renderSettings.colors.doorLineOn : renderSettings.colors.doorLineOff;
            ctx.moveTo(canvas.width / 2 + camScale * (obj.pos.x + obj.size.x / 2 - camX), canvas.height / 2 + camScale * (obj.pos.y + obj.size.y / 2 - camY));
            ctx.lineTo(canvas.width / 2 + camScale * (b.pos.x + b.size.x / 2 - camX), canvas.height / 2 + camScale * (b.pos.y + b.size.y / 2 - camY));
            ctx.stroke();
        }
        for (let b of obj.linksOff) {
            ctx.beginPath();
            ctx.strokeStyle = b.pressed || b.switch ? renderSettings.colors.doorLineOff : renderSettings.colors.doorLineOn;
            ctx.moveTo(canvas.width / 2 + camScale * (obj.pos.x + obj.size.x / 2 - camX), canvas.height / 2 + camScale * (obj.pos.y + obj.size.y / 2 - camY));
            ctx.lineTo(canvas.width / 2 + camScale * (b.pos.x + b.size.x / 2 - camX), canvas.height / 2 + camScale * (b.pos.y + b.size.y / 2 - camY));
            ctx.stroke();
        }
    }
}

function renderBlock0() {
    for (let obj of map.block0) {
        ctx.fillStyle = obj.color;
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
}

function renderEntities() {
    for (let obj of state.entities) {
        switch (obj.type) {
            case "bomb":
                ctx.globalAlpha = obj.opacity || 1;
                ctx.beginPath();
                ctx.ellipse(
                    canvas.width / 2 + camScale * (obj.pos.x - camX),
                    canvas.height / 2 + camScale * (obj.pos.y - camY),
                    camScale * (obj.region + obj.radius),
                    camScale * (obj.region + obj.radius),
                    0, 0, 7
                );
                ctx.fillStyle = obj.exploding ? renderSettings.colors.mineExpRegion : renderSettings.colors.mineRegion;
                ctx.fill();
                ctx.drawImage(
                    renderSettings.textures.enemies.bomb[obj.phase & 1],
                    canvas.width / 2 + camScale * (obj.pos.x - obj.radius - camX),
                    canvas.height / 2 + camScale * (obj.pos.y - obj.radius - camY),
                    camScale * obj.radius * 2,
                    camScale * obj.radius * 2
                );
                break;
            case "following":
                ctx.globalAlpha = obj.opacity || 1;
                ctx.beginPath();
                ctx.ellipse(
                    canvas.width / 2 + camScale * (obj.pos.x - camX),
                    canvas.height / 2 + camScale * (obj.pos.y - camY),
                    camScale * (obj.region + obj.radius),
                    camScale * (obj.region + obj.radius),
                    0, 0, 7
                );
                ctx.fillStyle = renderSettings.colors.followingRegion;
                ctx.fill();
                ctx.drawImage(
                    renderSettings.textures.enemies.following,
                    canvas.width / 2 + camScale * (obj.pos.x - obj.radius - camX),
                    canvas.height / 2 + camScale * (obj.pos.y - obj.radius - camY),
                    camScale * obj.radius * 2,
                    camScale * obj.radius * 2
                );
                break;
            case "contractor":
                ctx.globalAlpha = obj.opacity || 1;
                ctx.beginPath();
                ctx.ellipse(
                    canvas.width / 2 + camScale * (obj.pos.x - camX),
                    canvas.height / 2 + camScale * (obj.pos.y - camY),
                    camScale * (obj.region + obj.radius),
                    camScale * (obj.region + obj.radius),
                    0, 0, 7
                );
                ctx.fillStyle = obj.triggered ? renderSettings.colors.contracTriggerRegion : renderSettings.colors.contracRegion;
                ctx.fill();
                ctx.drawImage(
                    renderSettings.textures.enemies.contractor[obj.triggered & 1],
                    canvas.width / 2 + camScale * (obj.pos.x - obj.radius - camX),
                    canvas.height / 2 + camScale * (obj.pos.y - obj.radius - camY),
                    camScale * obj.radius * 2,
                    camScale * obj.radius * 2
                );
                break;
            case "bouncer":
            case "normal":
            case "reverse":
            case "spike":
            case "megaBouncer":
            case "freezer":
            case "taker":
            case "immune":
            case "monster":
            case "stutter":
            case "expanding":
            case "wavy":
            case "shooter":
            case "expander":
            case "gravityUp":
            case "gravityDown":
            case "gravityLeft":
            case "gravityRight":
            case "harmless":
            case "accelerator":
            case "decelerator":
            case "disabler":
                ctx.globalAlpha = obj.opacity || 1;
                ctx.drawImage(renderSettings.textures.enemies[obj.type], canvas.width / 2 + camScale * (obj.pos.x - obj.radius - camX), canvas.height / 2 + camScale * (obj.pos.y - obj.radius - camY), camScale * obj.radius * 2, camScale * obj.radius * 2);
                break;
            case "rotating":
                ctx.save();
                ctx.translate(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY));
                ctx.rotate(obj.angle);
                ctx.globalAlpha = obj.opacity || 1;
                ctx.drawImage(renderSettings.textures.enemies.rotating, -camScale * obj.radius, -camScale * obj.radius, camScale * obj.radius * 2, camScale * obj.radius * 2);
                ctx.restore();
                break;
            case "turretBullet":
            case "enemyBullet":
                ctx.globalAlpha = 1;
                ctx.fillStyle = renderSettings.colors.lava;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY), camScale * obj.radius, camScale * obj.radius, 0, 0, 7);
                ctx.fill();
                break;
            case "meteorBullet":
                ctx.globalAlpha = 1;
                ctx.fillStyle = renderSettings.colors.meteor;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY), camScale * obj.radius, camScale * obj.radius, 0, 0, 7);
                ctx.fill();
                break;
            case "path":
                ctx.fillStyle = renderSettings.colors.blueFire;
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY), camScale * obj.radius, camScale * obj.radius, 0, 0, 7);
                ctx.fill();
                ctx.closePath();
                break;
            case "tail":
                ctx.fillStyle = renderSettings.colors.tail;
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY), camScale * obj.radius, camScale * obj.radius, 0, 0, 7);
                ctx.fill();
                ctx.closePath();
                break;
            case "shield":
                ctx.lineWidth = camScale * obj.size.y * 2;
                ctx.strokeStyle = renderSettings.colors.shield;
                ctx.globalAlpha = 1;
                ctx.save();
                ctx.translate(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY));
                ctx.rotate(obj.dir);
                ctx.beginPath();
                ctx.moveTo(-camScale * obj.size.x, 0);
                ctx.lineTo(camScale * obj.size.x, 0);
                ctx.stroke();
                ctx.restore();
                break;
            case "healingGhost":
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY), camScale * obj.radius, camScale * obj.radius, 0, 0, 7);
                ctx.fillStyle = renderSettings.colors.ghost;
                ctx.fill();
                break;
            case "frostEntity":
                ctx.globalAlpha = obj.opacity || 1;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY), camScale * obj.radius, camScale * obj.radius, 0, 0, 7);
                ctx.fillStyle = renderSettings.colors.frost;
                ctx.fill();
                break;
            case "snek":
                ctx.save();
                ctx.globalAlpha = 1;
                for (let i = obj.states.length - 1, o = obj.states[i]; i >= 0; i--, o = obj.states[i]) {
                    ctx.drawImage(renderSettings.textures.enemies.snekBody, canvas.width / 2 + camScale * (o.x - obj.radius - camX), canvas.height / 2 + camScale * (o.y - obj.radius - camY), camScale * obj.radius * 2, camScale * obj.radius * 2);
                }
                ctx.globalAlpha = obj.opacity || 1;
                ctx.translate(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY));
                ctx.rotate(obj.dir);
                ctx.drawImage(renderSettings.textures.enemies.snekHead, -camScale * obj.radius, -camScale * obj.radius, camScale * obj.radius * 3, camScale * obj.radius * 2);
                ctx.restore();
                break;
            case "restZone":
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.ellipse(canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY), camScale * obj.radius, camScale * obj.radius, 0, 0, 7);
                ctx.fillStyle = renderSettings.colors.refuel;
                ctx.fill();
                break;
            case "drainer":
                ctx.globalAlpha = obj.opacity || 1;
                ctx.beginPath();
                ctx.ellipse(
                    canvas.width / 2 + camScale * (obj.pos.x - camX),
                    canvas.height / 2 + camScale * (obj.pos.y - camY),
                    camScale * (obj.region + obj.radius),
                    camScale * (obj.region + obj.radius),
                    0, 0, 7
                );
                ctx.fillStyle = obj.draining ? renderSettings.colors.drainerDrainingRegion : renderSettings.colors.drainerRegion;
                ctx.fill();
                ctx.drawImage(
                    renderSettings.textures.enemies.drainer,
                    canvas.width / 2 + camScale * (obj.pos.x - obj.radius - camX),
                    canvas.height / 2 + camScale * (obj.pos.y - obj.radius - camY),
                    camScale * obj.radius * 2,
                    camScale * obj.radius * 2
                );
                break;
            default:
                ctx.globalAlpha = obj.opacity || 1;
                ctx.drawImage(renderSettings.textures.enemies.none, canvas.width / 2 + camScale * (obj.pos.x - obj.radius - camX), canvas.height / 2 + camScale * (obj.pos.y - obj.radius - camY), camScale * obj.radius * 2, camScale * obj.radius * 2);
                break;
        }
    }
}

function renderParticles() {
    // Particles
    ctx.fillStyle = renderSettings.colors.dash;
    for (let p of particles.dash) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2 + camScale * (p.x - camX), canvas.height / 2 + camScale * (p.y - camY), camScale * p.r, camScale * p.r, 0, 0, 7);
        ctx.globalAlpha = p.o;
        ctx.fill();
    }
    ctx.fillStyle = renderSettings.colors.shrink;
    ctx.globalAlpha = 1;
    for (let p of particles.shrink) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2 + camScale * (p.x - camX), canvas.height / 2 + camScale * (p.y - camY), camScale * p.r, camScale * p.r, 0, 0, 7);
        ctx.fill();
    }
    ctx.fillStyle = renderSettings.colors.bombParticle;
    for (let p of particles.bomb) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2 + camScale * (p.x - camX), canvas.height / 2 + camScale * (p.y - camY), camScale * 2, camScale * 2, 0, 0, 7);
        ctx.globalAlpha = p.o;
        ctx.fill();
    }
    ctx.fillStyle = renderSettings.colors.explosion;
    for (let p of particles.explosion) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2 + camScale * (p.x - camX), canvas.height / 2 + camScale * (p.y - camY), camScale * p.r, camScale * p.r, 0, 0, 7);
        ctx.globalAlpha = p.o;
        ctx.fill();
    }
    ctx.fillStyle = renderSettings.colors.ghostParticles;
    for (let p of particles.ghost) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2 + camScale * (p.x - camX), canvas.height / 2 + camScale * (p.y - camY), camScale * p.r, camScale * p.r, 0, 0, 7);
        ctx.globalAlpha = p.o;
        ctx.fill();
    }
    ctx.fillStyle = renderSettings.colors.refuel;
    for (let p of particles.refuel) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2 + camScale * (p.x - camX), canvas.height / 2 + camScale * (p.y - camY), camScale, camScale, 0, 0, 7);
        ctx.globalAlpha = p.o;
        ctx.fill();
    }
    //console.log(Object.entries(offset));
    let player = state.players[state.infos.id];
    for (let p of particles.jetpack) {
        ctx.fillStyle = `hsl(${p.hue},${p.s}%,50%)`;
        ctx.globalAlpha = p.o;
        let pos = { x: p.x - p.w / 2 - camX - (player.pos.x - player.lastPos.x), y: p.y - p.h / 2 - camY - (player.pos.y - player.lastPos.y) };
        ctx.fillRect(canvas.width / 2 + camScale * pos.x, canvas.height / 2 + camScale * pos.y, p.w * camScale, p.h * camScale);
    }
    for (let p of particles.trail) {
        ctx.globalAlpha = p.o;
        ctx.drawImage(renderSettings.textures.trail, canvas.width / 2 + camScale * (p.x - 2.5 - camX), canvas.height / 2 + camScale * (p.y - 2.5 - camY), 5 * camScale, 5 * camScale);
    }
}

function renderTurrets() {
    // Render turrets
    ctx.globalAlpha = 1;
    for (let obj of map.turret) {
        ctx.save();
        ctx.translate(canvas.width / 2 + camScale * (obj.pos.x + obj.size.x / 2 - camX), canvas.height / 2 + camScale * (obj.pos.y + obj.size.y / 2 - camY));
        ctx.rotate(obj.dir);
        ctx.fillStyle = renderSettings.colors.turretCannon;
        ctx.fillRect(0, -camScale * 2, camScale * 5, camScale * 4);
        ctx.fillStyle = renderSettings.colors.turretBody;
        ctx.beginPath();
        ctx.ellipse(0, 0, camScale * obj.size.x / 2, camScale * obj.size.y / 2, 0, 0, 7);
        ctx.fill();
        ctx.restore();
    }
}

//o lastPos, n newPos 
function getInterpolatedPos(o, n) {
    //Player interpolation
    const tickTime = 1000 / 30;//1000ms over 30 ticks a second
    var pos = { ...n };//Copy the player pos, dont use ref
    var progress = (Date.now() - lastUpdate) / tickTime;
    if (progress > 1)
        progress = 1;
    if (o != n) {
        pos.x = o.x + (n.x - o.x) * progress;
        pos.y = o.y + (n.y - o.y) * progress;
        //console.log("old position: " + Object.entries(p.lastPos) + ", new position: " + Object.entries(p.pos) + ", interpolated pos: " + Object.entries(pos) + ", progress: " + progress);
    }
    return pos;
}

function renderPlayers() {
    for (let i in state.players) {
        let p = state.players[i];
        let died = p.states.includes("Died");
        let freeze = p.states.includes("Freeze");
        // Initiate hat
        let hat = renderSettings.textures.hats.none;
        if (RENDER_HAT) p.hat = RENDER_HAT;
        if (renderSettings.textures.hats.hasOwnProperty(p.hat)) {
            hat = renderSettings.textures.hats[p.hat];
        }
        // Skin?
        let skin = "";//p.name;
        if (RENDER_SKIN) skin = RENDER_SKIN;
        const isWolfie = false;//(skin === "wolfie" || skin === "wolfer" || skin === "wolfy");

        //Player interpolation
        /*const tickTime = 1000/30;//1000ms over 30 ticks a second
        var pos = {...p.pos};//Copy the player pos, dont use ref
        var progress = (Date.now() - lastUpdate) / tickTime;
        if (p.pos != p.lastPos) {
            pos.x = p.lastPos.x + (p.pos.x - p.lastPos.x) * progress;
            pos.y = p.lastPos.y + (p.pos.y - p.lastPos.y) * progress;
            console.log("old position: " + Object.entries(p.lastPos) + ", new position: " + Object.entries(p.pos) + ", interpolated pos: " + Object.entries(pos) + ", progress: " + progress);
        }*/
        var pos;
        if (playerInterpolation)
            pos = getInterpolatedPos(p.lastPos, p.pos);
        else
            pos = p.pos;

        ctx.save();
        //ctx.translate(canvas.width / 2 + camScale * (p.pos.x - camX), canvas.height / 2 + camScale * (p.pos.y - camY));
        ctx.translate(canvas.width / 2 + camScale * (pos.x - camX), canvas.height / 2 + camScale * (pos.y - camY));
        ctx.rotate(p.gravDir / 2 * Math.PI);
        ctx.beginPath();
        // Body
        if (renderSettings.textures.skins.hasOwnProperty(skin) && !died && !freeze) {
            ctx.drawImage(renderSettings.textures.skins[skin], -p.radius * camScale, -p.radius * camScale, 2 * p.radius * camScale, 2 * p.radius * camScale);
        }
        if (isWolfie) {
            ctx.ellipse(p.radius * -0.105 * camScale, p.radius * 0.4 * camScale, p.radius * 0.557 * camScale, p.radius * 0.55 * camScale, 0, 0, 7);
        } else {
            ctx.ellipse(0, 0, p.radius * camScale, p.radius * camScale, 0, 0, 7);
        }
        ctx.fillStyle = died
            ? freeze
                ? renderSettings.colors.playerFreezeDead
                : renderSettings.colors.playerDead
            : freeze
                ? renderSettings.colors.playerFreeze
                : renderSettings.textures.skins.hasOwnProperty(skin)
                    ? "transparent"
                    : fromColArr(p.color)
        ctx.fill();

        // Hat
        if (renderSettings.render.playerHat && hat && hat.texture.complete) {
            ctx.drawImage(
                hat.texture,
                camScale * hat.offset[0] * (isWolfie ? p.radius * 0.55 : p.radius),
                camScale * hat.offset[1] * (isWolfie ? p.radius * 0.55 : p.radius),
                camScale * hat.size[0] * (isWolfie ? p.radius * 0.5 : p.radius),
                camScale * hat.size[1] * (isWolfie ? p.radius * 0.5 : p.radius)
            );
        }
        // Name
        if (renderSettings.render.playerName) {
            ctx.globalCompositeOperation = "difference";
            ctx.font = camScale * 2 + "px Rubik, Arial, Helvetica, sans-serif";
            ctx.fillStyle = died
                ? freeze
                    ? renderSettings.colors.playerFreezeDeadText
                    : renderSettings.colors.playerDeadText
                : freeze
                    ? renderSettings.colors.playerFreezeText
                    : "#ffffff";
           /*  if (p.name in SkapClientPlayers) {
                const width = ctx.measureText(p.name).width;
                ctx.fillText(p.name, camScale * (renderSettings.textures.iconSize.x / 2 + 0.1), camScale * hat.textOffset * (isWolfie ? p.radius / 2 : p.radius));
                ctx.globalCompositeOperation = "source-over";
                ctx.drawImage(renderSettings.textures.skapclient, -(width + camScale * (renderSettings.textures.iconSize.x + 0.1)) / 2, camScale * hat.textOffset * (isWolfie ? p.radius / 2 : p.radius) - camScale * (renderSettings.textures.iconSize.y + 0.2) / 2, camScale * renderSettings.textures.iconSize.x, camScale * renderSettings.textures.iconSize.y);
            } else  */{
                ctx.fillText(p.name, 0, camScale * hat.textOffset * (isWolfie ? p.radius / 2 : p.radius));
                ctx.globalCompositeOperation = "source-over";
            }
        }

        // fuelBar™️
        /* if (renderSettings.render.playerFuel && p.name in SkapClientPlayers) {
            ctx.fillStyle = died
                ? freeze
                    ? renderSettings.colors.playerFreezeDead
                    : renderSettings.colors.playerDead
                : freeze
                    ? renderSettings.colors.playerFreeze
                    : renderSettings.colors.fuel;
            ctx.fillRect(-camScale * 5, camScale * (p.radius + 1), camScale * SkapClientPlayers[p.name].fuel, camScale * 2.5);
            ctx.strokeStyle = "#202020";
            ctx.lineWidth = camScale / 2;
            ctx.strokeRect(-camScale * 5, camScale * (p.radius + 1), camScale * 10, camScale * 2.5);
        } */

        // Messages
        if (!showChat) {
            ctx.font = camScale * 4 + "px Tahoma, Verdana, Segoe, sans-serif";
            if (chatMsgs.hasOwnProperty(p.name)) {
                let msg = chatMsgs[p.name];
                if (msg.t--) {
                    let metrics = ctx.measureText(msg.m);
                    ctx.fillStyle = "#ffffff80";
                    ctx.fillRect(
                        -metrics.actualBoundingBoxLeft - camScale,
                        -metrics.fontBoundingBoxAscent - camScale / 2 + camScale * hat.textOffset * (p.radius + 3),
                        metrics.width + 2 * camScale,
                        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent + camScale
                    );
                    ctx.fillStyle = "#000000";
                    ctx.fillText(msg.m, 0, camScale * hat.textOffset * (p.radius + 3));
                } else {
                    delete chatMsgs[p.name];
                }
            }
        }

        // Powers
        /* if (renderSettings.render.playerPowers && p.name in SkapClientPlayers) {
            ctx.fillStyle = renderSettings.colors.powerBG;
            ctx.strokeStyle = renderSettings.colors.powerStroke;

            ctx.fillRect(
                -6 * camScale,
                (p.radius + 4) * camScale,
                5 * camScale,
                5 * camScale
            );
            ctx.fillRect(
                camScale,
                (p.radius + 4) * camScale,
                5 * camScale,
                5 * camScale
            );

            ctx.fillStyle = renderSettings.colors.cooldown;

            if (SkapClientPlayers[p.name].powers[0].cooldown) ctx.fillRect(
                -6 * camScale,
                (p.radius + 9 - 5 * SkapClientPlayers[p.name].powers[0].cooldown) * camScale,
                5 * camScale,
                5 * SkapClientPlayers[p.name].powers[0].cooldown * camScale
            );
            if (SkapClientPlayers[p.name].powers[1].cooldown) ctx.fillRect(
                camScale,
                (p.radius + 9 - 5 * SkapClientPlayers[p.name].powers[1].cooldown) * camScale,
                5 * camScale,
                5 * SkapClientPlayers[p.name].powers[1].cooldown * camScale
            );

            ctx.fillStyle = renderSettings.colors.heat;

            if (SkapClientPlayers[p.name].powers[0].heat) ctx.fillRect(
                -6 * camScale,
                (p.radius + 9 - 5 * SkapClientPlayers[p.name].powers[0].heat) * camScale,
                5 * camScale,
                5 * SkapClientPlayers[p.name].powers[0].heat * camScale
            );
            if (SkapClientPlayers[p.name].powers[1].heat) ctx.fillRect(
                camScale,
                (p.radius + 9 - 5 * SkapClientPlayers[p.name].powers[1].heat) * camScale,
                5 * camScale,
                5 * SkapClientPlayers[p.name].powers[1].heat * camScale
            );

            if (SkapClientPlayers[p.name].powers[0].power !== null) ctx.drawImage(
                renderSettings.textures.powers[SkapClientPlayers[p.name].powers[0].power] || renderSettings.textures.powers[11],
                -6 * camScale,
                (p.radius + 4) * camScale,
                5 * camScale,
                5 * camScale
            );
            if (SkapClientPlayers[p.name].powers[1].power !== null) ctx.drawImage(
                renderSettings.textures.powers[SkapClientPlayers[p.name].powers[1].power] || renderSettings.textures.powers[11],
                camScale,
                (p.radius + 4) * camScale,
                5 * camScale,
                5 * camScale
            );
        } */
        ctx.restore();
    }
}

function renderBlock1() {
    for (let obj of map.block1) {
        ctx.fillStyle = obj.color;
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
}

function renderImages() {
    for (let i in map.image1) {
        let obj = map.image1[i];
        try {
            ctx.drawImage(
                obj.image,
                Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
                Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
                Math.round(camScale * obj.size.x),
                Math.round(camScale * obj.size.y)
            );
        } catch (err) {
            console.error(map.image1.splice(i, 1)[0], err);
        }
    }
}

function renderGravityZones() {
    // Render grav zones
    ctx.setLineDash([Math.round(2 * camScale), Math.round(6 * camScale)]);
    ctx.lineDashOffset = Math.round((time += 0.5) * camScale);
    ctx.lineWidth = Math.round(camScale);
    ctx.lineCap = "round";
    for (let obj of map.gravityZone) {
        let isNormal = (obj.dir === "0") || (obj.dir === "1") || (obj.dir === "2") || (obj.dir === "3");
        ctx.strokeStyle = renderSettings.colors.gravOutline[isNormal ? obj.dir : 4];
        ctx.fillStyle = renderSettings.colors.gravFill[isNormal ? obj.dir : 4];
        ctx.strokeRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
}

function renderBoxes() {
    for (let obj of map.box) {
        ctx.fillStyle = renderSettings.colors.box;
        ctx.fillRect(
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
}

function renderRewards() {
    // Render rewards
    for (let obj of map.reward) {
        ctx.fillStyle = renderSettings.colors.box;
        ctx.drawImage(
            obj.image,
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y + Math.sin(time / 15) * 3 - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
    // Render hat rewards
    for (let obj of map.hatReward) {
        ctx.fillStyle = renderSettings.colors.box;
        ctx.drawImage(
            obj.image,
            Math.round(canvas.width / 2 + camScale * (obj.pos.x - camX)),
            Math.round(canvas.height / 2 + camScale * (obj.pos.y + Math.sin(time / 15) * 3 - camY)),
            Math.round(camScale * obj.size.x),
            Math.round(camScale * obj.size.y)
        );
    }
}

function renderText() {
    for (let obj of map.text) {
        ctx.strokeText(obj.text, canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY));
        ctx.fillStyle = "#ffffff";
        ctx.fillText(obj.text, canvas.width / 2 + camScale * (obj.pos.x - camX), canvas.height / 2 + camScale * (obj.pos.y - camY));
        ctx.fillStyle = "#000000";
    }
}

function renderHitboxes() {
    ctx.lineWidth = 2.5;

    ctx.strokeStyle = "#ffff00";
    for (let o of map.obstacle) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.circularObstacle) {
        ctx.beginPath();
        ctx.ellipse(Math.round(canvas.width / 2 + camScale * (o.pos.x + o.size.x / 2 - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y + o.size.y / 2 - camY)), Math.round(camScale * o.size.x / 2), Math.round(camScale * o.size.y / 2), 0, 0, 7);
        ctx.stroke();
    }
    for (let o of map.movingObstacle) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.block0) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.block1) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.door) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.button) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.switch) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.turret) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.box) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.reward) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.hatReward) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));

    for (let o of map.text) {
        ctx.beginPath();
        ctx.ellipse(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y), 0, 0, 7);
        ctx.stroke();
    }

    for (let o of map.gravityZone) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));

    ctx.strokeStyle = "#00ff00";
    for (let o of map.slime) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.circularSlime) {
        ctx.beginPath();
        ctx.ellipse(Math.round(canvas.width / 2 + camScale * (o.pos.x + o.size.x / 2 - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y + o.size.y / 2 - camY)), Math.round(camScale * o.size.x / 2), Math.round(camScale * o.size.y / 2), 0, 0, 7);
        ctx.stroke();
    }
    for (let o of map.movingSlime) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));

    ctx.strokeStyle = "#00ffff";
    for (let o of map.ice) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.circularIce) {
        ctx.beginPath();
        ctx.ellipse(Math.round(canvas.width / 2 + camScale * (o.pos.x + o.size.x / 2 - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y + o.size.y / 2 - camY)), Math.round(camScale * o.size.x / 2), Math.round(camScale * o.size.y / 2), 0, 0, 7);
        ctx.stroke();
    }
    for (let o of map.movingIce) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));

    ctx.strokeStyle = "#ff0000";
    for (let o of map.lava) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.circularLava) {
        ctx.beginPath();
        ctx.ellipse(Math.round(canvas.width / 2 + camScale * (o.pos.x + o.size.x / 2 - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y + o.size.y / 2 - camY)), Math.round(camScale * o.size.x / 2), Math.round(camScale * o.size.y / 2), 0, 0, 7);
        ctx.stroke();
    }
    for (let o of map.rotatingLava) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));
    for (let o of map.movingLava) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));

    ctx.strokeStyle = "#0000ff";
    for (let o of map.teleporter) ctx.strokeRect(Math.round(canvas.width / 2 + camScale * (o.pos.x - camX)), Math.round(canvas.height / 2 + camScale * (o.pos.y - camY)), Math.round(camScale * o.size.x), Math.round(camScale * o.size.y));

}

/**
 * @param {number[]} arr 
 */
function fromColArr(arr) {
    if (arr.some(invalidCol)) return "#000000";
    return `rgba(${arr.join(", ")})`;
}
/**
 * @param {number} x
 */
function invalidCol(x) { return isNaN(x) || x > 255 || x < 0; }
