var active = {
    nodeEl: null,
    node: null,
    socketEl: null,
    mousemoveTool: null,
    menuEl: null
};
var selected = {
    nodes: [],
    tools: []
};
var hovered;

var mousePos = {x: 0, y: 0};

var freeIds = {
    node: [0],
    port:[0],
    wire: [0]
};

function firstFreeId(ids){
    if(ids.length > 1){
        return ids.pop();
    }
    var ind = ids.length - 1;
    var id = ids[ind];
    ids[ind]++;
    return id;
}

function freeId(ids, id, safe){
    if(safe){
        for(var i = 0; i < ids.length; i++){
            if(ids[i] == id){
                console.warn("freeId() was called for id that was already free. Something weird is going on");
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