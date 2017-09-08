var noodle = {
    node: {
        //Data{

        //Set to true to render nodes in parallell. Causes issues if a wire is trying to connect to unfinished node
        async: true,

        objsById: {},
        //}


        //Functions{
        setBoard: function(el){ //Never used - should it be removed?
            $.get('Html/nodeBoard.html', function(data) {
                el.innerHTML = data;
            });
        },

        //Adds new node, sets it up properly and renders it
        add: function(core, label, pos, noodle){
            var node = noodle.node.new(core, label, pos, noodle);
            node.noodle.node.render(node, nodeBoard);


            return node;
        },
        new: function(core, label, pos, noodle){
            var node = {
                label: label,
                core: $.extend(true, {}, core),
                default: core,
                pos: pos,
                type: 'node',
                noodle: noodle,
                rendered: false
            };
            
            core.parNode = core.parent = node;
            if(core.noodle == undefined)
                core.noodle = noodle;
            noodle.node.forEachPort(core, function(port, core){
               if(port.noodle == undefined)
                   port.noodle = core.noodle;
                port.parNode = core.parNode;
            });
            
            
            return node;
        },

        //Renders node in container
        render: function(node, container){
            var nodeId = node.noodle.ids.firstFree(node.noodle.ids.freeList.node);
            $.ajax({
                //ajax options{
                async: node.noodle.node.async,
                type: 'GET',
                url: 'Html/emptyNode.html',
                //}
                success: function(data) {


                    //Html text{
                    //Set color of node
                    var style = node.noodle.graphics.color.style(node.core.color);

                    node.id = 'n' + nodeId;
                    node.html = '<div class="node" id="n' + nodeId + '"' + style + '>' + data; //Not sure I like .html stuff
                    node.html += '<div class="nodeContent"></div><br><a style="background-color: rgba(255, 255, 255, 0.5)"> id: ' + node.id + '</a>';
                    //}

                    //Render node in container{
                    container.insertAdjacentHTML('beforeend', node.html);
                    node.html = document.getElementById(node.id);

                    node.noodle.ids.add(node);
                    //}

                    //Set events{
                    $(".borderSensor").unbind('mousedown').mousedown(node.noodle.graphics.transformable.borderSensorFunc); //Ineffective to set mousedown functions for all border sensors every time? Who cares? Will I fix it? Hmm...
                    //$(".btnClose").mousedown(nodeClose);
                    node.noodle.misc.html.firstByClass(node.html, "btnClose").onmousedown = node.noodle.graphics.transformable.close;
                    node.noodle.misc.html.firstByClass(node.html, "btnMaximize").onmousedown = node.noodle.graphics.transformable.maximize;

                    node.noodle.misc.html.firstByClass(node.html, "nodeTopBar").onmousedown = node.noodle.graphics.transformable.topBarFunc;

                    node.noodle.node.renderPorts(node);
                    node.noodle.node.setSockEv(node);
                    //}

                    //Add content to node{
                    var nodeEl = node.noodle.misc.html.getEl(node);
                    if(node.core.htmlContent != undefined){
                        nodeEl.getElementsByClassName('nodeContent')[0].innerHTML = node.core.htmlContent;
                    }
                    nodeEl.style.left = node.pos.x + 'px';
                    nodeEl.style.top = node.pos.y + 'px';
                    node.noodle.ids.add(node);
                    //}

                    //Run reset functions of node
                    for(var i = 0; i < node.core.resetFuncs.length; i++){
                        node.core.resetFuncs[i](node, nodeEl);
                    }

                    node.rendered = true;
                }
            });
        },

        //Cuts all wires connected to node
        disconnect: function(node){ // Seems like this function is never used
            forEachPort(node.core, cutPort);
        },

        //Gets js node from html element
        getObj: function(nodeEl, noodle){
            return noodle.node.objsById[nodeEl.id];
        },

        //Executes node and nodes connected to out ports
        execute: function(node){
            if(node.rendered){
                node.core.func(node);
                var outPorts = node.core.outPorts;
                for(var i = 0; i < outPorts.length; i++){
                    var port = outPorts[i]; //TODO: Only execute nodes of ports with new values
                    for(var j = 0; j < port.wires.length; j++){
                        var wire = port.wires[j];
                        wire.port1.value = port.value;
                        node.noodle.node.execute(wire.node1); //TODO: Don't execute same node again in case of multiple connections to same node
                    }
                    node.noodle.port.renderVal(port);
                }
            }
        },

        //Runs func with each port of core
        forEachPort: function(core, func){
            for(var i = 0; i < core.inPorts.length; i++)
                func(core.inPorts[i], core);

            for(var i = 0; i < core.outPorts.length; i++)
                func(core.outPorts[i], core);
        },

        //Renders all ports of node
        renderPorts: function(node){
            for(var i = 0; i < node.core.inPorts.length; i++)
                node.noodle.port.render(node, node.core.inPorts[i]);

            for(var i = 0; i < node.core.outPorts.length; i++)
                node.noodle.port.render(node, node.core.outPorts[i]);

            node.noodle.node.forEachPort(node.core, node.noodle.port.renderVal);
        },

        //Makes sure that a new wire will be pulled on mousemove and connected or deleted on mouseup
        setSockEv: function(node){
            $('.socket').unbind().mousedown(function(e){ //TODO: Only set this event for children of node.html
                active.socketEl = e.target;
                var port = node.noodle.port.getObj(active.socketEl.parentElement, node.noodle);
                active.pullWire = port.noodle.wire.new(port.noodle);
                active.pullWire.noodle.wire.render(active.pullWire);
                toolBox.pullWire(e); //To avoid awkward start
                mousemove.setActiveTool(toolBox.pullWire);
                $('.socket').mouseup(function(e){
                    var pullPort = noodle.port.getObj(active.socketEl.parentElement, noodle);
                    var targetPort = noodle.port.getObj(e.target.parentElement, noodle);
                    if(noodle.misc.html.hasClass(active.socketEl, 'output')){ //If the wire is pulled from an output socket
                        noodle.wire.connect(pullPort, targetPort, active.pullWire);
                    }
                    else{
                        noodle.wire.connect(targetPort, pullPort, active.pullWire);
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
        addToPorts: function(node, ports, port){
            ports.push(port);
            port.noodle.port.render(node, port);
            port.parNode = node;
            port.parent = ports;
        },

        //Renders port in node.html
        render: function(node, port){

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
            node.html.getElementsByClassName(inOrOut + 'Ports')[0].insertAdjacentHTML('beforeend', port.noodle.port.code(port, inOrOut + 'put', node));

            port.rendered = true;

            port.noodle.port.updateWires([port]);
        },

        //Sets up new wire between p0 and p1 and renders it
        connect: function(p0, p1){
            var wire = p0.noodle.wire.new(p0.noodle);
            wire.noodle.wire.connect(p0, p1, wire);
            return wire;
        },

        //Generates html code for port
        code: function(port, classes, node){
            var portId = port.noodle.ids.firstFree(port.noodle.ids.freeList.port);
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
            port.noodle.ids.add(port);

            return code;
        },

        //Renders value of port
        renderVal: function(port){
            var valEl = document.getElementById(port.valId);
            if(port.isIn){
                valEl.value = port.value;
            }
            else{
                valEl.innerHTML = port.value;
            }
        },

        //Gets js port from html element
        getObj: function(portEl, noodle){
            return noodle.port.objsById[portEl.id];
        },

        //Cuts all wires connected to port
        cut: function(port){
            port.noodle.port.forEachWire(port, function(wire){ wire.noodle.wire.cut; });
        },

        //Makes sure that nothing will try to use port (useful when removing port)
        forget: function(port){
            port.noodle.port.cut(port);
            port.noodle.ids.forget(port.noodle.ids.freeList.port, parseInt(port.id.substr(1), 10), true);
        },

        //Renders all wires of ports
        renderWires: function(ports){
            for(var i = 0; i < ports.length; i++){
                for(var j = 0; j < ports[i].wires.length; j++){
                    var wire = ports[i].wires[j];
                    wire.noodle.wire.render(wire);
                    wire.noodle.wire.update(wire);
                }
            }
        },
        updateWires: function(ports){
            for(var i = 0; i < ports.length; i++){
                for(var j = 0; j < ports[i].wires.length; j++){
                    var wire = ports[i].wires[j];
                    if(wire != null) //Should this be in more places?
                        wire.noodle.wire.update(wire);
                }
            }
        },
        forEachWire: function(port, func){
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
        new: function(noodle){
            var wire = {
                node0: null, port0: 0,
                node1: null, port1: 0,
                rendered: false,
                noodle: noodle,
                type: 'wire'
            };
            wires.push(wire);
            var wireId = noodle.ids.firstFree(noodle.ids.freeList.wire);
            wire.id = 'w' + wireId;
            noodle.ids.add(wire);

            return wire;
        },

        //Connects ports p0 and p1 with wire
        connect: function(p0, p1, wire){
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
                wire.noodle.wire.render(wire);
            }

            wire.noodle.wire.update(wire);
            if(wire.port0.rendered)
                wire.node0.noodle.node.execute(wire.node0);
        },

        //Sets up wire html and renders wire to wireBoard
        render: function(wire){
            wireBoard.insertAdjacentHTML('beforeend', '<path class="wire" id="' + wire.id + '" d="M10 10 C 20 20, 40 20, 50 10" stroke="black" stroke-width="3px" fill="transparent"/>');
            wire.html = document.getElementById(wire.id);
            wire.rendered = false;
        },

        //Updates wire element using wireBetween
        update: function(wire){
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
        wireBetween: function(p0, p1, wire){
            var r = $('.socket').width() / 2 + parseInt($('.socket').css('borderWidth'), 10); //8; //TODO: Make this work for other socket sizes
            wire.noodle.misc.html.getEl(wire).attributes.d.value = wire.noodle.graphics.svg.autoBez(p0.x + r, p0.y + r, p1.x + r, p1.y + r, wire.noodle.wire.hanLen, wire.noodle.wire.slack);

        },

        //Does its best to convince you that wire never existed
        cut: function(wire){ //Generalize so wires and nodes are removed by same function?
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

        removeEl: function(wire){
            var wireEl = document.getElementById(wire.id);
            wire.noodle.wire.objsById[wireEl.id] = undefined;
            wireEl.remove();
            wire.noodle.ids.forget(wire.noodle.ids.freeList.wire, parseInt(wire.id.substr(1), 10), true);
        },

        //Makes sure that wires know their indices in wire lists of their parent ports
        refreshPortInds: function(wires, portType){
            for(var i = 0; i < wires.length; i++){
                eval('wires[i].p' + portType + 'ind=i');
            }
        },

        //Returns js object of wire element
        getObj: function(wireEl){
            return wire.noodle.wire.objsById[wireEl.id];
        }
        //}
    },
    thread: {
        count: 0,
        queue: [],

        inc: function(noodle){
            noodle.thread.count++;
        },
        dec: function(noodle){
            noodle.thread.count--;
            $.ajax({
                //ajax options{
                async: true,
                type: 'GET',
                url: '',
                //}
                success: function(data) {
                    noodle.thread.runQueue();
                }
            });
        },
        wait: function(conditions, actions){
            for(var i in conditions){

            }
        },
        runQueue: function(){
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
    graphics: {
        svg: {
            //Returns svg code for curve between (x0, y0) and (x1, y1) based on ctrlDist and slack
            autoBez: function(x0, y0, x1, y1, ctrlDist, slack){
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
            add: function(color, transformable, pos, dims){
                var box = noodle.graphics.box.new(color, transformable, pos, dims);
                //TODO: Render
            },
            new: function(color, transformable, pos, dims){
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
            borderSensorFunc: function(){
                mousemove.setActiveTool(toolBox.scale); //Or should it just replace everything?
                active.nodeEl = noodle.misc.html.getParentNodeEl(this);

                noodle.graphics.transformable.edges.left = noodle.misc.html.hasClass(this, "bsl");
                noodle.graphics.transformable.edges.top = noodle.misc.html.hasClass(this, "bst");
                noodle.graphics.transformable.edges.right = noodle.misc.html.hasClass(this, "bsr");
                noodle.graphics.transformable.edges.bottom = noodle.misc.html.hasClass(this, "bsb");
            },

            close: function(){
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
            topBarFunc: function(e){
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
            style: function(color){
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
            var t = obj.noodle[obj.type];
            t.objsById[obj.id] = obj;
            //eval('obj.noodle.' + obj.type + '.objsById.' + obj.id + '=obj');
        },

        //Gives you a free id from ids
        firstFree: function(ids){
            if(ids.length > 1){
                return ids.pop();
            }
            var ind = ids.length - 1;
            var id = ids[ind];
            ids[ind]++;
            return id;
        },

        //Adds id to ids so it can be recycled. If safe, warns if you try to forget free id
        forget: function(ids, id, safe){
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
            addAirMenu: function(content, position){
                var cont = document.getElementById("mainCont0");
                cont.insertAdjacentHTML('beforeend', '<div class="menu airMenu" id="airMenu"></div>');
                var menuEl = document.getElementById("airMenu");
                menuEl.style.left = position.x - 8 + "px";
                menuEl.style.top = position.y - 8 + "px";
                for(var i = 0; i < content.length; i++){
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
        add: function(expr, func){

        }
    },
    misc: {
        html: {
            //Returns true if el has the class className
            hasClass: function(el, className){
                for(var i = 0; i < el.classList.length; i++){
                    if(el.classList[i] == className)
                        return true;
                }
                return false;
            },

            //Returns first child of el with class named className
            firstByClass: function(el, className){
                return el.getElementsByClassName(className)[0];
            },

            //Returns position of depth:th parent of el
            getElPos: function(el, depth){
                var pos = {x: 0, y: 0};
                for(var i = 0; i < depth; i++){
                    pos.x += el.getBoundingClientRect().left;
                    pos.y += el.getBoundingClientRect().top;
                    el = el.parentElement;
                }
                return pos;
            },

            //Returns html element e such that e.id == obj.id
            getEl: function(obj){
                if(obj.html == null)
                    obj.html = document.getElementById(obj.id);
                return obj.html;
            },

            //Returns closest parent node element
            getParentNodeEl: function(el){
                while(!noodle.misc.html.hasClass(el = el.parentElement, 'node'));
                return el;
            }
        },
        strings: {
            //Removes amount chars at end of str
            trimEnd: function(str, amount){
                return str.substr(0, str.length - amount);
            }
        },
        arrays: {
            //Returns object obj where obj[list[i].name] = list[i] for every int i (No, I didn't forget i < list.length)
            listToObj: function(list){
                var obj = {};
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
            getFile: function(path){
                var fileData;
                $.ajax({
                    async: false,
                    type: 'GET',
                    url: path,
                    success: function(data) {
                        fileData = data;
                    }
                });
                return fileData;
            }
        }
    }
}