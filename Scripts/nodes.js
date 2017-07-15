function nodeCanv(el){
    $.get('Html/nodeBoard.html', function(data) {
        el.innerHTML = data;
    });
}

function addNode(core, label, pos){
    var node = {
        label: label,
        core: $.extend(true, {}, core),
        default: core
    };
    setNodeHtml(node);
    renderNode(node, nodeBoard);
    var nodeEl = getEl(node);
    if(node.core.htmlContent != undefined){
        nodeEl.getElementsByClassName('nodeContent')[0].innerHTML = node.core.htmlContent;
    }
    nodeEl.style.left = pos.x + 'px';
    nodeEl.style.top = pos.y + 'px';
    add2IdForest(node);
    
    for(var i = 0; i < node.core.resetFuncs.length; i++){
        node.core.resetFuncs[i](node, nodeEl);
    }
    
    return node;
}

function setNodeHtml(node){
    var nodeId = firstFreeId(freeIds.node)
    $.ajax({
        async: false, //TODO: Set to true and do nodeId++ before?
        type: 'GET',
        url: 'Html/emptyNode.html',
        success: function(data) {
            var style = "";
            
            //Set color of node
            var color = node.core.color;
            if(color != "default"){
                style = ' style = "background-color: ';
                if(color == "random"){
                    style += "hsl(" + Math.random()*255 + "," + Math.random()*80+20 + "%," + Math.sqrt(Math.random())*90+10 + '%)"';
                }
                else style += color + '"';
            }

            node.html = '<div class="node" id="n' + nodeId + '"' + style + '>' + data + '</div>'; //Not sure I like .html stuff
            node.html += portCode(node.core.inPorts, "input", node) + portCode(node.core.outPorts, "output", node); //node.html will be changed to the actual html element rather than its code once it's rendered
            node.id = 'n' + nodeId;
            node.html += '<div class="nodeContent"></div><br>id: ' + node.id;
        }
    });
}




function renderNode(node, container){
    
    container.insertAdjacentHTML('beforeend', node.html);
    
    add2IdForest(node);
    
    $(".borderSensor").mousedown(borderSensorFunc); //Ineffective to set mousedown functions for all border sensors every time? Who cares? Will I fix it? Hmm...
    $(".btnClose").mousedown(nodeClose);
    $(".btnMaximize").mousedown(nodeMax);
    
    $(".nodeTopBar").mousedown(topBarFunc);

    setSockEv();
    
    forEachPort(node.core, renderPortVal)
}


function disconnectNode(node){
    forEachPort(node.core, cutPort);
}


function add2IdForest(node){
    eval('idForest.' + node.id + '=node;');
}

function getNode(nodeEl){
    return eval('idForest.' + nodeEl.id);
}