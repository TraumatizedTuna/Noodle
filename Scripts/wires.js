function newWire(){
    
    var wire = {
        node0: null, port0: 0,
        node1: null, port1: 0
    };
    wires.push(wire);
    return wire;
}

function addWire(p0, p1){
    var wire = newWire();
    connectWire(p0, p1, wire);
    return wire;
}

function connectWire(p0, p1, wire){
    wire.p0Ind = p0.wires.length;
    wire.p1Ind = p1.wires.length;
    
    p0.wires.push(wire);
    p1.wires.push(wire);
    
    wire.port0 = p0;
    wire.port1 = p1;
    
    wire.node0 = p0.parentNode;
    wire.node1 = p1.parentNode;
    
    
    
    if(wire.id == undefined){ //If wire hasn't been rendered, render it
        renderWire(wire);
    }
    
    updateWire(wire);
}

function renderWires(ports){
    for(var i = 0; i < ports.length; i++){
        for(var j = 0; j < ports[i].wires.length; j++){
            renderWire(ports[i].wires[j]);
            updateWire(ports[i].wires[j]);
        }
    }
}


function renderWire(wire){
    wireBoard.insertAdjacentHTML('beforeend', '<path class="wire" id="w' + wireId + '" d="M10 10 C 20 20, 40 20, 50 10" stroke="black" stroke-width="3px" fill="transparent"/>');
    wire.id = 'w' + wireId;
    add2WireIds(wire);
    wireId++;
}

function updateWires(ports){
    for(var i = 0; i < ports.length; i++){
        for(var j = 0; j < ports[i].wires.length; j++){
            if(ports[i].wires[j] != null) //Should this be in more places?
                updateWire(ports[i].wires[j]);
        }
    }
}

var hanLen = .5;
var slack = 5;

function updateWire(wire){
    var outPort = wire.port0;
    var outPos = getElPos(document.getElementById(outPort.id).getElementsByClassName("socket")[0], 1);
    
    var inPort = wire.port1;
    var inPos = getElPos(document.getElementById(inPort.id).getElementsByClassName("socket")[0], 1);
    
    wireBetween(outPos, inPos, wire);
}

function wireBetween(p0, p1, wire){
    var r = $('.socket').width() / 2 + parseInt($('.socket').css('borderWidth'), 10); //8; //TODO: Make this work for other socket sizes
    getEl(wire).attributes.d.value = autoBez(p0.x + r, p0.y + r, p1.x + r, p1.y + r, hanLen, slack);
    
}



function cutWire(wire){ //Generalize so wires and nodes are removed by same function?
    if(wire != undefined){
        console.log("cut");
        var wireEl = document.getElementById(wire.id);
        removeWireEl(wireEl);

        wire.port0.wires.splice(wire.p0Ind, 1);
        wire.port1.wires.splice(wire.p1Ind, 1);
        refreshWirePortInds(wire.port0.wires, 0);
        refreshWirePortInds(wire.port1.wires, 1);

        wire = undefined;
    }
}

function removeWireEl(wireEl){
    eval('wireIds.' + wireEl.id + '= undefined');
    wireEl.remove();
}

function refreshWirePortInds(wires, portType){
    for(var i = 0; i < wires.length; i++){
        eval('wires[i].p' + portType + 'ind=i');
    }
}


function autoBez(x0, y0, x1, y1, ctrlDist, slack){
    var dx = (x1 - x0) * ctrlDist;
    var dy = Math.abs(y1 - y0);
    var dxMin = 128;
    if(dxMin > dy)
        dxMin = dy;
    if(dx < dxMin)
        dx = dxMin;
    //if(dx > dy)
    //    dx = dy;
    
    slack *= Math.pow(dx, 0.5) / Math.pow(dy + 100, .5) * 10;
    
    return 'M' + x0 + ' ' + y0 + ' C ' + (x0 + dx) + ' ' + (y0 + slack) + ', ' + (x1 - dx) + ' ' + (y1 + slack) + ', ' + x1 + ' ' + y1;
}



function add2WireIds(wire){
    eval('wireIds.' + wire.id + '=wire;');
}

function getWire(html){
    return eval('wireIds.' + html.id);
}

function forEachWire(port, func){
    for(var i = 0; i < port.wires.length; i++)
        func(port.wires[i]);
}