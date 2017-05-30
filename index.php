<!DOCTYPE html>
<html>
    <head>
        
        <meta charset="utf-8">
        <link rel="stylesheet" href="Assets/reset.css">
        <link rel="stylesheet" href="Assets/style.css">
        

        
        <!-- import external stuff -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
        
        <link href='https://fonts.googleapis.com/css?family=Poiret+One' rel='stylesheet' type='text/css'>
        <link href='https://fonts.googleapis.com/css?family=Raleway:300' rel='stylesheet' type='text/css'>
        
        <!-- Local scripts -->
        <script src="Scripts/nodes.js"></script>
        <script src="Scripts/nodeTransform.js"></script>
        
        <script src="Scripts/wires.js"></script>
        
    </head>
    
    <body>
        <div id="nodeCanvas"></div>
        
        
        <svg id="wireBoard" width="100%" height="2000">
            
        </svg>
        
        
        <script>
            //nodeCanv(document.getElementById("nodeCanvas"));
            var nodeId = 0;
            var portId = 0;
            var wireId = 0;  //TODO: BigInt  -  aaaaaa
            
            var nodeBoard = document.getElementById("nodeCanvas");
            var wireBoard = document.getElementById("wireBoard"); //TODO: wireBoard should be auto generated
            
            var idForest = {};
            
            
            var addNode = {
                name: "Add",
                color: "yellow",
                inPorts: [
                    {name: "term0", type: "num"},
                    {name: "term1", type: "num"}
                ],
                inVals: [0, 0],
                outPorts: [
                    {name: "sum", type: "num"}
                ],
                outVals: [0],
                func: function(core){
                     core.outVals[0] = core.inVals[0] + core.inVals[0];
                }
            };
            
            var valueNode = {
                name: "Value",
                color: "blue",
                inPorts: [],
                outPorts: [{name: "value", type: "num"}],
                outVals: [3],
                func: function(core){
                    core.outVals[0] = 3;
                }
            }
            
            var wires = [
                {
                    node0: null, port0: 0,
                    node1: null, port1: 0
                }
            ];
            
            var forest = [
                {
                    label: "",
                    core: $.extend(true, {}, valueNode),
                    default: valueNode
                },
                {
                    label: "",
                    core: $.extend(true, {}, addNode),
                    default: addNode
                }
            ];
            
            forest.push($.extend(true, {}, forest[1]));
            
            
            forest[0].core.outPorts = [{wire: wires[0], value: 3}];
            
            forest[1].core.inPorts = [{name: "Term", wire: wires[0], value: 0}, {name: "Term", wire: null, value: 1}];
            forest[1].core.outPorts = [{name: "Sum", wire: null, value: 0}];
            
            forest[2].core.inPorts = [{name: "Term", wire: null, value: 0}, {name: "Term", wire: null, value: 1}];
            forest[2].core.outPorts = [{name: "Sum", wire: null, value: 0}];
            
            wires[0].node0 = forest[0];
            wires[0].node1 = forest[1];
            
            
            setNodeHtml(forest[0]);
            renderNode(forest[0], nodeBoard);
            
            setNodeHtml(forest[1]);
            renderNode(forest[1], nodeBoard);
            
            setNodeHtml(forest[2]);
            renderNode(forest[2], nodeBoard);
            
            
            add2IdForest(forest[0]);
            add2IdForest(forest[1]);
            add2IdForest(forest[2]);
            
            
            renderWire(wires[0]);
            
            
            
            
                
            
        </script>

        
        
    </body>
</html>