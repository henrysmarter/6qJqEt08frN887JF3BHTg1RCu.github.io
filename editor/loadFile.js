function loadFile(str) {
    try {
        /** @type {{settings: {name: string | null, creator: string | null, version: number | null, skapclient_version: *, spawnArea: string, spawnPos: [number, number]}, maps: {areaColor: ColorArr, backgroundColor: [number, number, number, number], name: string, objects: {type: string, position: [number, number], size: [number, number]}[], size: [number, number], gravity?: number}[]}} */
        let obj = JSON.parse(str);

        map.inputs.name.value = map.settings.name = obj.settings.name ?? null;
        map.inputs.creator.value = map.settings.creator = obj.settings.creator ?? null;

        map.settings.version = obj.settings.version ?? null;
        map.settings.skapclient_version = obj.settings.skapclient_version ?? null;

        map.inputs.spawnX.value = map.settings.spawnPos[0] = obj.settings.spawnPosition[0] ?? 0;
        map.inputs.spawnY.value = map.settings.spawnPos[1] = obj.settings.spawnPosition[1] ?? 0;
        
        map.inputs.spawnArea.value = map.settings.spawnArea = obj.settings.spawnArea ?? "Home";
        map.areas = [];

        while (areamenu.firstChild) areamenu.removeChild(areamenu.firstChild);
        while (areaList.firstChild) areaList.removeChild(areaList.firstChild);
        if (selectedObject) hide(selectedObject.element)
        selectedObject = null;

        for (let area of obj.maps) {
            if (!("backgroundColor" in area)) area.backgroundColor = [0, 10, 87, 0.8];
            if (!("areaColor" in area)) area.areaColor = [230, 230, 230];

            const parsedArea = createArea(area.name, area.backgroundColor.slice(0, 3), area.backgroundColor[3] ?? 0.8, area.areaColor, area.size[0], area.size[1], (area.gravity ?? 100) / 100);

            map.areas.push(parsedArea);
            areamenu.appendChild(parsedArea.element);
            hide(parsedArea.element);

            parsedArea.button = document.createElement("button");
            parsedArea.button.innerHTML = htmlspecialchars(parsedArea.name);
            parsedArea.button.addEventListener("click", () => {
                if (currentArea) hide(currentArea.element);
                currentArea = parsedArea;
                if (selectedObject) hide(selectedObject.element);
                selectedObject = null;

                document.documentElement.style.setProperty("--obstacle", `rgba(${parsedArea.colorArr[0]}, ${parsedArea.colorArr[1]}, ${parsedArea.colorArr[2]}, ${parsedArea.opacity}`);
                show(currentArea.element);
            });
            parsedArea.inputs.name.addEventListener("input", () => {
                parsedArea.button.innerHTML = htmlspecialchars(parsedArea.name);
            });
            areaList.appendChild(parsedArea.button);

            for (let object of area.objects) {
                switch (object.type) {
                    case "obstacle": {
                        const obstacle = createObstacle(object.position[0], object.position[1], object.size[0], object.size[1]);
                        parsedArea.objects.obstacle.push(obstacle);

                        objectmenu.appendChild(obstacle.element);
                        hide(obstacle.element);
                        break;
                    }
                    case "lava": {
                        const lava = createLava(object.position[0], object.position[1], object.size[0], object.size[1]);
                        parsedArea.objects.lava.push(lava);

                        objectmenu.appendChild(lava.element);
                        hide(lava.element);
                        break;
                    }
                    case "slime": {
                        const slime = createSlime(object.position[0], object.position[1], object.size[0], object.size[1]);
                        parsedArea.objects.slime.push(slime);

                        objectmenu.appendChild(slime.element);
                        hide(slime.element);
                        break;
                    }
                    case "ice": {
                        const ice = createIce(object.position[0], object.position[1], object.size[0], object.size[1]);
                        parsedArea.objects.ice.push(ice);

                        objectmenu.appendChild(ice.element);
                        hide(ice.element);
                        break;
                    }
                    case "block": {
                        const block = createBlock(object.position[0], object.position[1], object.size[0], object.size[1], object.color, object.opacity, object.collide, object.layer);
                        parsedArea.objects.block.push(block);

                        objectmenu.appendChild(block.element);
                        hide(block.element);
                        break;
                    }
                    case "teleporter": {
                        const teleporter = createTeleporter(object.position[0], object.position[1], object.size[0], object.size[1], Number(object.dir), object.id, object.targetArea, object.targetId);
                        parsedArea.objects.teleporter.push(teleporter);
                        objectmenu.appendChild(teleporter.element);
                        hide(teleporter.element);
                        break;
                    }
                    case "text": {
                        /** @type {string[]} */
                        let split = object.text.split("|");
                        if (split[0] === "SKAPCLIENT.IMAGE") {
                        } else {
                            const text = createText(object.position[0], object.position[1], object.text);
                            parsedArea.objects.text.push(text);

                            objectmenu.appendChild(text.element);
                            hide(text.element);
                        }
                        break;
                    }
                    case "spawner": {
                        const spawner = createSpawner(object.position[0], object.position[1], object.size[0], object.size[1], object.entityType, object.number, object.speed, object.radius);
                        parsedArea.objects.spawner.push(spawner);

                        objectmenu.appendChild(spawner.element);
                        hide(spawner.element);
                        break;
                    }
                    case "gravityZone": {
                        const gravZone = createGravZone(object.position[0], object.position[1], object.size[0], object.size[1], Number(object.dir));
                        parsedArea.objects.gravityZone.push(gravZone);

                        objectmenu.appendChild(gravZone.element);
                        hide(gravZone.element);
                        break;
                    }
                    case "rotatingLava": {
                        const rotLava = createRotatingLava(object.position[0], object.position[1], object.size[0], object.size[1], object.point[0], object.point[1], object.startAngle, object.speed);
                        parsedArea.objects.rotatingLava.push(rotLava);

                        objectmenu.appendChild(rotLava.element);
                        hide(rotLava.element);
                        break;
                    }
                    case "circularObstacle": {
                        const cirObj = createCircularObject(object.position[0] - object.radius, object.position[1] - object.radius, object.radius, "obstacle");
                        parsedArea.objects.circularObject.push(cirObj);

                        objectmenu.appendChild(cirObj.element);
                        hide(cirObj.element);
                        break;
                    }
                    case "circularLava": {
                        const cirObj = createCircularObject(object.position[0] - object.radius, object.position[1] - object.radius, object.radius, "lava");
                        parsedArea.objects.circularObject.push(cirObj);

                        objectmenu.appendChild(cirObj.element);
                        hide(cirObj.element);
                        break;
                    }
                    case "circularSlime": {
                        const cirObj = createCircularObject(object.position[0] - object.radius, object.position[1] - object.radius, object.radius, "slime");
                        parsedArea.objects.circularObject.push(cirObj);

                        objectmenu.appendChild(cirObj.element);
                        hide(cirObj.element);
                        break;
                    }
                    case "circularIce": {
                        const cirObj = createCircularObject(object.position[0] - object.radius, object.position[1] - object.radius, object.radius, "ice");
                        parsedArea.objects.circularObject.push(cirObj);

                        objectmenu.appendChild(cirObj.element);
                        hide(cirObj.element);
                        break;
                    }
                    case "door": {
                        const door = createDoor(object.position[0], object.position[1], object.size[0], object.size[1], object.linkIds);
                        parsedArea.objects.door.push(door);

                        objectmenu.appendChild(door.element);
                        hide(door.element);
                        break;
                    }
                    case "switch": {
                        const Switch = createSwitch(object.position[0], object.position[1], object.size[0], object.size[1], object.dir, object.id);
                        parsedArea.objects.switch.push(Switch);

                        objectmenu.appendChild(Switch.element);
                        hide(Switch.element);
                        break;
                    }
                    case "button": {
                        const button = createButton(object.position[0], object.position[1], object.size[0], object.size[1], object.dir, object.id, object.time);
                        parsedArea.objects.button.push(button);

                        objectmenu.appendChild(button.element);
                        hide(button.element);
                        break;
                    }
                    case "turret": {
                        const turret = createTurret(object.position[0], object.position[1], object.regionPosition[0], object.regionPosition[1], object.regionSize[0], object.regionSize[1], object.radius, object.speed, object.shootingSpeed, object.overHeat, object.coolDownTime);
                        parsedArea.objects.turret.push(turret);

                        objectmenu.appendChild(turret.element);
                        hide(turret.element);
                        break;
                    }
                    case "movingObstacle": {
                        const movObj = createMovingObject(object.size[0], object.size[1], "obstacle", object.points.map(point => ({
                            x: point.position[0],
                            y: point.position[1],
                            vel: point.vel
                        })));
                        parsedArea.objects.movingObject.push(movObj);

                        objectmenu.appendChild(movObj.element);
                        hide(movObj.element);
                        break;
                    }
                    case "movingLava": {
                        const movObj = createMovingObject(object.size[0], object.size[1], "lava", object.points.map(point => ({
                            x: point.position[0],
                            y: point.position[1],
                            vel: point.vel
                        })));
                        parsedArea.objects.movingObject.push(movObj);

                        objectmenu.appendChild(movObj.element);
                        hide(movObj.element);
                        break;
                    }
                    case "movingSlime": {
                        const movObj = createMovingObject(object.size[0], object.size[1], "slime", object.points.map(point => ({
                            x: point.position[0],
                            y: point.position[1],
                            vel: point.vel
                        })));
                        parsedArea.objects.movingObject.push(movObj);

                        objectmenu.appendChild(movObj.element);
                        hide(movObj.element);
                        break;
                    }
                    case "movingIce": {
                        const movObj = createMovingObject(object.size[0], object.size[1], "ice", object.points.map(point => ({
                            x: point.position[0],
                            y: point.position[1],
                            vel: point.vel
                        })));
                        parsedArea.objects.movingObject.push(movObj);

                        objectmenu.appendChild(movObj.element);
                        hide(movObj.element);
                        break;
                    }
                    default: {
                        console.log("Unsupported object type", object.type);
                        console.log(object);
                        parsedArea.objects.unknown.push(object);
                    }
                }
            }
        }
        show(map.areas[0].element);
        currentArea = map.areas[0];
    } catch (err) {
        console.error(err);
    }
}