function createIce(x = 0, y = 0, w = 10, h = 10) {
    const ice = {
        pos: {
            x,
            y
        },
        size: {
            x: w,
            y: h
        },
        type: "ice"
    };

    // Create inputs/labels
    const xInput = document.createElement("input");
    xInput.value = x;
    xInput.addEventListener("input", () => {
        ice.pos.x = Number(xInput.value);
    });

    const yInput = document.createElement("input");
    yInput.value = y;
    yInput.addEventListener("input", () => {
        ice.pos.y = Number(yInput.value);
    });

    const wInput = document.createElement("input");
    wInput.value = w;
    wInput.addEventListener("input", () => {
        ice.size.x = wInput.value = Math.max(wInput.value, 0);
    });

    const hInput = document.createElement("input");
    hInput.value = h;
    hInput.addEventListener("input", () => {
        ice.size.y = hInput.value = Math.max(hInput.value, 0);
    });


    ice.element = createFolder("Ice Properties", [
        createFolder("Position", [
            createProperty("x", xInput, "number"),
            createProperty("y", yInput, "number")
        ]),
        createFolder("Size", [
            createProperty("width", wInput, "number"),
            createProperty("height", hInput, "number")
        ])
    ]);
    ice.inputs = {
        x: xInput,
        y: yInput,
        w: wInput,
        h: hInput
    };

    return ice;
}