function addAirMenu(content, position){
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

var newNodeMenuContent = [
    {
        label: "add", func: function(){
            addNode(addCore, "", mousePos);
        }
    },
    {
        label: "value", func: function(){
            addNode(valueCore, "", mousePos);
        }
    }
];