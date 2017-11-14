noodle.events = {
    toolBox: {
        scale(e) {
            //TODO: move those two lines to the mousedown event if possible
            var nodeRect = noodle.global.active.nodeEl.getBoundingClientRect();
            var parRect = noodle.global.active.nodeEl.parentElement.getBoundingClientRect();

            //TODO: Kinda stupid to check this on every mousemove event
            if (noodle.graphics.transformable.edges.right) {
                var width = 100 * (e.pageX - nodeRect.left) / parRect.width;
                noodle.global.active.nodeEl.style.width = width + '%';
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

                var width = oldWidth - 100 * (e.pageX - 1 * noodle.misc.string.trimEnd(noodle.global.active.nodeEl.style.left, 2)) / parRect.width;

                noodle.global.active.nodeEl.style.width = width + '%';
                noodle.global.active.nodeEl.style.left = e.pageX + 'px';
            }

            if (noodle.graphics.transformable.edges.bottom) {
                var height = 100 * (e.pageY - nodeRect.top) / parRect.width;
                noodle.global.active.nodeEl.style.height = height + 'vw';
            }
            noodle.port.updateWires(noodle.node.getObj(noodle.global.active.nodeEl, noodle).core.inPorts);
            noodle.port.updateWires(noodle.node.getObj(noodle.global.active.nodeEl, noodle).core.outPorts);
        },
        move(e) {
            noodle.global.active.nodeEl.style.left = e.pageX + noodle.graphics.transformable.offsetX + "px";
            noodle.global.active.nodeEl.style.top = e.pageY + noodle.graphics.transformable.offsetY + "px";
            //TODO: Update wires
            noodle.port.updateWires(noodle.node.getObj(noodle.global.active.nodeEl, noodle).core.inPorts);
            noodle.port.updateWires(noodle.node.getObj(noodle.global.active.nodeEl, noodle).core.outPorts);
        },
        pullWire(e) {
            var sockEl = noodle.global.active.socketEl;

            var p0 = { x: e.pageX, y: e.pageY };
            var p1 = noodle.misc.html.getElPos(sockEl, 1);

            if (!noodle.misc.html.hasClass(sockEl, "input")) {
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

window.onkeydown = function (e) {
    if (e.ctrlKey) {
        //setActiveTool(toolBox.cut)
        mainCont.style.cursor = "crosshair";

        $('.wire').unbind().mouseover(function (e) {
            if (e.which === 1)
                noodle.wire.cut(noodle.wire.getObj(e.target, noodle));
        });

        window.onkeyup = function (e) {
            console.log("Stop cut");
            mainCont.style.cursor = "auto";
            $('.wire').unbind();
            window.onkeyup = noodle.events.defKeyup;
        };
    }

    if (e.shiftKey && e.keyCode === 65) { //Shift + A
        var newNodeMenuContent = [];
        for (var i in coreList) {
            var core = coreList[i];
            newNodeMenuContent.push({
                label: core.name,
                func: eval('var f = function(){\nvar core = coreList[' + i + '];\nnoodle.node.add(noodle, core, core.name, noodle.global.mousePos);\n}; f;') //TODO: This feels like a really dirty way to generate a function
            });
        }
        noodle.ui.menus.addAirMenu(newNodeMenuContent, noodle.global.mousePos);
    }
};