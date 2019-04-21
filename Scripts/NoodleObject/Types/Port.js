noodle.port = new class extends noodle.object.constructor {
    //Functions{
    new(noodle, name, portType, isIn, wires = [], node, value = null, noodleExp, shortable = false) {

        var port = new noodle.Port({ noodle: noodle, node: node, props: { name: name, portType: portType, isIn: isIn, wires: wires, value: value, shortable: shortable } });
        Object.defineProperty(port, 'type', { enumerable: false, writable: true, configurable: true, value: 'port' });
        port.noodleExp = noodleExp || noodle.expr.defaultNoodle(noodle, port);

        return port;
    }
    addToPorts(node, ports, port) {

        var portNoodle = port.noodle;

        ports.assign(port.name, port);
        portNoodle.port.render(node, port);
        port.meta.parNode = node;
        port.meta.parent = ports;
    }

    //Renders port in node.html
    render(node, port) {
        if (port.type === 'port' || port.type === 'node') {
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
            //var portNoodle = noodle.expr.eval(noodle, port.noodleExp); //TODO: Is there any reason to do this again?
            port.id = portNoodle.ids.firstFree(portNoodle.ids.freeList.port);
            //Insert port frame
            node.html.getElementsByClassName(inOrOut + 'Ports')[0].insertAdjacentHTML('beforeend', '<div class="port ' + inOrOut + 'put" id="p' + port.id + '"></div><br>');
            port.html = document.getElementById('p' + port.id);
            port.html.obj = port;
            //Insert interiror in frame
            portNoodle[port.type].renderInterior(noodle, port, noodle, inOrOut + 'put', node, inOrOut);

            port.rendered = true;


        }
        else {
            //Assuming that port is either a port or a group and that groups don't contain themselves
            for (var i in port) {
                noodle.port.render(node, port[i]);
            }
        }
    }

    //Sets up new wire between p0 and p1 and renders it
    connect(port0, port1) {
        var port0Noodle = noodle.expr.eval(noodle, port0.noodleExp);
        var wire = port0Noodle.wire.new(port0Noodle); //What?! //TODO: Figure out why I was confused
        var wireNoodle = noodle.expr.eval(noodle, wire.noodleExp); //Obsolete

        wireNoodle.wire.connect(port0, port1, wire, noodle);
        return wire;
    }

    //Generates html code for port
    renderInterior(noodle, port, portNoodle, classes, node, inOrOut) {
        var code = '<div class="socket ' + classes + '" id="s' + port.id + '" ></div> <a class="portLabel hoverSelect">' + port.name;

        //TODO: Clean up
        //Add value element and finish port code{

        code += '<a class="hoverSelect" id="val' + port.id + '"></a><br>';
        port.valId = 'val' + port.id;
        //}


        //portNoodle.ids.add(port); //Do we really need this line?

        //Insert code as html in port
        port.html.insertAdjacentHTML('beforeend', code);
        //Update wires
        portNoodle.port.updateWires([port]);

        return code;
    }

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
    }


    //Cuts all wires connected to port
    cut(port) {
        var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
        portNoodle.port.forEachWire(port, portNoodle.wire.cut);
    }

    //Makes sure that nothing will try to use port (useful when removing port)
    forget(port) {
        var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
        portNoodle.port.cut(port);
        portNoodle.ids.forget(portNoodle.ids.freeList, parseInt(port.id, 10), true);
    }

    //Renders all wires of ports
    renderWires(ports) {
        for (var i = 0; i < ports.length; i++) {
            for (var j = 0; j < ports[i].wires.length; j++) {
                var wire = ports[i].wires[j];
                wire.noodle.wire.render(wire);
                wire.noodle.wire.update(wire);
            }
        }
    }
    updateWires(ports) {
        for (var i in ports) {
            var port = ports[i];
            if (port.type === 'port')
                for (var j in port.wires) {
                    var wire = port.wires[j];
                    if (wire != null) //Should this be in more places? Would I want !==?
                        wire.noodle.wire.update(wire);
                }
            else {
                noodle.port.updateWires(port);
            }
        }
    }
    forEachWire(port, func) {
        for (var i = 0; i < port.wires.length; i++)
            func(port.wires[i]);
    }
    //}
}();
noodle.port.objsById = {};

noodle.Port = class extends Object {
    constructor(args = {}) {
        super();

        var { props: props, color: color, defVal: defVal, wires: wires, parNode: parNode } = args;
        props = props || {};
        if (color === undefined && parNode) {
            color = parNode.color;
        }
        if (defVal === undefined) {
            defVal = this.defVal;
        }
        if (wires === undefined) {
            wires = [];
        }

        props.isIn = props.isIn || false;
        for (var i in props) {
            this[i] = props[i];
        }
        this.color = color || 'grey'; //TODO: AUTO???
        this.value = this.defVal = defVal;
        this.wires = wires;
    }

    set value(val) {
        this.priv.value = val;
    }
    get value() {
        return this.priv.value;
    }

};

noodle.Port.defineProperties(noodle.Port.prototype, {
    defVal: {
        enumerable: true,
        writable: true,
        configurable: true,
        value: 0
    }
});
