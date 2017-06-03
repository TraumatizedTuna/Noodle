var scale = false;
var offsetX = 0;
var offsetY = 0;
var edges = { left: false, top: false, right: false, bottom: false };


var borderSensorFunc = function(){
    mousemove.setActiveTool(toolBox.scale); //Or should it just replace everything?
    active.nodeEl = getParentNodeEl(this);

    edges.left = hasClass(this, "bsl");
    edges.top = hasClass(this, "bst");
    edges.right = hasClass(this, "bsr");
    edges.bottom = hasClass(this, "bsb");

}

var nodeClose = function(){
    //TODO: Remove js object
    var nodeEl = getParentNodeEl(this);
    disconnectNode(getNode(nodeEl));
    nodeEl.remove();
}

var topBarFunc = function(e){
    active.nodeEl = this.parentElement.parentElement;
    mousemove.setActiveTool(toolBox.move);
    var left = active.nodeEl.style.left;
    left = left.substring(0, left.length - 2);
    var top = active.nodeEl.style.top;
    top = top.substring(0, top.length - 2);
    offsetX = left - e.pageX; //Might cause problems with automatic positioning?
    offsetY = top - e.pageY;
}

var nodeMax;






