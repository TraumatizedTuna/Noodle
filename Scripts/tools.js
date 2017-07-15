function trimEnd(str, amount){
    return str.substr(0, str.length - amount);
}

function hasClass(el, className){
    for(var i = 0; i < el.classList.length; i++){
        if(el.classList[i] == className)
            return true;
    }
    return false;
}

function getElPos(el, depth){
    var pos = {x: 0, y: 0};
    for(var i = 0; i < depth; i++){
        pos.x += el.getBoundingClientRect().left;
        pos.y += el.getBoundingClientRect().top;
        el = el.parentElement;
    }
    return pos;
}

function getEl(obj){
    return document.getElementById(obj.id);
}

function getParentNodeEl(el){
    while(!hasClass(el = el.parentElement, 'node'));
    return el;
}

function getFile(path){
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