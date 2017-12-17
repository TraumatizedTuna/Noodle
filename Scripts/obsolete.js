var coreList = [

    noodle.node.newExpr(
        noodle, //noodle
        'Add', //name
        function (node) {
            node.core.outPorts[0].value = node.core.inPorts[0].value + node.core.inPorts[0].value;
        }, //func
        [
            noodle.port.new(noodle, 'term0', 'num', true),
            noodle.port.new(noodle, 'term1', 'num', true)
        ], //inPortExps
        [
            noodle.port.new(noodle, 'sum', 'num', false)
        ], //outPortExps
        {}, //data
        [], //resetFuncs
        'yellow' //color
    ),

    noodle.node.newExpr(
        noodle, //noodle
        'Value', //name
        function (node) {
            node.core.outPorts[0].value = 3;
        }, //func
        [], //inPortExps
        [
            noodle.port.new(noodle, 'value', 'num', false)
        ], //outPortExps
        {}, //data
        [], //resetFuncs
        'blue', //color
        noodle.files.getFile('Html/valueNode.html') //htmlContent
    ),

    noodle.node.newExpr(
        noodle, //noodle
        'Text', //name
        function (node) {
            var core = node.core;
            //core.data.text = core.inPorts[0].value;
            core.outPorts[0].value = core.data.text;
        }, //func
        [], //inPortExps
        [
            noodle.port.new(noodle, 'value', 'text', false)
        ], //outPortExps
        {
            text: "",
            updateOutPort(core) {
                core.outPorts[0].value = core.data.text;
            }
        }, //data
        [
            function () {
                $('.textDbInput').change(defTextDbInputChange);
            }
        ], //resetFuncs
        'grey', //color
        '<input type="text" class="textDbInput">'
    ),

    noodle.node.newExpr(
        noodle, //noodle
        'Eval', //name
        function (node) {
            var core = node.core;
            eval(core.inPorts[0].value);
        }, //func
        [
            noodle.port.new(noodle, 'code', 'string', true),
        ], //inPortExps
        [], //outPortExps
        {
            code: ''
        }, //data
        [], //resetFuncs
        'green' //color
    ),

    noodle.node.newExpr(
        noodle, //noodle
        'BrowserCode', //name
        function (node) {
            var core = node.core;
        }, //func
        [], //inPortExps
        [
            noodle.port.new(noodle, 'function', 'function', false)
        ], //outPortExps
        {
            code: null
        }, //data
        [
            function (node) {
                noodle.html.firstByClass(node.html, 'btn').onclick = function () {
                    var nodeEl = noodle.html.getParentNodeEl(this);
                    var node = noodle.node.getObj(noodle, nodeEl);

                    node.core.data.code = noodle.userFunc;
                }
            }
        ], //resetFuncs
        'Grey', //color
        '<button class="btn">Get code</button>'
    ),

    noodle.node.newExpr(
        noodle, //noodle
        'Dummy', //name
        function (node) {
            var core = node.core;
            if (core.inPorts[core.inPorts.length - 1].wires.length != 0) { //If last port is connected
                noodle.port.addToPorts(node, core.inPorts, noodle.port.new(noodle, 'in', 'text', true));
            }
            if (core.outPorts[core.outPorts.length - 1].wires.length != 0) {
                noodle.port.addToPorts(node, core.outPorts, noodle.port.new(noodle, 'out', 'text', false));
            }
        }, //func
        [
            noodle.port.new(noodle, 'in', 'text', true)
        ], //inPortExps
        [
            noodle.port.new(noodle, 'out', 'text', false)
        ], //outPortExps
        {}, //data
        [
            function (node) {
                node.core.func(node);
            }
        ], //resetFuncs
        'White', //color
        '<input type="text" class="textDbInput" style="width: 100%">'
    )
];