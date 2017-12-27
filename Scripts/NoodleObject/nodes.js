noodle.node = {
    //Data{

    //Set to true to render nodes in parallell. Causes issues if a wire is trying to connect to unfinished node
    async: false,

    objsById: {},
    //}


    //Functions{
    setBoard(el) { //Never used - should it be removed?
        $.get('Html/nodeBoard.html', function (data) {
            el.innerHTML = data;
        });
    },

    //Adds new node, sets it up properly and renders it
    add(noodle, core, label, pos, noodleExp) {
        var node = noodle.node.new(noodle, core, label, pos, noodleExp);
        var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
        nodeNoodle.node.render(node, nodeBoard);

        return node;
    },
    new(noodle, coreExp, label = '', pos = { x: 0, y: 0 }, noodleExp = noodle.expr.fromObj(noodle, noodle)) {
        //Properties{
        var newCoreExp = noodle.misc.obj.clone(noodle, coreExp, {});
        var node = {
            label: label,
            core: noodle.expr.eval(noodle, newCoreExp),
            defaultExp: coreExp,
            pos: pos,
            noodleExp: noodleExp,
            useNoodle: false,
            rendered: false
        };
        Object.defineProperty(node, 'type', {enumerable: false, value: 'node'});

            //}

            //Ports{
            noodle.node.forEachPort(
                node.core,
                function (port, core) {
                    port.noodleExp.args[1] = port;
                }
            )

        node.core.inPorts = noodle.expr.evalAll(noodle, node.core.inPorts);
        node.core.outPorts = noodle.expr.evalAll(noodle, node.core.outPorts);
        //}

        noodle.misc.obj.deepStandardize(noodle, node, node);

        return node;
    }

    newExpr(noodle, name, func, inPortExps = [], outPortExps = [], data, resetFuncs, color, htmlContent) {
        var nodeExp = noodle.expr.new(
            noodle, //noodle
            function (noodle, name, func, inPorts, outPorts, data = {}, resetFuncs = [], color = 'auto', htmlContent = '') {
                return {
                    name: name,
                    color: color,
                    inPorts: inPorts,
                    outPorts: outPorts,
                    func: func,
                    data: data,
                    resetFuncs: resetFuncs,
                    htmlContent: htmlContent
                }
            }, //func
            noodle.expr.allFromObj(noodle, [noodle, name, func, inPortExps, outPortExps, data, resetFuncs, color, htmlContent]), //args
            null, //ans
            noodle.expr.defaultNoodle(noodle, null) //noodleExp
            //noodle.expr.fromObj(noodle, noodle) //noodleExp
        );
        nodeExp.name = name;
        return nodeExp;
    },
    //Renders node in container
    render(node, container) { //TODO: Noodle
        var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
        var nodeId = nodeNoodle.ids.firstFree(nodeNoodle.ids.freeList.node);
        var data = '';
        //TODO: Put all the stuff back into success to allow async
        $.ajax({
            //ajax options{
            async: nodeNoodle.node.async,
            type: 'GET',
            url: 'Html/emptyNode.html',
            //}
            success(d) {
                data = d;
            }
        });


        //Html text{
        //Set color of node
        var style = nodeNoodle.graphics.color.style(node.core.color);

        node.id = 'n' + nodeId;
        node.html = '<div class="node" id="n' + nodeId + '"' + style + '>' + data; //Not sure I like .html stuff
        node.html += '<div class="nodeContent"></div><br><a style="background-color: rgba(255, 255, 255, 0.5)"> id: ' + node.id + '</a>';
        //}

        //Render node in container{
        container.insertAdjacentHTML('beforeend', node.html);
        node.html = document.getElementById(node.id);

        nodeNoodle.ids.add(node);
        //}

        //Set events{
        $(".borderSensor").unbind('mousedown').mousedown(nodeNoodle.graphics.transformable.borderSensorFunc); //Ineffective to set mousedown functions for all border sensors every time? Who cares? Will I fix it? Hmm...
        //$(".btnClose").mousedown(nodeClose);

        nodeNoodle.misc.html.firstByClass(node.html, "btnClose").onmousedown = nodeNoodle.graphics.transformable.close;
        nodeNoodle.misc.html.firstByClass(node.html, "btnMaximize").onmousedown = nodeNoodle.graphics.transformable.maximize;

        nodeNoodle.misc.html.firstByClass(node.html, "nodeTopBar").onmousedown = nodeNoodle.graphics.transformable.topBarFunc;


        nodeNoodle.node.renderPorts(node);
        nodeNoodle.node.setSockEv(node);
        //}

        //Add content to node{
        var nodeEl = nodeNoodle.misc.html.getEl(node);
        if (node.core.htmlContent != undefined) {
            nodeEl.getElementsByClassName('nodeContent')[0].innerHTML = node.core.htmlContent;
        }
        nodeEl.style.left = node.pos.x + 'px';
        nodeEl.style.top = node.pos.y + 'px';
        nodeNoodle.ids.add(node);
        //}

        //Run reset functions of node
        for (var i = 0; i < node.core.resetFuncs.length; i++) {
            node.core.resetFuncs[i](node, nodeEl);
        }

        node.rendered = true;
        //}
        //});
    },

    //Cuts all wires connected to node
    disconnect(node) { // Seems like this function is never used
        forEachPort(node.core, cutPort);
    },

    //Gets js node from html element
    getObj(nodeEl, noodle) { //Switch arg order
        return noodle.node.objsById[nodeEl.id];
    },

    //Executes node and nodes connected to out ports
    execute(node) {
        if (node.rendered) {
            var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
            node.core.func(node);
            var outPorts = node.core.outPorts;
            for (var i = 0; i < outPorts.length; i++) {
                var port = outPorts[i]; //TODO: Only execute nodes of ports with new values
                for (var j = 0; j < port.wires.length; j++) {
                    var wire = port.wires[j];
                    wire.port1.value = port.value;
                    nodeNoodle.node.execute(wire.node1); //TODO: Don't execute same node again in case of multiple connections to same node
                }
                nodeNoodle.port.renderVal(port);
            }
        }
    },

    //Runs func with each port of core
    forEachPort(core, func) {
        for (var i = 0; i < core.inPorts.length; i++)
            func(core.inPorts[i], core);

        for (var i = 0; i < core.outPorts.length; i++)
            func(core.outPorts[i], core);
    },

    //Renders all ports of node
    renderPorts(node) {
        var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
        for (var i = 0; i < node.core.inPorts.length; i++)
            nodeNoodle.port.render(node, node.core.inPorts[i]);

        for (var i = 0; i < node.core.outPorts.length; i++)
            nodeNoodle.port.render(node, node.core.outPorts[i]);

        nodeNoodle.node.forEachPort(node.core, nodeNoodle.port.renderVal);
    },

    //Makes sure that a new wire will be pulled on mousemove and connected or deleted on mouseup
    setSockEv(node) {
        $('.socket').unbind().mousedown(function (e) { //TODO: Only set this event for children of node.html
            var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);

            active.socketEl = e.target;
            var port = nodeNoodle.port.getObj(active.socketEl.parentElement, nodeNoodle);
            var portNoodle = noodle.expr.eval(noodle, port.noodleExp); //Should we use nodeNoodle rather than noodle here?

            active.pullWire = portNoodle.wire.new(portNoodle);
            active.pullWire.noodle.wire.render(active.pullWire);
            toolBox.pullWire(e); //To avoid awkward start
            mousemove.setActiveTool(toolBox.pullWire);
            $('.socket').mouseup(function (e) {
                var pullPort = noodle.port.getObj(active.socketEl.parentElement, noodle);
                var targetPort = noodle.port.getObj(e.target.parentElement, noodle);
                if (noodle.misc.html.hasClass(active.socketEl, 'output')) { //If the wire is pulled from an output socket
                    noodle.wire.connect(pullPort, targetPort, active.pullWire, noodle);
                }
                else {
                    noodle.wire.connect(targetPort, pullPort, active.pullWire, noodle);
                }

                defMouseup();
                document.onmouseup = defMouseup;
                $('.socket').mouseup(null); //TODO: Same as next TODO
            });
            document.onmouseup = function () {
                noodle.wire.removeEl(active.pullWire);
                defMouseup();
                $('.socket').mouseup(null); //TODO: This doesn't look good
                document.onmouseup = defMouseup;
            }
        });
    }
    //}
},
};