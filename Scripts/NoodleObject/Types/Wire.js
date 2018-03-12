noodle.wire = {
    //Data{

    //Length of handles on wire svg elements
    hanLen: .5,

    //Slack of wire svg elements
    slack: 5,

    objsById: {},
    //}

    //Functions{

    //Returns a new, unconnected wire object
    new(noodle) {
        var wire = {
            node0: null, port0: 0,
            node1: null, port1: 0,
            rendered: false,
            noodle: noodle,
        };
        Object.defineProperty(wire, 'type', { enumerable: false, writable: true, configurable: true, value: 'wire'});
        wire.noodleExp = noodle.expr.defaultNoodle(noodle, wire)
        //noodle.object.deepStandardize(noodle, wire); //This line shouldn't do any difference but I guess I should check why it crashes
        container.wires.push(wire);
        var wireId = noodle.ids.firstFree(noodle.ids.freeList.wire);
        wire.id = 'w' + wireId;
        noodle.ids.add(wire);

        return wire;
    },

    //Connects ports p0 and p1 with wire
    connect(p0, p1, wire, noodle) {
        var wireNoodle = wire.noodle;//noodle.getNoodle(noodle, wire);
        //Set up objects so ports contain wire{
        //Set indices of wire in the ports
        wire.p0Ind = p0.wires.length;
        wire.p1Ind = p1.wires.length;

        //Add wire to wire lists of the two ports
        p0.wires.push(wire);
        p1.wires.push(wire);

        wire.port0 = p0;
        wire.port1 = p1;

        wire.node0 = p0.meta.parNode;
        wire.node1 = p1.meta.parNode;
        //}

        if (!wire.rendered) {
            wireNoodle.wire.render(wire);
        }

        wireNoodle.wire.update(wire);
        if (wire.port0.rendered)
            //noodle.getNoodle(noodle, wire.node0).
            wire.node0.noodle.node.execute(wire.node0);
    },

    //Sets up wire html and renders wire to wireBoard
    render(wire) {
        wireBoard.insertAdjacentHTML('beforeend', '<path class="wire" id="' + wire.id + '" d="M10 10 C 20 20, 40 20, 50 10" stroke="white" stroke-width="3px" fill="transparent"/>');
        wire.html = document.getElementById(wire.id);
        wire.rendered = false;
    },

    //Updates wire element using wireBetween
    update(wire, noodle) {
        var outPort = wire.port0;
        var inPort = wire.port1;

        if (!wire.rendered)
            wire.noodle.wire.render(wire);
        if (outPort.rendered && inPort.rendered) {
            wire.html.style = 'visibility: visible;'; //In case wire is hidden

            var outPos = wire.noodle.html.getElPos(outPort.html.getElementsByClassName("socket")[0], 1);

            var inPos = wire.noodle.html.getElPos(inPort.html.getElementsByClassName("socket")[0], 1);

            wire.noodle.wire.wireBetween(outPos, inPos, wire);
        }
        else
            wire.html.style = 'visibility: hidden;'
    },

    //Updates wire svg curve so it goes between positions p0 and p1
    wireBetween(p0, p1, wire) {
        var r = $('.socket').width() / 2 + parseInt($('.socket').css('borderWidth'), 10); //8; //TODO: Make this work for other socket sizes
        wire.noodle.html.getEl(wire).attributes.d.value = wire.noodle.graphics.svg.autoBez(p0.x + r, p0.y + r, p1.x + r, p1.y + r, wire.noodle.wire.hanLen, wire.noodle.wire.slack);

    },

    //Does its best to convince you that wire never existed
    cut(wire) { //Generalize so wires and nodes are removed by same function?
        if (wire != undefined) {
            console.log("cut");

            //Remove html element
            wire.noodle.wire.removeEl(wire);

            //Remove wire from parent ports{
            wire.port0.wires.splice(wire.p0Ind, 1);
            wire.port1.wires.splice(wire.p1Ind, 1);
            wire.noodle.wire.refreshPortInds(wire.port0.wires, 0);
            wire.noodle.wire.refreshPortInds(wire.port1.wires, 1);
            //}
        }
    },

    removeEl(wire) {
        var wireEl = document.getElementById(wire.id);
        wire.noodle.wire.objsById[wireEl.id] = undefined;
        wireEl.remove();
        wire.noodle.ids.forget(wire.noodle.ids.freeList, parseInt(wire.id.substr(1), 10), true);
    },

    //Makes sure that wires know their indices in wire lists of their parent ports
    refreshPortInds(wires, portType) {
        for (var i = 0; i < wires.length; i++) {
            //eval('container.wires[i].p' + portType + 'ind=i');
            container.wires[i]['p' + portType + 'ind'] = i;
        }
    },

    //Returns js object of wire element
    getObj(noodle, wireEl) {
        return noodle.wire.objsById[wireEl.id];
    }
    //}
};