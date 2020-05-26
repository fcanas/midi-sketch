// @fcanas

// Check if the Web MIDI API is supported by the browser
if (navigator.requestMIDIAccess) {
    
    // Try to connect to the MIDI interface.
    navigator.requestMIDIAccess().then(onSuccess, onFailure);
    
} else {
    console.log('This toy uses web midi apis.');
}

// Function executed on successful connection
function onSuccess(interface) {
    
    var noteon,
    noteoff;
    // inputs = [];
    
    // Grab an array of all available devices
    var iter = interface.inputs.values();
    for (var i = iter.next(); i && !i.done; i = iter.next()) {
        i.value.onmidimessage = getMIDIMessage;;
        console.log(i)
    }
    //console.log(inputs);
}

function onFailure(error) {
    console.log("Could not connect to the MIDI interface");
}

let scale = 2;

var configuring = null;
var leftControl = null;
var rightControl = null;

var x = null;
var y = null;

var d = '';

function getMIDIMessage(midiMessage) {
    let data = midiMessage.data;

    // If we're configuring...
    if (configuring != null) {
        switch (configuring) {
            case "left":
                leftControl = data[1];
                x = data[2] * scale;
                break;
            case "right":
                rightControl = data[1];
                y = (127 - data[2]) * scale;
                break;
        }
        configuring = null;
        d = 'M' + x + ' ' + y;
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
    }

    if (x == null || y == null) {
        return;
    }
    d += 'L' + x + ' ' + y;

    let path = document.getElementById('path');
    path.setAttribute('d', d);


    //console.log('(' + x + ', ' + y + ')');
}

function configureLeft() {
    configuring = 'left';
}

function configureRight() {
    configuring = 'right';
}

function shake() {
    d = 'M' + x + ' ' + y;
    path.setAttribute('d', d);
}