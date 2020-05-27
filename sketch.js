// @fcanas

// Setup.
if (navigator.requestMIDIAccess) {
    // Try to connect to the MIDI interface.
    navigator.requestMIDIAccess().then(onSuccess, onFailure);
} else {
    block('This toy uses the Web MIDI API. Open in Chrome.');
}

// Block the UI with an error message
function block(message) {
    let container = document.getElementsByClassName('container')[0];
    container.innerHTML = message;
}

function onFailure(error) {
    block('This toy uses the MIDI, and something went wrong with that. Grant access to MIDI, or try again.');
}

function onSuccess(interface) {
    // All available devices
    var iter = interface.inputs.values();
    var total = 0;
    for (var i = iter.next(); i && !i.done; i = iter.next()) {
        i.value.onmidimessage = getMIDIMessage;;
        total += 1;
    }

    if (total < 1) {
        block('No MIDI device was found. Please connect one and reload the page. Get one with knobs if you can.');
        return;
    }
}

// Drawing scale (MIDI values are 0-127, so 2x makes the size 254)
let scale = 2;

// What input is being configured
var configuring = null;

// Identity of the controls
var leftControl = null;
var rightControl = null;
var shakeControl = null;

// Position of stylus
var x = null;
var y = null;

// Data string for svg path
var d = '';

function getMIDIMessage(midiMessage) {
    let data = midiMessage.data;

    // If we're configuring...
    if (configuring != null) {
        var needsInit = d == '';
        switch (configuring) {
            case 'left':
                leftControl = data[1];
                x = data[2] * scale;
                break;
            case 'right':
                rightControl = data[1];
                y = (127 - data[2]) * scale;
                break;
            case 'shake':
                shakeControl = data[1];
                break;
        }
        configuring = null;
        // Valid x, y can only happen once both knobs
        // are correctly configured. Start of path must
        // be with a Move command. Insert that here. 
        // see: shake()
        if (needsInit && x != null && y != null) {
            d = 'M' + x + ' ' + y;
        }
        return
    }

    // Try reading control value
    switch (data[1]) {
        case leftControl:
            x = data[2] * scale;
            document.getElementById('left-knob').innerText = x;
            break;
        case rightControl:
            y = (127 - data[2]) * scale;
            document.getElementById('right-knob').innerText = y;
            break;
        case shakeControl:
            shake();
            break;
    }

    if (x == null || y == null) {
        return;
    }
    // Line to
    d += 'L' + x + ' ' + y;

    let path = document.getElementById('path');
    path.setAttribute('d', d);
}

function configureLeft() {
    configuring = 'left';
}

function configureRight() {
    configuring = 'right';
}

function setShake() {
    configuring = 'shake';
}

function shake() {
    // Clear data. Move to current stylus point
    d = 'M' + x + ' ' + y;
    path.setAttribute('d', d);
}