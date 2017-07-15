/*var defTiMouseup = function(e){
    var tiEl = e.currentTarget;
    $(".selectedDataBox").removeClass(".selectedDataBox");
    tiEl.classList.toggle("selectedDataBox");
    tiEl.insertAdjacentHTML('beforeend', )
};*/

//$(".textInput").mouseup(defTiMouseup);


var defTextDbInputChange = function(e){
    var tbEl = e.target;
    var node = getNode(getParentNodeEl(tbEl));
    node.core.data.text = tbEl.value;
    execNode(node);
}