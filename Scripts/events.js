toolBox = {
    scale: function(e){
        //TODO: move those two lines to the mousedown event if possible
        var nodeRect = active.nodeEl.getBoundingClientRect();
        var parRect = active.nodeEl.parentElement.getBoundingClientRect();

        //TODO: Kinda stupid to check this on every mousemove event
        if(noodle.graphics.transformable.edges.right){
            var width = 100 * (e.pageX - nodeRect.left) / parRect.width;
            active.nodeEl.style.width = width + '%';
        }
        else if(noodle.graphics.transformable.edges.left){
            //var width = 100 * (nodeRect.width + nodeRect.left - e.pageX) / parRect.width;
            
            //TODO: Well...
            var oldWidth = active.nodeEl.style.width;
            oldWidth = oldWidth.substr(0, oldWidth.length-1);
            oldWidth *= 1;
            if(oldWidth == 0){
                oldWidth = 25;
            }
            
            var width = oldWidth - 100*(e.pageX - 1*trimEnd(active.nodeEl.style.left, 2))/parRect.width;
            
            active.nodeEl.style.width = width + '%';
            active.nodeEl.style.left = e.pageX + 'px';
        }

        if(noodle.graphics.transformable.edges.bottom){
            var height = 100 * (e.pageY - nodeRect.top) / parRect.width;
            active.nodeEl.style.height = height + 'vw';
        }
        noodle.ports.updateWires(noodle.nodes.getObj(active.nodeEl).core.inPorts);
        noodle.ports.updateWires(noodle.nodes.getObj(active.nodeEl).core.outPorts);
    },
    move: function(e){
        active.nodeEl.style.left = e.pageX + noodle.graphics.transformable.offsetX + "px";
        active.nodeEl.style.top = e.pageY + noodle.graphics.transformable.offsetY + "px";
        //TODO: Update wires
        noodle.ports.updateWires(noodle.nodes.getObj(active.nodeEl).core.inPorts);
        noodle.ports.updateWires(noodle.nodes.getObj(active.nodeEl).core.outPorts);
    },
    pullWire: function(e){
        var sockEl = active.socketEl;
        
        var p0 = { x: e.pageX, y: e.pageY};
        var p1 = noodle.misc.html.getElPos(sockEl, 1);
        
        if(noodle.misc.html.hasClass(sockEl, "input")){
            noodle.wires.wireBetween(p0, p1, active.pullWire);
        }
        else
            noodle.wires.wireBetween(p1, p0, active.pullWire);
    }
};

var mousemove = {
    setActiveTool: function(tool){
        active.mousemoveTool = tool;
    }
};

var keydown = {
    setActiveTool: function(tool){
        active.keydownTool = tool;
    }
}

document.onmousemove = function(e){
    /*for(var i = 0; i < selected.misc.length; i++){
        selected.tools[i](e);
    }*/
    mousePos = {x: e.pageX, y: e.pageY};
    if(active.mousemoveTool != null)
        active.mousemoveTool(e);
}

var defMouseup = function(){
    mousemove.setActiveTool(null); //Do we really always want to clear it on mouse up? Maybe add another list that's not cleared
}

var defKeyup = null;

document.onmouseup = defMouseup;


window.onkeydown = function(e){
    if(e.ctrlKey){
        //setActiveTool(toolBox.cut)
        mainCont.style.cursor = "crosshair";
        
        $('.wire').mouseover(function(e){
            if(e.which == 1)
                noodle.wires.cut(noodle.wires.getObj(e.target));
        });
        
        window.onkeyup = function(e){
            console.log("Stop cut");
            mainCont.style.cursor = "auto";
            $('.wire').unbind();
            window.onkeyup = defKeyup;
        }
    }
    
    if(e.shiftKey && e.keyCode == 65){ //Shift + A
        var newNodeMenuContent = [];
        for(var i = 0; i < coreList.length; i++){
            var core = coreList[i];
            newNodeMenuContent.push({
                label: core.name,
                func: eval('var f = function(){\nvar core = coreList[' + i + '];\nnoodle.node.add(core, core.name, mousePos);\n}; f;') //TODO: This feels like a really dirty way to generate a function
            });
        }
        noodle.ui.menus.addAirMenu(newNodeMenuContent, mousePos);
    }
}

var renderCount = 0;