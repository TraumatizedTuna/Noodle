var noodle = {
    node: {
        //Data{

        //Set to true to render nodes in parallell. Causes issues if a wire is trying to connect to unfinished node
        async: false,

        objsById: {},
        //}


        //Functions{
        setBoard(el){ //Never used - should it be removed?
            $.get('Html/nodeBoard.html', function(data) {
                el.innerHTML = data;
            });
        },

        //Adds new node, sets it up properly and renders it
        add(noodle, core, label, pos, noodleExp){
            var node = noodle.node.new(noodle, core, label, pos, noodleExp);
            var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
            nodeNoodle.node.render(node, nodeBoard);

            return node;
        },
        new(noodle, coreExp, label = '', pos = {x: 0, y: 0}, noodleExp = noodle.expr.fromObj(noodle, noodle)){
            //Properties{
            var node = {
                type: 'node',
                label: label,
                core: noodle.expr.eval(noodle, coreExp),
                defaultExp: coreExp,
                pos: pos,
                noodleExp: noodleExp,
                useNoodle: false,
                rendered: false
            };

            //}

            //Ports{
            noodle.node.forEachPort(
                node.core,
                function(port, core){
                    port.noodleExp.args[1] = port;
                }
            )

            node.core.inPorts = noodle.expr.evalAll(noodle, node.core.inPorts);
            node.core.outPorts = noodle.expr.evalAll(noodle, node.core.outPorts);
            //}

            noodle.misc.obj.deepStandardize(noodle, node, node);

            return node;
        },

        newExpr(noodle, name, func, inPortExps = [], outPortExps = [], data, resetFuncs, color, htmlContent){
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
        render(node, container){ //TODO: Noodle
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
                success(d){
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
            if(node.core.htmlContent != undefined){
                nodeEl.getElementsByClassName('nodeContent')[0].innerHTML = node.core.htmlContent;
            }
            nodeEl.style.left = node.pos.x + 'px';
            nodeEl.style.top = node.pos.y + 'px';
            nodeNoodle.ids.add(node);
            //}

            //Run reset functions of node
            for(var i = 0; i < node.core.resetFuncs.length; i++){
                node.core.resetFuncs[i](node, nodeEl);
            }

            node.rendered = true;
            //}
            //});
        },

        //Cuts all wires connected to node
        disconnect(node){ // Seems like this function is never used
            forEachPort(node.core, cutPort);
        },

        //Gets js node from html element
        getObj(nodeEl, noodle){ //Switch arg order
            return noodle.node.objsById[nodeEl.id];
        },

        //Executes node and nodes connected to out ports
        execute(node){
            if(node.rendered){
                var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
                node.core.func(node);
                var outPorts = node.core.outPorts;
                for(var i = 0; i < outPorts.length; i++){
                    var port = outPorts[i]; //TODO: Only execute nodes of ports with new values
                    for(var j = 0; j < port.wires.length; j++){
                        var wire = port.wires[j];
                        wire.port1.value = port.value;
                        nodeNoodle.node.execute(wire.node1); //TODO: Don't execute same node again in case of multiple connections to same node
                    }
                    nodeNoodle.port.renderVal(port);
                }
            }
        },

        //Runs func with each port of core
        forEachPort(core, func){
            for(var i = 0; i < core.inPorts.length; i++)
                func(core.inPorts[i], core);

            for(var i = 0; i < core.outPorts.length; i++)
                func(core.outPorts[i], core);
        },

        //Renders all ports of node
        renderPorts(node){
            var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
            for(var i = 0; i < node.core.inPorts.length; i++)
                nodeNoodle.port.render(node, node.core.inPorts[i]);

            for(var i = 0; i < node.core.outPorts.length; i++)
                nodeNoodle.port.render(node, node.core.outPorts[i]);

            nodeNoodle.node.forEachPort(node.core, nodeNoodle.port.renderVal);
        },

        //Makes sure that a new wire will be pulled on mousemove and connected or deleted on mouseup
        setSockEv(node){
            $('.socket').unbind().mousedown(function(e){ //TODO: Only set this event for children of node.html
                var nodeNoodle = noodle.expr.eval(noodle, node.noodleExp);
                
                active.socketEl = e.target;
                var port = nodeNoodle.port.getObj(active.socketEl.parentElement, nodeNoodle);
                var portNoodle = noodle.expr.eval(noodle, port.noodleExp); //Should we use nodeNoodle rather than noodle here?

                active.pullWire = portNoodle.wire.new(portNoodle);
                active.pullWire.noodle.wire.render(active.pullWire);
                toolBox.pullWire(e); //To avoid awkward start
                mousemove.setActiveTool(toolBox.pullWire);
                $('.socket').mouseup(function(e){
                    var pullPort = noodle.port.getObj(active.socketEl.parentElement, noodle);
                    var targetPort = noodle.port.getObj(e.target.parentElement, noodle);
                    if(noodle.misc.html.hasClass(active.socketEl, 'output')){ //If the wire is pulled from an output socket
                        noodle.wire.connect(pullPort, targetPort, active.pullWire, noodle);
                    }
                    else{
                        noodle.wire.connect(targetPort, pullPort, active.pullWire, noodle);
                    }

                    defMouseup();
                    document.onmouseup = defMouseup;
                    $('.socket').mouseup(null); //TODO: Same as next TODO
                });
                document.onmouseup = function(){
                    noodle.wire.removeEl(active.pullWire);
                    defMouseup();
                    $('.socket').mouseup(null); //TODO: This doesn't look good
                    document.onmouseup = defMouseup;
                }
            });
        }
        //}
    },
    port: {
        //Data{
        objsById: {},
        //}

        //Functions{
        new(noodle, name, portType, isIn, wires = [], value = null, noodleExp){

            var port = {type: 'port', name: name, portType: portType, isIn: isIn, wires: [], value: value};

            noodleExp = noodleExp || noodle.expr.defaultNoodle(noodle, port);

            port.noodleExp = noodleExp;
            return port;
        },
        //Returnes expression to generate port
        newExpr(noodle, name, type, isIn){
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
        addToPorts(node, ports, port){
            port.noodleExp = port.noodleExp || node.noodleExp;
            var portNoodle = noodle.expr.eval(noodle, port.noodleExp);

            ports.push(port);
            portNoodle.port.render(node, port);
            port.parNode = node;
            port.parent = ports;
        },

        //Renders port in node.html
        render(node, port){
            var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
            //String inOrOut indicates whether port is in or out{
            var inOrOut;
            if(port.isIn){
                inOrOut = 'in';
            }
            else{
                inOrOut = 'out';
            }
            //}

            //Add port to node element
            node.html.getElementsByClassName(inOrOut + 'Ports')[0].insertAdjacentHTML('beforeend', portNoodle.port.code(port, inOrOut + 'put', node));

            port.rendered = true;

            portNoodle.port.updateWires([port]);
        },

        //Sets up new wire between p0 and p1 and renders it
        connect(port0, port1){
            var port0Noodle = noodle.expr.eval(noodle, port0.noodleExp);
            var wire = port0Noodle.wire.new(port0Noodle); //What?!
            var wireNoodle = noodle.expr.eval(noodle, wire.noodleExp);

            wireNoodle.wire.connect(port0, port1, wire, noodle);
            return wire;
        },

        //Generates html code for port
        code(port, classes, node){
            var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
            var portId = portNoodle.ids.firstFree(portNoodle.ids.freeList.port);
            var code = '<div class="port ' + classes + '" id="p' + portId + '"><div class="socket num ' + classes + '" id="s' + portId + '"></div> <a class="hoverSelect">' + port.name + '</a>';

            //Add value element and finish port code{
            if(port.isIn){
                code += '<input type="number" id="val' + portId + '"><br></div><br>';
            }
            else{
                code += '<a class="hoverSelect" id="val' + portId + '"><br></div><br>';
            }
            port.valId = 'val' + portId;
            //}

            port.id = 'p' + portId;
            portNoodle.ids.add(port);

            return code;
        },

        //Renders value of port
        renderVal(port){
            var valEl = document.getElementById(port.valId);
            if(port.isIn){
                valEl.value = port.value;
            }
            else{
                valEl.innerHTML = port.value;
            }
        },

        //Gets js port from html element
        getObj(portEl, noodle){
            return noodle.port.objsById[portEl.id];
        },

        //Cuts all wires connected to port
        cut(port){
            var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
            portNoodle.port.forEachWire(port, function(wire){ wire.noodle.wire.cut; });
        },

        //Makes sure that nothing will try to use port (useful when removing port)
        forget(port){
            var portNoodle = noodle.expr.eval(noodle, port.noodleExp);
            portNoodle.port.cut(port);
            portNoodle.ids.forget(portNoodle.ids.freeList.port, parseInt(port.id.substr(1), 10), true);
        },

        //Renders all wires of ports
        renderWires(ports){
            for(var i = 0; i < ports.length; i++){
                for(var j = 0; j < ports[i].wires.length; j++){
                    var wire = ports[i].wires[j];
                    wire.noodle.wire.render(wire);
                    wire.noodle.wire.update(wire);
                }
            }
        },
        updateWires(ports){
            for(var i = 0; i < ports.length; i++){
                for(var j = 0; j < ports[i].wires.length; j++){
                    var wire = ports[i].wires[j];
                    if(wire != null) //Should this be in more places?
                        wire.noodle.wire.update(wire);
                }
            }
        },
        forEachWire(port, func){
            for(var i = 0; i < port.wires.length; i++)
                func(port.wires[i]);
        }
        //}
    },
    wire: {
        //Data{

        //Length of handles on wire svg elements
        hanLen: .5,

        //Slack of wire svg elements
        slack: 5,

        objsById: {},
        //}

        //Functions{

        //Returns a new, unconnected wire object
        new(noodle){
            var wire = {
                type: 'wire',
                node0: null, port0: 0,
                node1: null, port1: 0,
                rendered: false,
                noodle: noodle,
            };
            wire.noodleExp = noodle.expr.defaultNoodle(noodle, wire)
            //noodle.misc.obj.deepStandardize(noodle, wire); //This line shouldn't do any difference but I guess I should check why it crashes
            wires.push(wire);
            var wireId = noodle.ids.firstFree(noodle.ids.freeList.wire);
            wire.id = 'w' + wireId;
            noodle.ids.add(wire);

            return wire;
        },

        //Connects ports p0 and p1 with wire
        connect(p0, p1, wire, noodle){
            var wireNoodle = noodle.getNoodle(noodle, wire);
            //Set up objects so ports contain wire{
            //Set indices of wire in the ports
            wire.p0Ind = p0.wires.length;
            wire.p1Ind = p1.wires.length;

            //Add wire to wire lists of the two ports
            p0.wires.push(wire);
            p1.wires.push(wire);

            wire.port0 = p0;
            wire.port1 = p1;

            wire.node0 = p0.parNode;
            wire.node1 = p1.parNode;
            //}

            if(!wire.rendered){
                wireNoodle.wire.render(wire);
            }

            wireNoodle.wire.update(wire);
            if(wire.port0.rendered)
                noodle.getNoodle(noodle, wire.node0).node.execute(wire.node0);
        },

        //Sets up wire html and renders wire to wireBoard
        render(wire){
            wireBoard.insertAdjacentHTML('beforeend', '<path class="wire" id="' + wire.id + '" d="M10 10 C 20 20, 40 20, 50 10" stroke="black" stroke-width="3px" fill="transparent"/>');
            wire.html = document.getElementById(wire.id);
            wire.rendered = false;
        },

        //Updates wire element using wireBetween
        update(wire, noodle){
            var outPort = wire.port0;
            var inPort = wire.port1;

            if(!wire.rendered)
                wire.noodle.wire.render(wire);
            if(outPort.rendered && inPort.rendered){
                wire.html.style = 'visibility: visible;'; //In case wire is hidden

                var outPos = wire.noodle.misc.html.getElPos(document.getElementById(outPort.id).getElementsByClassName("socket")[0], 1);

                var inPos = wire.noodle.misc.html.getElPos(document.getElementById(inPort.id).getElementsByClassName("socket")[0], 1);

                wire.noodle.wire.wireBetween(outPos, inPos, wire);
            }
            else
                wire.html.style = 'visibility: hidden;'
                },

        //Updates wire svg curve so it goes between positions p0 and p1
        wireBetween(p0, p1, wire){
            var r = $('.socket').width() / 2 + parseInt($('.socket').css('borderWidth'), 10); //8; //TODO: Make this work for other socket sizes
            wire.noodle.misc.html.getEl(wire).attributes.d.value = wire.noodle.graphics.svg.autoBez(p0.x + r, p0.y + r, p1.x + r, p1.y + r, wire.noodle.wire.hanLen, wire.noodle.wire.slack);

        },

        //Does its best to convince you that wire never existed
        cut(wire){ //Generalize so wires and nodes are removed by same function?
            if(wire != undefined){
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

        removeEl(wire){
            var wireEl = document.getElementById(wire.id);
            wire.noodle.wire.objsById[wireEl.id] = undefined;
            wireEl.remove();
            wire.noodle.ids.forget(wire.noodle.ids.freeList.wire, parseInt(wire.id.substr(1), 10), true);
        },

        //Makes sure that wires know their indices in wire lists of their parent ports
        refreshPortInds(wires, portType){
            for(var i = 0; i < wires.length; i++){
                eval('wires[i].p' + portType + 'ind=i');
            }
        },

        //Returns js object of wire element
        getObj(wireEl, noodle){
            return noodle.wire.objsById[wireEl.id];
        }
        //}
    },

    expr: {
        //Evaluation states{
        alwaysReady: 0,
        ready: 1,
        done: 2,
        wait: 3,
        //}

        //Functions{

        //Creates a new expression
        new(noodle, func, args = [], ans, noodleExp, state = noodle.expr.ready){ //TODO: Should state be done if ans isn't undefined/null?
            return {
                noodleExp: noodleExp,
                type: 'expr',
                func: func,
                args: args,
                ans: ans,
                state: state
            };
        },
        //Returns expression with obj as answer
        fromObj(noodle, obj, noodleExp = noodle.expr.defaultNoodle(noodle, obj)){
            return noodle.expr.new(
                noodle, //noodle
                function(noodle, obj){ //func
                    return obj;
                },
                [],
                obj, //ans
                noodleExp, //noodleExp
                noodle.expr.done //state
            );
        },
        allFromObj(noodle, objs, noodleExp){
            for(var i in objs){
                objs[i] = noodle.expr.fromObj(noodle, objs[i], noodleExp);
            }
            return objs;
        },
        ref(noodle, exp, noodleExp){
            noodle.expr.new(noodle, function(val){return val;}, [exp], undefined, noodleExp);
        },
        defaultNoodle(noodle, obj){
            var innerNoodleExp = noodle.expr.new(noodle, function(noodle){ return noodle; }, [noodle], noodle, null, noodle.expr.done) //Can't use fromObj
            innerNoodleExp.noodleExp = innerNoodleExp; //TODO: Let outer noodleExp use itself? Needs parent
            return noodle.expr.new(
                noodle,
                function(noodle, obj){
                    if(obj.parent)
                        return noodle.expr.eval(noodle, obj.parent.noodleExp) || noodle; 
                    return noodle;//Should this be considered bad?
                },
                noodle.expr.allFromObj(noodle, [noodle, obj], innerNoodleExp),
                null,
                innerNoodleExp,
                noodle.expr.alwaysReady
            );
        },

        eval(noodle, exp){
            if(exp.state <= noodle.expr.ready){
                var args = exp.args.concat(Array.from(arguments).slice(2, arguments.length)); //TODO: Move this to evalAll?
                exp.state = noodle.expr.wait;
                exp.ans = exp.func.apply(undefined, noodle.expr.evalAll(noodle, args));
                exp.state = noodle.expr.done;
            }
            return exp.ans;
        },
        evalAll(noodle, exps){
            var ansList = new exps.constructor;
            for (var i in exps) {
                //if (i != 'parent' && i != 'parNode') {
                ansList[i] = noodle.expr.eval(noodle, exps[i]);
                //}
            }
            return ansList;
        }
        //}
    },

    thread: {
        count: 0,
        queue: [],

        inc(noodle){
            noodle.thread.count++;
        },
        dec(noodle){
            noodle.thread.count--;
            $.ajax({
                //ajax options{
                async: true,
                type: 'GET',
                url: '',
                //}
                success(data) {
                    noodle.thread.runQueue();
                }
            });
        },
        wait(conditions, actions){
            for(var i in conditions){

            }
        },
        runQueue(){
            var queue = noodle.thread.queue;
            for(var i in queue){
                //If condition evaluates to true, perform action
                if(expr.eval($.extend(true, {}, queue[i].cond))){
                    expr.eval(queue[i].action);
                    if(!queue.stayInQueue){
                        //Remove from queue
                    }
                }
            }
        }
    },
    functions: {
        getArg(noodle, arg){
            return arg;
        }
    },
    graphics: {
        svg: {
            //Returns svg code for curve between (x0, y0) and (x1, y1) based on ctrlDist and slack
            autoBez(x0, y0, x1, y1, ctrlDist, slack){
                //Calculate delta values{
                var dx = (x1 - x0) * ctrlDist;
                var dy = Math.abs(y1 - y0);
                var dxMin = 128;
                if(dxMin > dy)
                    dxMin = dy;
                if(dx < dxMin)
                    dx = dxMin;
                //if(dx > dy)
                //    dx = dy;
                //}

                slack *= Math.pow(dx, 0.5) / Math.pow(dy + 100, .5) * 10;

                //Return svg string representing curve
                return 'M' + x0 + ' ' + y0 + ' C ' + (x0 + dx) + ' ' + (y0 + slack) + ', ' + (x1 - dx) + ' ' + (y1 + slack) + ', ' + x1 + ' ' + y1;
            }
        },
        box: {
            add(color, transformable, pos, dims){
                var box = noodle.graphics.box.new(color, transformable, pos, dims);
                //TODO: Render
            },
            new(color, transformable, pos, dims){
                //var box =
                var style = noodle.graphics.color.style(color);

            }
        },
        transformable: {
            //Data{
            scale: false,
            offsetX: 0,
            offsetY: 0,
            edges: { left: false, top: false, right: false, bottom: false },
            //}

            //Functions{
            borderSensorFunc(){
                mousemove.setActiveTool(toolBox.scale); //Or should it just replace everything?
                active.nodeEl = noodle.misc.html.getParentNodeEl(this);

                noodle.graphics.transformable.edges.left = noodle.misc.html.hasClass(this, "bsl");
                noodle.graphics.transformable.edges.top = noodle.misc.html.hasClass(this, "bst");
                noodle.graphics.transformable.edges.right = noodle.misc.html.hasClass(this, "bsr");
                noodle.graphics.transformable.edges.bottom = noodle.misc.html.hasClass(this, "bsb");
            },

            close(){
                //TODO: Remove js object
                var nodeEl = noodle.misc.html.getParentNodeEl(this);
                //disconnectNode(noodle.node.getObj(nodeEl));

                var node = noodle.node.getObj(nodeEl);
                noodle.node.forEachPort(node.core, noodle.port.forget);
                noodle.ids.forget(noodle.ids.freeList.node, parseInt(node.id.substr(1), 10), true);
                forest.splice(forest.indexOf(node), 1);

                nodeEl.remove();

                console.info('nodeClose() - id: ' + node.id + ', name: ' + node.core.name);
            },
            topBarFunc(e){
                active.nodeEl = this.parentElement.parentElement;
                mousemove.setActiveTool(toolBox.move);
                var left = active.nodeEl.style.left;
                left = left.substring(0, left.length - 2);
                var top = active.nodeEl.style.top;
                top = top.substring(0, top.length - 2);
                noodle.graphics.transformable.offsetX = left - e.pageX; //Might cause problems with automatic positioning?
                noodle.graphics.transformable.offsetY = top - e.pageY;
            },
            maximize: null
            //}
        },
        color: {
            style(color){
                var style= "";
                if(color != "default"){
                    style = ' style = "background-color: ';
                    if(color == "random"){
                        style += "hsl(" + Math.random()*255 + "," + Math.random()*80+20 + "%," + Math.sqrt(Math.random())*90+10 + '%)"';
                    }
                    else style += color + '"';
                }
                return style;
            }
        }
    },
    ids: {
        //Lists describing free ids
        freeList: {
            node: [0],
            port:[0],
            wire: [0]
        },

        add(obj){
            var objNoodle = noodle.expr.eval(noodle, obj.noodleExp);
            objNoodle[obj.type].objsById[obj.id] = obj;
        },

        //Gives you a free id from ids
        firstFree(ids){
            if(ids.length > 1){
                return ids.pop();
            }
            var ind = ids.length - 1;
            var id = ids[ind];
            ids[ind]++;
            return id;
        },

        //Adds id to ids so it can be recycled. If safe, warns if you try to forget free id
        forget(ids, id, safe){
            if(safe){
                for(var i = 0; i < ids.length; i++){
                    if(ids[i] == id){
                        console.warn("noodle.ids.forget() was called with " + id + ", which was already free. Something weird is going on.");
                        return;
                    }
                }
            }

            if(id == ids[0] - 1)
                ids[0]--;
            else{
                ids.push(id);
            }
        }
    },
    ui: {
        menus: {
            addAirMenu(content, position){
                var cont = document.getElementById("mainCont0");
                cont.insertAdjacentHTML('beforeend', '<div class="menu airMenu" id="airMenu"></div>');
                var menuEl = document.getElementById("airMenu");
                menuEl.style.left = position.x - 8 + "px";
                menuEl.style.top = position.y - 8 + "px";
                for(var i  in content){
                    menuEl.insertAdjacentHTML('beforeend', '<div class="menuRow" id="mr' + i + '">' + content[i].label + '</div>');
                    var rowEl = document.getElementById('mr' + i);
                    rowEl.onmousedown = content[i].func;
                }

                active.menuEl = menuEl;
                $('#airMenu').mouseleave(function(e){
                    active.menuEl.remove();
                    active.menuEl = null;
                });
            }
        }
    },
    hotKeys: {
        add(expr, func){

        },
        keydown(key){

        },
        and(expr0, expr1){

        },
        or(expr0, expr1){

        }
    },
    misc: {
        html: {
            //Returns true if el has the class className
            hasClass(el, className){
                for(var i = 0; i < el.classList.length; i++){
                    if(el.classList[i] == className)
                        return true;
                }
                return false;
            },

            //Returns first child of el with class named className
            firstByClass(el, className){
                return el.getElementsByClassName(className)[0];
            },

            //Returns position of depth:th parent of el
            getElPos(el, depth){
                var pos = {x: 0, y: 0};
                for(var i = 0; i < depth; i++){
                    pos.x += el.getBoundingClientRect().left;
                    pos.y += el.getBoundingClientRect().top;
                    el = el.parentElement;
                }
                return pos;
            },

            //Returns html element e such that e.id == obj.id
            getEl(obj){
                if(obj.html == null)
                    obj.html = document.getElementById(obj.id);
                return obj.html;
            },

            //Returns closest parent node element
            getParentNodeEl(el){
                while(!noodle.misc.html.hasClass(el = el.parentElement, 'node'));
                return el;
            }
        },
        obj: {

            newSameType(noodle, obj) {
                if (obj == null) {
                    return null;
                }
                return new obj.constructor;
            },

            equals(noodle, obj0, obj1, depth) {
                if (depth <= 0)
                    return true;
                if (typeof obj0 != 'object' || typeof obj1 != 'object' || obj0 == null || obj1 == null){
                    var eq = obj0 == obj1;
                    return eq;
                }
                if(Object.getOwnPropertyNames(obj0).length != Object.getOwnPropertyNames(obj1).length)
                    return false;

                depth --;
                for (var i in obj0){
                    var eq = (noodle.misc.obj.equals(noodle, obj0[i], obj1[i], depth)); //TODO: Figure out why the following if can't evaluate this stuff itself
                    if (!eq)
                        return false;
                }
                return true;

            },

            standardize(noodle, obj, parNode){ //TODO: Dynamically figure out parent node
                if(obj != null && obj != undefined){
                    //Set parNode of obj{
                    if (parNode == undefined || parNode.type != 'node'){
                        parNode = obj;
                        while(parNode.parent != undefined && parNode.type != 'node'){
                            parNode = parNode.parent;
                        }
                    }
                    if (parNode.type != 'node')
                        parNode = undefined;
                    obj.parNode = parNode;
                    //}
                    
                    //Set type of obj
                    if (obj.type == undefined && typeof obj == 'object'){
                        obj.type = 'obj';
                    }
                    
                    //Set parent of properties
                    for (var i in obj) {
                        if(typeof obj[i] == 'object' && obj[i] != null && obj[i] != undefined && i != 'parent' && i != 'parNode') {
                            obj[i].parent = obj;
                            //obj[i].parNode = parNode;
                        }
                    }
                    
                    //Set noodleExp of obj
                    obj.noodleExp = obj.noodleExp || noodle.expr.defaultNoodle(noodle, obj);
                }
            },

            deepStandardize(noodle, obj, parNode, clone = {}){
                noodle.misc.obj.clonePlus(
                    noodle,
                    obj,
                    clone,
                    [],
                    [],
                    function(noodle, obj, clone, flatList, flatClone, parNode){
                        noodle.misc.obj.standardize(noodle, obj, parNode);
                    }, //func
                    function(noodle, obj){
                        if(obj != undefined && obj != null)
                            return obj.type != 'expr';
                        return false;
                    }, //cond
                    parNode
                );
            },

            //TODO: Generalize flatList and clone to one function that take a function as an argument?

            //Digs up all descendants of obj and adds them as elements in flatList
            flatList(noodle, obj, flatList = []) {
                if (typeof obj == 'object') {
                    for (var i in obj) {
                        if (flatList.indexOf(obj[i]) == -1) { //If obj[i] hasn't already been found
                            flatList.push(obj[i]);
                            //flatList = flatList.concat(
                            noodle.misc.obj.flatList(noodle, obj[i], flatList);
                        }
                    }
                    return flatList;
                }
                return [obj]; //In case obj is a primitive type
            },

            //Turns clone into a deep clone of obj. flatList and flatClone are optional but should have same length, preferably 0
            clone(noodle, obj, clone, flatList = [], flatClone = []) {
                //flatClone.push(clone);
                if (obj == null || obj == undefined)
                    return obj;

                if (typeof obj == 'object') {
                    //If clone is undefined, make it an empty array or object
                    if (clone == undefined){
                        if(obj.constructor == Array){
                            clone = [];
                        }
                        else{
                            clone = {};
                        }
                    }
                    flatList.push(obj);
                    flatClone.push(clone);
                    //Go through obj to clone all its properties
                    for (var i in obj) { 
                        var flatInd = flatList.indexOf(obj[i]);
                        //If we've found a new object, add it to flatList and clone it to clone and flatClone
                        if (flatInd == -1) {
                            //clone[i] = clone[i] || {};
                            clone[i] = noodle.misc.obj.clone(noodle, obj[i], clone[i], flatList, flatClone); //This works because flatList gets updated
                        }
                        //If we've seen obj[i] before, add the clone of it to clone
                        else {
                            clone[i] = flatClone[flatInd];
                        }
                    }
                    return clone;
                }
                return obj;
            },

            //Same as clone but applies all arguments except func and cond to func and cond. Stops recursion if cond returns false
            clonePlus(noodle, obj, clone, flatList = [], flatClone = [], func = function(){}, cond = function(){return true}) {
                var args = Array.from(arguments);
                args.splice(5, 2);
                if(!cond.apply(undefined, args)){
                    return obj;
                }
                func.apply(undefined, args);

                //flatClone.push(clone);
                if (obj == null || obj == undefined)
                    return obj;

                if (typeof obj == 'object') {
                    //If clone is undefined, make it an empty array or object
                    if (clone == undefined){
                        if(obj.constructor == Array){
                            clone = [];
                        }
                        else{
                            clone = {};
                        }
                    }
                    flatList.push(obj);
                    flatClone.push(clone);
                    //Go through obj to clone all its properties
                    for (var i in obj) { 
                        var flatInd = flatList.indexOf(obj[i]);
                        //If we've found a new object, add it to flatList and clone it to clone and flatClone
                        if (flatInd == -1) {
                            //clone[i] = clone[i] || {};
                            [...args] = arguments;
                            args[1] = obj[i];
                            args[2] = clone[i];
                            clone[i] = noodle.misc.obj.clonePlus.apply(undefined, args); //This works because flatList gets updated
                        }
                        //If we've seen obj[i] before, add the clone of it to clone
                        else {
                            clone[i] = flatClone[flatInd];
                        }
                    }
                    return clone;
                }
                return obj;
            },

            //Don't think this guy works but you could get a flat clone frome the ordinary clone function   
            flatClone(noodle, flatList = noodle.misc.obj.flatList(obj), newList = new Array(flatList.length)) { //Kinda stupid to check lists for each recursion?
                for (var i in flatList) {
                    var obj = flatList[i];
                    if (typeof obj == 'object') {
                        //Go through obj to find its properties in flatList and clone them to newList
                        for (var j in obj) {
                            var ind = flatList.indexOf(obj[i]);//Find obj[i] in flatList
                            if (ind != -1) {
                                if (newList[i] == undefined) {//If this object hasn't been found before
                                    newList[i] = shallowClone(); //TODO
                                }
                            }
                        }
                    }
                    return $.extend(null, obj);
                }
            }
        },
        string: {
            //Removes amount chars at end of str
            trimEnd(str, amount){
                return str.substr(0, str.length - amount);
            }
        },
        arrays: {
            //Returns object obj where obj[list[i].name] = list[i] for every int i (No, I didn't forget i < list.length)
            listToObj(list, obj = {}){
                for(var i = 0; i < list.length; i++){
                    var el = list[i];
                    //eval('obj.' + el.name + '=el;'); //TODO: If there's no name, give it a number
                    obj[el.name] = el;
                }
                return obj;
            }
        },
        files: {
            //Uses ajax to give you the desired file
            getFile(path){
                var fileData;
                $.ajax({
                    async: false,
                    type: 'GET',
                    url: path,
                    success(data) {
                        fileData = data;
                    }
                });
                return fileData;
            }
        }
    },

    //Finds nearest ancestor with useNoodle on and returns its noodle. If none is found, return noodle
    getNoodle(noodle, obj){
        return noodle.expr.eval(noodle, obj.noodleExp);
    }
}