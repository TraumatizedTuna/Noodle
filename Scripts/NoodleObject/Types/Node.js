noodle.node = {
    //Data{

    //Set to true to render nodes in parallell. Causes issues if a wire is trying to connect to unfinished node
    async: false,

    objsById: {},

    //}


    //Functions{
    //TODO: What if node is already rendered?
    setDefaultPorts(noodle, node) {
        var inports = node.core.inPorts;
        var outPorts = node.core.outPorts;

        outPorts.meta = outPorts.meta || {};
        outPorts.meta.node = noodle.port.new(noodle, 'node', 'node', false, [], node);
    },
    setBoard(el) { //Never used - should it be removed?
        $.get('Html/nodeBoard.html', function (data) {
            el.innerHTML = data;
        });
    },

    //TODO: Add container parameter whenever add is called
    //Adds new node, sets it up properly and renders it
    add(noodle, container, constr, label, pos, noodleExp) {
        var node = constr(noodle, label, pos, noodleExp);
        container.forest.push(node);
        var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
        nodeNoodle.node.render(node, container);
        nodeNoodle.graphics.transformable.setActive(nodeNoodle, node.html); //Should this be inside render?

        return node;
    },
    new(noodle, core, label = '', pos = { x: 0, y: 0 }, noodleExp = noodle.expr.fromObj(noodle, noodle)) {
        //Properties{
        cloneCounter = 0;
        //var newCoreExp = noodle.object.clone(noodle, core, {});
        var node = {
            label: label,
            core: core,
            pos: pos,
            startPos: { x: pos.x, y: pos.y }, //Have to clone it to avoid weird stuff
            noodleExp: noodleExp,
            useNoodle: false,
            rendered: false
        };
        noodle.node.setDefaultPorts(noodle, node);
        Object.defineProperty(node, 'type', { enumerable: false, value: 'node' });
        console.log('Clone iterations: ' + cloneCounter + '\nObject: ' + core.toString());

        //}

        //Ports{
        noodle.node.forEachPort(
            node.core,
            function (port, core) {
                port.noodleExp.args[1] = port;
            }
        )

        /*node.core.inPorts = noodle.expr.evalAll(noodle, node.core.inPorts);
        node.core.outPorts = noodle.expr.evalAll(noodle, node.core.outPorts);*/
        //}

        noodle.object.deepStandardize(noodle, node, node);

        return node;
    },

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
            noodle.expr.allFromObj(noodle, [noodle, name]).concat(noodle.expr.newGenerators(noodle, [func, inPortExps, outPortExps, data, resetFuncs, color, htmlContent])), //args
            null, //ans
            noodle.expr.defaultNoodle(noodle, null), //noodleExp
            //noodle.expr.fromObj(noodle, noodle) //noodleExp
            noodle.expr.alwaysReady
        );
        nodeExp.name = name;
        return nodeExp;
    },
    //Renders node in container
    render(node, container) { //TODO: Noodle
        var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
        var nodeId = nodeNoodle.ids.firstFree(nodeNoodle.ids.freeList.node);
        //TODO: Put all the stuff back into success to allow async
        $.ajax({
            //ajax options{
            async: nodeNoodle.node.async,
            type: 'GET',
            url: 'Html/emptyNode.html',
            //}
            success(data) {


                //Html text{
                //Set color of node
                var style = nodeNoodle.graphics.color.style(node.core.color);

                node.id = 'n' + nodeId;
                node.html = '<div class="node" id="n' + nodeId + '"' + style + '>' + data; //Not sure I like .html stuff
                //}

                //Render node frame in container{
                container.html.insertAdjacentHTML('beforeend', node.html);
                node.html = document.getElementById(node.id);
                node.html.obj = node;

                nodeNoodle.ids.add(node);
                //}
                //Set events{
                nodeNoodle.html.firstByClass(node.html, "btnClose").onmousedown = nodeNoodle.graphics.transformable.close;
                nodeNoodle.html.firstByClass(node.html, "btnMaximize").onmousedown = nodeNoodle.graphics.transformable.maximize;

                nodeNoodle.html.firstByClass(node.html, "nodeTopBar").onmousedown = nodeNoodle.graphics.transformable.topBarFunc;
                //}

                nodeNoodle.node.renderInterior(noodle, node);


            }
        });
    },
    renderInterior(noodle, node, nodeNoodle = noodle) {
        node.html.insertAdjacentHTML('beforeend', '<div class="portContainer">\n            <div class="inPorts" ></div >\n            <div class="outPorts"></div>\n</div ><div class="nodeContent"></div><br><a style="background-color: rgba(255, 255, 255, 0.5)"> id: ' + node.id + '</a>');

        //Render ports
        nodeNoodle.node.renderPorts(node);


        //Set events{
        $(".borderSensor").unbind('mousedown').mousedown(nodeNoodle.graphics.transformable.borderSensorFunc); //Ineffective to set mousedown functions for all border sensors every time? Who cares? Will I fix it? Hmm...
        //$(".btnClose").mousedown(nodeClose);

        node.html.onmousedown = function (e) {
            e.stopPropagation();
            //noodle.graphics.transformable.setActive(noodle, this); //TODO: Use correct noodle
            if (!this.classList.contains('active'))
                noodle.graphics.transformable.setActive(noodle, this, !e.shiftKey);
        }




        nodeNoodle.node.setSockEv(node);
        //}

        //Add content to node{
        var nodeEl = nodeNoodle.html.getEl(node);
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
    },

    //Cuts all wires connected to node
    disconnect(noodle, node) { // Seems like this function is never used
        noodle.node.forEachPort(node.core, noodle.port.cut);
    },

    //Gets js node from html element
    getObj(noodle, nodeEl) {
        return noodle.node.objsById[nodeEl.id];
    },

    //Executes node and nodes connected to out ports
    execute(node) {
        if (node.rendered) {
            var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
            node.core.func(node);
            var outPorts = node.core.outPorts;

            var f = function (noodle, port) {
                if (port.type === 'port') {
                    //TODO: Only execute nodes of ports with new values
                    for (var j = 0; j < port.wires.length; j++) {
                        var wire = port.wires[j];
                        wire.port1.value = port.value;
                        nodeNoodle.node.execute(wire.node1); //TODO: Don't execute same node again in case of multiple connections to same node
                    }
                    nodeNoodle.port.renderVal(port);
                }
                else {
                    for (var i in port)
                        f(noodle, port[i])
                }
            }

            f(noodle, node.core.outPorts);
        }
    },

    //Runs func with each port of core
    forEachPort(core, func) {
        var f = function (port, core, func) {
            if (port.type === 'port' || port.type === 'node')
                func(port, core);
            else
                for (var i in port) {
                    f(port[i], core, func);
                }
        }

        for (var i in core.inPorts)
            f(core.inPorts[i], core, func);
        for (var i in core.outPorts)
            f(core.outPorts[i], core, func);
    },

    //Renders all ports of node
    renderPorts(node) {
        var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
        for (var i in node.core.inPorts)
            nodeNoodle.port.render(node, node.core.inPorts[i]);

        for (var i in node.core.outPorts)
            nodeNoodle.port.render(node, node.core.outPorts[i]);

        nodeNoodle.node.forEachPort(node.core, nodeNoodle.port.renderVal);
    },

    //Makes sure that a new wire will be pulled on mousemove and connected or deleted on mouseup
    setSockEv(node) {
        $('.socket').unbind().mousedown(function (e) { //TODO: Only set this event for children of node.html
            var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);

            noodle.global.active.socketEl = e.target;
            var port = nodeNoodle.port.getObj(nodeNoodle, noodle.global.active.socketEl.parentElement);
            var portNoodle = noodle.expr.eval(noodle, port.noodleExp); //Should we use nodeNoodle rather than noodle here?

            noodle.global.active.pullWire = portNoodle.wire.new(portNoodle);
            noodle.global.active.pullWire.noodle.wire.render(noodle.global.active.pullWire);
            noodle.events.toolBox.pullWire(e); //To avoid awkward start
            noodle.events.mousemove.setActiveTool(noodle.events.toolBox.pullWire);
            $('.socket').mouseup(function (e) {
                var pullPort = noodle.port.getObj(noodle, noodle.global.active.socketEl.parentElement);
                var targetPort = noodle.port.getObj(noodle, e.target.parentElement);

                //If ports are different or allowed to short, connect them
                if (pullPort !== targetPort || pullPort.shortable) {
                    if (noodle.html.hasClass(noodle.global.active.socketEl, 'output')) { //If the wire is pulled from an output socket
                        noodle.wire.connect(pullPort, targetPort, noodle.global.active.pullWire, noodle);
                    }
                    else {
                        noodle.wire.connect(targetPort, pullPort, noodle.global.active.pullWire, noodle);
                    }
                }
                //Otherwise, remove wire
                else {
                    noodle.wire.removeEl(noodle.global.active.pullWire);
                }

                noodle.events.defMouseup();
                document.onmouseup = noodle.events.defMouseup;
                $('.socket').mouseup(null); //TODO: Same as next TODO
            });
            document.onmouseup = function () {
                noodle.wire.removeEl(noodle.global.active.pullWire);
                noodle.events.defMouseup();
                $('.socket').mouseup(null); //TODO: This doesn't look good
                document.onmouseup = noodle.events.defMouseup;
            }
        });
    }
    //}
};