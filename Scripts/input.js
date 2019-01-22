/*var defTiMouseup = function(e){
    var tiEl = e.currentTarget;
    $(".selectedDataBox").removeClass(".selectedDataBox");
    tiEl.classList.toggle("selectedDataBox");
    tiEl.insertAdjacentHTML('beforeend', )
};*/

//$(".textInput").mouseup(defTiMouseup);


var defTextDbInputChange = function(e){
    var tbEl = e.target;
    var node = noodle.html.getParentNodeEl(tbEl).obj;
    node.data.text = tbEl.value;
    noodle.node .execute(node);
}