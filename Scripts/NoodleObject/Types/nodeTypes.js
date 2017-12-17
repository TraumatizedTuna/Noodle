var nodeTypes = {
    //Add(...){...} doesn't work since it's a constructor
    Add: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'add',
            color: 'yellow',
            inPorts: [
                noodle.port.new(noodle, 'term0', 'num', true),
                noodle.port.new(noodle, 'term1', 'num', true)
            ],
            outPorts: [
                noodle.port.new(noodle, 'sum', 'num', false)
            ],
            func: function (node) {
                node.core.outPorts[0].value = node.core.inPorts[0].value + node.core.inPorts[0].value;
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

                    var editor = ace.edit(edEl.id);
                    editor.setTheme("ace/theme/monokai");
                    editor.getSession().setMode("ace/mode/javascript");
                    editor.setOptions({
                        maxLines: 18446744073709551616
                    });
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
            inPorts: [
                noodle.port.new(noodle, 'code', 'string', true),
            ],
            outPorts: [
            ],
            func: function (node) {
                var core = node.core;
                eval(core.inPorts[0].value);
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
    NodeCreator: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'NodeCreator',
            color: 'orange',
            inPorts: [
                noodle.port.new(noodle, 'name', 'string', true),
                noodle.port.new(noodle, 'color', 'string', true),
                noodle.port.new(noodle, 'in ports', 'string', true),
                noodle.port.new(noodle, 'out ports', 'string', true),
                noodle.port.new(noodle, 'function', 'string', true),
                noodle.port.new(noodle, 'data', 'obj', true),
                noodle.port.new(noodle, 'html', 'string', true),
                noodle.port.new(noodle, 'reset functions', 'string', true)
            ],
            outPorts: [
                noodle.port.new(noodle, 'constructor', 'func', false),
                noodle.port.new(noodle, 'constructor body', 'string', false),
                noodle.port.new(noodle, 'error', 'string', false),
                noodle.port.new(noodle, 'error stack', 'string', false)
            ],
            func: function (node) {
                var core = node.core;
                var name = core.inPorts[0].value;

                try {
                    var constrBody =
                        'try {\n    var newCore = {\n        name: "' + name +
                        '",\n        color: "' + core.inPorts[1].value +
                        '",\n        inPorts: ' + core.inPorts[2].value +
                        ',\n        outPorts: ' + core.inPorts[3].value +
                        ',\n        func: ' + core.inPorts[4].value +
                        ',\n        data: ' + core.inPorts[5].value +
                        ',\n        resetFuncs: ' + core.inPorts[7].value +
                        ',\n        htmlContent: "' + core.inPorts[6].value +
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

    BrowserCode: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'BrowserCode',
            color: 'Grey',
            inPorts: [
            ],
            outPorts: [
                noodle.port.new(noodle, 'function', 'function', false)
            ],
            func: function (node) {
                var core = node.core;
            },
            data: {
                code: null,
            },
            resetFuncs: [
                function (node) {
                    noodle.html.firstByClass(node.html, 'btn').onclick = function () {
                        var nodeEl = noodle.html.getParentNodeEl(this);
                        var node = noodle.node.getObj(noodle, nodeEl);

                        node.core.data.code = noodle.userFunc;
                    }
                }
            ],
            htmlContent: ''
        };
        return noodle.node.new(noodle, core, label, pos);
        /* var node = noodle.node.new(noodle, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Repl: function (noodle, label, pos, noodleExp) {
        var core = {
            name: 'Repl',
            color: 'purple',
            inPorts: [
            ],
            outPorts: [
                noodle.port.new(noodle, 'function', 'function', false)
            ],
            func: function (node) {
                var core = node.core;
            },
            data: {
                code: null,
            },
            resetFuncs: [
                function (node) {
                    noodle.html.firstByClass(node.html, 'btn').onclick = function () {
                        var nodeEl = noodle.html.getParentNodeEl(this);
                        var node = noodle.node.getObj(noodle, nodeEl);

                        node.core.data.code = noodle.userFunc;
                    }
                }
            ],
            htmlContent: '<iframe height="400px" width="100%" src="https://repl.it/repls/StridentGiftedLice?lite=true" scrolling="no" frameborder="no" allowtransparency="true" allowfullscreen="true" sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-modals" width="100%" ></iframe>'
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
            inPorts: [
                noodle.port.new(noodle, 'in', 'text', true)
            ],
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
                    var container = core.data.container;
                    container.html = nodeEl.getElementsByClassName('container')[0];
                    container.html.obj = container;
                    container.html.style.height = '200px';
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
}