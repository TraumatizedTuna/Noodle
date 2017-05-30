function nodeCanv(el){
    $.get('Html/nodeBoard.html', function(data) {
        el.innerHTML = data;
    });
}

function addNode(core, label){
    var node = {
        label: label,
        core: $.extend(true, {}, core),
        default: core
    };
    setNodeHtml(node);
    renderNode(node, nodeBoard);
    add2IdForest(node);
    
    return node;
}

function setNodeHtml(node){
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
            nodeId++;
        }
    });
}




function renderNode(node, container){
    
    container.innerHTML += node.html; //This appears to be where old attributes disappear, which I guess makes sense
    
    add2IdForest(node);
    
    $(".borderSensor").mousedown(borderSensorFunc); //Ineffective to set mousedown functions for all border sensors every time? Who cares? Will I fix it? Hmm...
    $(".btnClose").mousedown(nodeClose);
    $(".btnMaximize").mousedown(nodeMax);
    
    $(".nodeTopBar").mousedown(topBarFunc);

    setSockEv();
}



function add2IdForest(node){
    eval('idForest.' + node.id + '=node;');
}

function getNode(nodeEl){
    return eval('idForest.' + nodeEl.id);
}