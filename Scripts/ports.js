function portCode(ports, classes, node){
    var code = "";
    for(var i = 0; i < ports.length; i++){
        var port = ports[i];
        code += '<div class="port ' + classes + '" id="p' + portId + '"><div class="socket num ' + classes + '" id="s' + portId + '"></div> <a class="hoverSelect">' + port.name + '</a><br></div>';
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