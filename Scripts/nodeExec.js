function execNode(node){
    node.core.func(node);
    var outPorts = node.core.outPorts;
    for(var i = 0; i < outPorts.length; i++){
        var port = outPorts[i]; //TODO: Only execute nodes of ports with new values
        for(var j = 0; j < port.wires.length; j++){
            execNode(port.wires[0].node1); //TODO: Don't execute same node again in case of multiple connections to same node
        }
    }
}