function portCode(ports, classes, node){
    var code = "";
    for(var i = 0; i < ports.length; i++){
        var port = ports[i];
        code += '<div class="port ' + classes + '" id="p' + portId + '"><div class="socket num ' + classes + '" id="s' + portId + '"></div> <a class="hoverSelect">' + port.name + '</a>';
        if(port.isIn){
            code += '<input type="number" id="val' + portId + '"><br></div><br>';
        }
        else{
            code += '<a class="hoverSelect" id="val' + portId + '"><br></div><br>';
        }
        port.id = 'p' + portId;
        port.parentNode = node;
        addToPortIds(port);
        portId++;
    }
    
    
    return code;
}

function addToPortIds(port){
    eval('portIds.' + port.id + '=port;');
}

function getPort(portEl){
    return eval('portIds.' + portEl.id);
}

function cutPort(port){
    forEachWire(port, cutWire);
}

function forEachPort(core, func){
    for(var i = 0; i < core.inPorts.length; i++)
        func(core.inPorts[i]);
        
    for(var i = 0; i < core.outPorts.length; i++)
        func(core.outPorts[i]);
}