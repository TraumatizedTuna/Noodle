function setSockEv(){
    $('.socket').mousedown(function(e){
        active.socketEl = e.target;
        active.pullWire = newWire();
        renderWire(active.pullWire);
        toolBox.pullWire(e); //To avoid awkward start
        mousemove.setActiveTool(toolBox.pullWire);
        $('.socket').mouseup(function(e){
            var pullPort = getPort(active.socketEl.parentElement);
            var targetPort = getPort(e.target.parentElement);
            if(hasClass(active.socketEl, 'output')){ //If the wire is pulled from an output socket
                connectWire(pullPort, targetPort, active.pullWire);
            }
            else{
                connectWire(targetPort, pullPort, active.pullWire);
            }
            
            defMouseup();
            document.onmouseup = defMouseup;
            $('.socket').mouseup(null);
        });
        document.onmouseup = function(){
            removeWireEl(getEl(active.pullWire));
            defMouseup();
            $('.socket').mouseup(null);
            document.onmouseup = defMouseup;
        }
    });
}