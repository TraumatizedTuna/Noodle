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

var nodeTypes = {
    //Add(...){...} doesn't work since it's a constructor
    Add: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'add',
            color: 'yellow',
            inPorts: {
                term0: noodle.port.new(noodle, 'term0', 'num', true),
                term1: noodle.port.new(noodle, 'term1', 'num', true)
            },
            outPorts: {
                sum: noodle.port.new(noodle, 'sum', 'num', false)
            },
            func: function (node) {
                node.core.outPorts.sum.value = node.core.inPorts.term0.value + node.core.inPorts.term1.value;
            },
            data: {},
            resetFuncs: [],
            htmlContent: ''
        };
        //TODO: Check if this is window?
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Value: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Value',
            color: 'blue',
            inPorts: [
            ],
            outPorts: [
                noodle.port.new(noodle, 'value', 'num', false)
            ],
            func: function (node) {
                node.core.outPorts[0].value = 3;
            },
            data: {},
            resetFuncs: [],
            htmlContent: noodle.files.getFile('Html/valueNode.html')
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Text: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Text',
            color: 'grey',
            inPorts: [
            ],
            outPorts: [
                noodle.port.new(noodle, 'value', 'text', false)
            ],
            func: function (node) {
                var core = node.core;
                //core.data.text = core.inPorts[0].value;
                core.outPorts[0].value = core.data.text;
            },
            data: {
                text: "",
                updateOutPort(core) {
                    core.outPorts[0].value = core.data.text;
                }
            },
            resetFuncs: [
                function () {
                    $('.textDbInput').change(defTextDbInputChange);
                }
            ],
            htmlContent: '<input type="text" class="textDbInput">'
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Color: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Color',
            color: 'grey',
            inPorts: [
            ],
            outPorts: [
                noodle.port.new(noodle, 'color', 'string', false)
            ],
            func: function (node) {
                var core = node.core;
                var nodeEl = node.html;
                var cpEl = nodeEl.getElementsByClassName('colorPicker')[0];
                var color = cpEl.value;

                core.outPorts[0].value = color;
            },
            data: {
                text: "",
                updateOutPort(core) {
                    core.outPorts[0].value = core.data.text;
                }
            },
            resetFuncs: [
            ],
            htmlContent: '<input type="color" class="colorPicker">'
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Code: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Code',
            color: '#1E1438',
            inPorts: [
                noodle.port.new(noodle, 'language', 'text', true),
                noodle.port.new(noodle, 'theme', 'text', true),
                noodle.port.new(noodle, 'code', 'code', true)
            ],
            outPorts: [
                noodle.port.new(noodle, 'code', 'text', false)
            ],
            func: function (node) {
                var core = node.core;
                var codeInPort = core.inPorts[2];
                var outPort = core.outPorts[0];
                var data = core.data;
                var editor = ace.edit(data.edId);
                var lang = core.inPorts[0].value;
                var theme = core.inPorts[1].value;

                if (lang) {
                    editor.getSession().setMode("ace/mode/" + lang);
                }
                if (theme) {
                    editor.setTheme("ace/theme/" + theme);
                }

                if (codeInPort.wires.length) {
                    editor.setValue(codeInPort.value);
                    editor.setOptions({
                        readOnly: true
                    });
                }
                else {
                    editor.setOptions({
                        readOnly: false
                    });
                }

                outPort.value = editor.getValue();
            },
            data: {
                code: '',
                updateOutPort(core) {
                    core.outPorts[0].value = core.data.text;
                }
            },
            resetFuncs: [
                function (node, nodeEl) {
                    //$('.textDbInput').change(defTextDbInputChange);

                    var edEl = nodeEl.getElementsByClassName('editor')[0];
                    edEl.id = 'ed' + node.id.substr(1);
                    node.core.data.edId = edEl.id;

                    ace.require("ace/ext/language_tools");
                    var editor = ace.edit(edEl.id);

                    editor.setTheme("ace/theme/monokai");
                    editor.getSession().setMode("ace/mode/javascript");
                    editor.setOptions({
                        maxLines: 18446744073709551616,
                        enableBasicAutocompletion: true,
                        enableSnippets: true,
                        enableLiveAutocompletion: true
                    });



                    editor.on('change', function (e, aceThing) {
                        try {
                            var edEl = aceThing.container;
                            var nodeEl = noodle.html.getParentNodeEl(edEl);
                            noodle.node.execute(nodeEl.obj);
                        }
                        catch (e) {
                            console.error(e.stack);
                        }
                    }
                    );
                }
            ],
            htmlContent: '<div class="editor" style="width: 500px; height: 250px"></div>'
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Eval: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Eval',
            color: 'green',
            inPorts: {
                code: noodle.port.new(noodle, 'code', 'string', true)
            },
            outPorts: {
                value: noodle.port.new(noodle, 'value', 'any', false)
            },
            subNodes: {
                in: [
                    {
                        label: 'code',
                        node: nodeTypes.Code(noodle)
                    }
                ]
            },
            func: function (node) {
                var core = node.core;
                core.outPorts.value.value = eval(core.inPorts.code.value);
            },
            data: {
                code: '',
            },
            resetFuncs: [
            ],
            htmlContent: ''
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Html: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Html',
            color: 'Darkgrey',
            inPorts: [
                noodle.port.new(noodle, 'Html', 'string', true),
            ],
            outPorts: [
            ],
            func: function (node) {
                var core = node.core;
                var box = core.data.renderBox;
                box.html.innerHTML = core.inPorts[0].value;
            },
            data: {

            },
            resetFuncs: [
                function (node, nodeEl) {
                    var core = node.core;
                    var box = {};
                    core.data.renderBox = box;
                    box.html = nodeEl.getElementsByClassName('renderBox')[0];
                    box.html.innerHtml = '';
                    box.html.obj = box;
                    box.html.style.height = '200px';
                    box.html.style.width = '400px';
                }
            ],
            htmlContent: '<div class="renderBox"></div>'
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    NodeCreator: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'NodeCreator',
            color: 'orange',
            inPorts: {
                name: noodle.port.new(noodle, 'name', 'string', true),
                color: noodle.port.new(noodle, 'color', 'string', true),
                'in ports': noodle.port.new(noodle, 'in ports', 'string', true),
                'out ports': noodle.port.new(noodle, 'out ports', 'string', true),
                function: noodle.port.new(noodle, 'function', 'string', true),
                data: noodle.port.new(noodle, 'data', 'obj', true),
                html: noodle.port.new(noodle, 'html', 'string', true),
                'reset functions': noodle.port.new(noodle, 'reset functions', 'string', true)
            },
            outPorts: [
                noodle.port.new(noodle, 'constructor', 'func', false),
                noodle.port.new(noodle, 'constructor body', 'string', false),
                noodle.port.new(noodle, 'error', 'string', false),
                noodle.port.new(noodle, 'error stack', 'string', false)
            ],
            func: function (node) {
                var core = node.core;
                var name = core.inPorts.name.value;

                try {
                    var constrBody =
                        'try {\n    var newCore = {\n        name: "' + name +
                        '",\n        color: "' + core.inPorts.color.value +
                        '",\n        inPorts: ' + core.inPorts['in ports'].value +
                        ',\n        outPorts: ' + core.inPorts['out ports'].value +
                        ',\n        func: ' + core.inPorts.function.value +
                        ',\n        data: ' + core.inPorts.data.value +
                        ',\n        resetFuncs: ' + core.inPorts['reset functions'].value +
                        ',\n        htmlContent: "' + core.inPorts.html.value +
                        '"\n    }\n    return noodle.node.new(noodle, newCore, label, pos);\n}\ncatch (e) {\n    return null;\n}';
                    core.outPorts[1].value = constrBody;
                    var constr = new Function(
                        ['noodle', 'label', 'pos', 'noodleExp'],
                        constrBody
                    );

                    nodeTypes[name] = constr;
                    //var newNode = noodle.node.add(noodle, constr, '', {x: 30, y: 30});

                    core.outPorts[0].value = constr;
                    //core.outPorts[1].value = newNode;
                    core.outPorts[2].value = '';
                    core.outPorts[3].value = '';
                }
                catch (e) {
                    core.outPorts[2].value = e.message;
                    core.outPorts[2].value = e.stack;
                }
            },
            data: {
            },
            resetFuncs: [
            ],
            htmlContent: noodle.files.getFile('Html/Nodes/nodeCreator.html')
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Object: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Object',
            color: 'magenta',
            inPorts: {
                object: noodle.port.new(noodle, 'object', 'object', true)
            },
            outPorts: {
                object: noodle.port.new(noodle, 'object', 'object', false)
            },
            func: function (node) {
                var core = node.core;
                var inPorts = core.inPorts;
                var outPorts = core.outPorts;
                var box = core.data.renderBox;
                var obj = inPorts.object.value;

                if (obj === undefined)
                    obj = {};

                outPorts.object.value = obj;
                outPorts.properties = outPorts.properties || {};
                for (var i in obj) {
                    var prop = obj[i];
                    var propPort = outPorts.properties[i];
                    if (!propPort) {
                        noodle.port.addToPorts(node, core.outPorts.properties, noodle.port.new(noodle, i, prop.type || typeof prop, false, [], prop));
                    }
                }


                //Draw tree{
                box.html.innerHTML = noodle.object.toHtml(noodle, obj);
                //}
            },
            data: {
            },
            resetFuncs: [
                function (node, nodeEl) {
                    var core = node.core;
                    var box = {};
                    core.data.renderBox = box;
                    box.html = nodeEl.getElementsByClassName('renderBox')[0];
                    box.html.innerHtml = '';
                    box.html.obj = box;
                    box.html.style.height = '200px';
                    box.html.style.width = '400px';
                }
            ],
            htmlContent: '<div class="renderBox"></div>'
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },


    Cookie: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Cookie',
            color: 'cyan',
            inPorts: {
                key: noodle.port.new(noodle, 'key', 'string', true),
                val: noodle.port.new(noodle, 'value', 'any', true)
            },
            outPorts: {
                'cookie main': noodle.port.new(noodle, 'cookie main', 'object', false)
            },
            func: function (node) {
                var core = node.core;
                var key = core.inPorts[0].value;
                var val = core.inPorts[1].value;
                if (key && val) {
                    noodle.cookie.set(noodle, key, val);
                }
                core.outPorts[0].value = noodle.cookie.get(noodle);

            },
            data: {
            },
            resetFuncs: [
            ],
            htmlContent: ''
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },

    Container: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Container',
            color: 'rgba(64,64,64,0.4)',
            inPorts: {
                in: noodle.port.new(noodle, 'in', 'text', true)
            },
            outPorts: [
                noodle.port.new(noodle, 'out', 'text', false)
            ],
            func: function (node) {
                var core = node.core;
            },
            data: {
                container: {
                    forest: [],
                    wires: []
                }
            },
            resetFuncs: [
                function (node, nodeEl) {
                    var core = node.core;
                    var container = core.data.container;
                    container.html = nodeEl.getElementsByClassName('container')[0];
                    container.html.obj = container;
                    container.html.style.height = '100%';
                    container.html.style.bottom = '0px;'; //TODO
                }
            ],
            htmlContent: '<div class="container"></div>'
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Dummy: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Dummy',
            color: 'white',
            inPorts: [
                noodle.port.new(noodle, 'in', 'text', true)
            ],
            outPorts: [
                noodle.port.new(noodle, 'out', 'text', false)
            ],
            func: function (node) {
                var core = node.core;
                if (core.inPorts[core.inPorts.length - 1].wires.length != 0) { //If last port is connected
                    noodle.port.addToPorts(node, core.inPorts, noodle.port.new(noodle, 'in', 'text', true));
                }
                if (core.outPorts[core.outPorts.length - 1].wires.length != 0) {
                    noodle.port.addToPorts(node, core.outPorts, noodle.port.new(noodle, 'out', 'text', false));
                }
            },
            data: {
            },
            resetFuncs: [
                function (node) {
                    node.core.func(node);
                }
            ],
            htmlContent: '<input type="text" class="textDbInput" style="width: 100%">'
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    toSerial: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'toSerial',
            color: 'brown',
            inPorts: {
                code: noodle.port.new(noodle, 'anything', 'any', true)
            },
            outPorts: {
                value: noodle.port.new(noodle, 'value', 'string', false)
            },
            func: function (node) {
                var core = node.core;
                core.outPorts.value.value = toSerialZ(core.inPorts.code.value);
            },
            data: {
                code: '',
            },
            resetFuncs: [
            ],
            htmlContent: ''
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    }
};
nodeTypes.Test = function (noodle, label, pos, noodleExp) {
    var core = {
        name: 'Test',
        color: 'white',
        inPorts: [
            noodle.port.new(noodle, 'in', 'text', true)
        ],
        outPorts: [
            noodle.port.new(noodle, 'out', 'text', false),
            nodeTypes.Text(noodle)
        ],
        func: function (node) {

        },
        data: {
        },
        resetFuncs: [
            function (node) {
                node.core.func(node);
            }
        ],
        htmlContent: ''
    };
    return noodle.node.new(noodle, core, label, pos);
    /* var node = noodle.node.new(noodle, core, label, pos);
    for (var i in node) {
        this[i] = node[i];
    } */
};


noodle.nodeTypes = {
    Text: class extends Node {
        constructor(args) {
            args.core = {
                name: 'Text',
                color: 'grey',
                inPorts: [
                ],
                outPorts: [
                    noodle.port.new(noodle, 'value', 'text', false)
                ],
                func: function (node) {
                    var core = node.core;
                    //core.data.text = core.inPorts[0].value;
                    core.outPorts[0].value = core.data.text;
                },
                data: {
                    text: "",
                    updateOutPort(core) {
                        core.outPorts[0].value = core.data.text;
                    }
                },
                resetFuncs: [
                    function () {
                        $('.textDbInput').change(defTextDbInputChange);
                    }
                ],
                htmlContent: '<input type="text" class="textDbInput">'
            };
            super(args);

            /*var node = noodle.node.new(noodle, core, label, pos);
            for (var i in node) {
                this[i] = node[i];
            }*/
        }
    }
};