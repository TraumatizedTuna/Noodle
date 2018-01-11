noodle.port = {
    //Data{
    objsById: {},
    //}

    //Functions{
    new(noodle, name, portType, isIn, wires = [], value = null, noodleExp, shortable = false) {

        var port = { name: name, portType: portType, isIn: isIn, wires: wires, value: value, shortable: shortable };
        Object.defineProperty(port, 'type', { enumerable: false, value: 'port' });
        port.noodleExp = noodleExp || noodle.expr.defaultNoodle(noodle, port);

        return port;
    },
    //Returns expression to generate port
    newExpr(noodle, name, type, isIn) {
        var exp = noodle.expr.new(
            noodle, //noodle
            noodle.port.new, //function
            noodle.expr.allFromObj(noodle, [noodle, name, type, isIn]), //args
            null, //ans
            noodle.expr.defaultNoodle(noodle, null) //noodleExp
            //noodle.expr.fromObj(noodle, noodle) //noodleExp
        );
        return exp;
    },
    addToPorts(node, ports, port) {
        port.noodleExp = port.noodleExp || node.noodleExp;
        var portNoodle = noodle.expr.eval(noodle, port.noodleExp);

        ports[port.name] = port;
        portNoodle.port.render(node, port);
        port.parNode = node;
        port.parent = ports;
    },

    //Renders port in node.html
    render(node, port) {
        if (port.type === 'port') {
            var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
            //String inOrOut indicates whether port is in or out{
            var inOrOut;
            if (port.isIn) {
                inOrOut = 'in';
            }
            else {
                inOrOut = 'out';
            }
            //}

            //Add port to node element
            node.html.getElementsByClassName(inOrOut + 'Ports')[0].insertAdjacentHTML('beforeend', portNoodle.port.code(port, inOrOut + 'put', node));

            port.rendered = true;

            portNoodle.port.updateWires([port]);
        }
        else {
            //Assuming that port is either a port or a group and that groups don't contain themselves
            for (var i in port) {
                noodle.port.render(node, port[i]);
            }
        }
    },

    //Sets up new wire between p0 and p1 and renders it
    connect(port0, port1) {
        var port0Noodle = noodle.expr.eval(noodle, port0.noodleExp);
        var wire = port0Noodle.wire.new(port0Noodle); //What?!
        var wireNoodle = noodle.expr.eval(noodle, wire.noodleExp);

        wireNoodle.wire.connect(port0, port1, wire, noodle);
        return wire;
    },

    //Generates html code for port
    code(port, classes, node) {
        var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
        var portId = portNoodle.ids.firstFree(portNoodle.ids.freeList.port);
        var code = '<div class="port ' + classes + '" id="p' + portId + '"><div class="socket num ' + classes + '" id="s' + portId + '"></div> <a class="hoverSelect">' + port.name + '</a>';

        //TODO: Clean up
        //Add value element and finish port code{
        /*if (port.isIn) {
            code += '<input type="number" id="val' + portId + '"><br></div><br>';
        }
        else {*/
        code += '<a class="hoverSelect" id="val' + portId + '"><br></div><br>';
        //}
        port.valId = 'val' + portId;
        //}

        port.id = 'p' + portId;
        portNoodle.ids.add(port);

        return code;
    },

    //Renders value of port
    renderVal(port) {
        var valEl = document.getElementById(port.valId);
        //TODO; Clean up
        /*
        if (port.isIn) {
            valEl.value = port.value;
        }
        else {*/
        valEl.innerHTML = port.value;
        //}
    },

    //Gets js port from html element
    getObj(noodle, portEl) {
        return noodle.port.objsById[portEl.id];
    },

    //Cuts all wires connected to port
    cut(port) {
        var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
        portNoodle.port.forEachWire(port, portNoodle.wire.cut);
    },

    //Makes sure that nothing will try to use port (useful when removing port)
    forget(port) {
        var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
        portNoodle.port.cut(port);
        portNoodle.ids.forget(portNoodle.ids.freeList.port, parseInt(port.id.substr(1), 10), true);
    },

    //Renders all wires of ports
    renderWires(ports) {
        for (var i = 0; i < ports.length; i++) {
            for (var j = 0; j < ports[i].wires.length; j++) {
                var wire = ports[i].wires[j];
                wire.noodle.wire.render(wire);
                wire.noodle.wire.update(wire);
            }
        }
    },
    updateWires(ports) {
        for (var i in ports) {
            var port = ports[i];
            if (port.type === 'port')
                for (var j in port.wires) {
                    var wire = port.wires[j];
                    if (wire != null) //Should this be in more places?
                        wire.noodle.wire.update(wire);
                }
            else {
                noodle.port.updateWires(port);
            }
        }
    },
    forEachWire(port, func) {
        for (var i = 0; i < port.wires.length; i++)
            func(port.wires[i]);
    }
    //}
};