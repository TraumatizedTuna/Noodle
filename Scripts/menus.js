function addAirMenu(content, position){
    var cont = document.getElementById("mainCont");
    cont.insertAdjacentHTML('beforeend', '<div class="menu airMenu" id="airMenu"></div>');
    var menuEl = document.getElementById("airMenu");
    for(var i = 0; i < content.length; i++){
        menuEl.insertAdjacentHTML('beforeend', '<div class="menuRow" id="mr' + i + '">' + content[i].label + '</div>');
        document.getElementById('mr' + i).onmousedown = content[i].func;
    }
}

var newNodeMenuContent = [
    {
        label: "add", func: function(){
            addNode(addCore, "");
        }
    },
    {
        label: "value", func: function(){
            addNode(valueCore, "");
        }
    }
];