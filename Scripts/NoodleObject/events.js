noodle.events = {
    toolBox: {
        scale(e) {
            //TODO: move those two lines to the mousedown event if possible
            var nodeRect = noodle.global.active.nodeEl.getBoundingClientRect();
            var parRect = noodle.global.active.nodeEl.parentElement.getBoundingClientRect();

            //TODO: Kinda stupid to check this on every mousemove event
            if (noodle.graphics.transformable.edges.right) {
                var width = e.pageX - nodeRect.left;
                //var width = 100 * (e.pageX - nodeRect.left) / parRect.width;
                noodle.global.active.nodeEl.style.width = width + 'px';
            }
            else if (noodle.graphics.transformable.edges.left) {
                //var width = 100 * (nodeRect.width + nodeRect.left - e.pageX) / parRect.width;

                //TODO: Well...
                var oldWidth = noodle.global.active.nodeEl.style.width;
                oldWidth = oldWidth.substr(0, oldWidth.length - 1);
                oldWidth *= 1;
                if (oldWidth === 0) {
                    oldWidth = 25;
                }

                var width = oldWidth - (e.pageX - 1 * noodle.string.trimEnd(noodle.global.active.nodeEl.style.left, 2)) / parRect.width;
                //var width = oldWidth - 100 * (e.pageX - 1 * noodle.string.trimEnd(noodle.global.active.nodeEl.style.left, 2)) / parRect.width;

                noodle.global.active.nodeEl.style.width = width + 'px';
                noodle.global.active.nodeEl.style.left = e.pageX + 'px';
            }

            if (noodle.graphics.transformable.edges.bottom) {
                var height = e.pageY - nodeRect.top;
                //var height = 100 * (e.pageY - nodeRect.top) / parRect.width;
                noodle.global.active.nodeEl.style.height = height + 'px';//'vw';
            }
            noodle.port.updateWires(noodle.global.active.nodeEl.obj.core.inPorts);
            noodle.port.updateWires(noodle.global.active.nodeEl.obj.core.outPorts);
        },
        move(e) {
            var startPos = noodle.graphics.transformable.startPos;
            for (var nodeEl of noodle.global.selected.nodeEls) {
                var node = nodeEl.obj;
                node.pos.x = node.startPos.x + e.pageX - startPos.x;
                node.pos.y = node.startPos.y + e.pageY - startPos.y;
                nodeEl.style.left = node.pos.x + 'px';
                nodeEl.style.top = node.pos.y + 'px';

                //TODO: Update wires
                noodle.port.updateWires(node.core.inPorts);
                noodle.port.updateWires(node.core.outPorts);
            }
        },
        pullWire(e) {
            var sockEl = noodle.global.active.socketEl;

            var p0 = { x: e.pageX, y: e.pageY };
            var p1 = noodle.html.getElPos(sockEl, 1);

            if (!noodle.html.hasClass(sockEl, "input")) {
                [p0, p1] = [p1, p0];
            }

            noodle.wire.wireBetween(p0, p1, noodle.global.active.pullWire);
        }
    },

    mousemove: {
        setActiveTool(tool) {
            noodle.global.active.mousemoveTool = tool;
        }
    },

    keydown: {
        setActiveTool(tool) {
            noodle.global.active.keydownTool = tool;
        }
    },


    defMouseup() {
        noodle.events.mousemove.setActiveTool(null); //Do we really always want to clear it on mouse up? Maybe add another list that's not cleared
    },

    defKeyup: null,

    renderCount: 0
};
document.onmousemove = function (e) {
    /*for(var i = 0; i < selected.misc.length; i++){
        selected.tools[i](e);
    }*/
    noodle.global.mousePos = { x: e.pageX, y: e.pageY };
    if (noodle.global.active.mousemoveTool != null)
        noodle.global.active.mousemoveTool(e);
};
document.onmouseup = noodle.events.defMouseup;

window.onload = function (e) {
    var a = 3;
    document.onkeydown = function (e) {
        if (e.ctrlKey) {
            //setActiveTool(toolBox.cut)
            //mainCont
            document.getElementsByTagName("body")[0].style.cursor = "crosshair";

            $('.wire').unbind().mouseover(function (e) {
                if (e.which === 1)
                    noodle.wire.cut(e.target.obj);
            });

            window.onkeyup = function (e) {
                console.log("Stop cut");
                //mainCont
                document.getElementsByTagName("body")[0].style.cursor = "auto";
                $('.wire').unbind();
                window.onkeyup = noodle.events.defKeyup;
            };
        }

        if (e.shiftKey && e.keyCode === 65) { //Shift + A
            var newNodeMenuContent = [];
            //TODO: Kinda stupid to convert back and forth between obj and html?
            var contEl = noodle.global.active.container.html;
            /*if (!contEl.classList.contains('container')) {
                contEl = contEl.getElementsByClassName('container')[0];
            }*/
            if (contEl) {
                var container = contEl.obj;
                var mousePos = noodle.global.mousePos;
                var contPos = noodle.html.getElPos(contEl, 1);
                var pos = {
                    x: mousePos.x - contPos.x,
                    y: mousePos.y - contPos.y
                };
                for (var i in nodeTypes) {
                    var nodeType = nodeTypes[i];
                    newNodeMenuContent.push({
                        label: i,
                        //TODO: Use the right container
                        func: eval('var f = function(){\nvar nodeType = nodeTypes["' + i + '"];\nnoodle.node.add(noodle, container, nodeType, undefined, noodle.global.mousePos);\n}; f;'), //TODO: This feels like a really dirty way to generate a function
                        expr: noodle.expr.new(
                            noodle,
                            noodle.node.add,
                            noodle.expr.allFromObj(noodle, [noodle, container, nodeTypes[i], '', pos]),
                            null,
                            noodle.expr.fromObj(noodle),
                            noodle.expr.alwaysReady
                        )
                    });
                }
                noodle.ui.menus.addAirMenu(contEl, newNodeMenuContent, pos); //Or should it be active container?
            }
        }

        switch (e.keyCode) {
            case 46: //Delete
            case 88: //X
                noodle.graphics.transformable.close();
        }
    };

    $(document).on('click', '.container', function (e) {
        noodle.global.active.container = e.target.obj;
    });


    $('.container').click(function (e) {
        var a = 3;
    });

    document.getElementsByClassName('container')[0].onclick = function (e) {
        var contEl = e.target;
        contEl.focus();
    };
};