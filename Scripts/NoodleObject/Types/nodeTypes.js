var nodeTypes = {
    //Add(...){...} doesn't work since it's a constructor
    Code: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
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
                var codeInPort = node.inPorts[2];
                var outPort = node.outPorts[0];
                var data = node.data;
                var editor = ace.edit(data.edId);
                var lang = node.inPorts[0].value;
                var theme = node.inPorts[1].value;

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
                updateOutPort(node) {
                    node.outPorts[0].value = node.data.text;
                }
            },
            resetFuncs: [
                function (node, nodeEl) {
                    //$('.textDbInput').change(defTextDbInputChange);

                    var edEl = nodeEl.getElementsByClassName('editor')[0];
                    edEl.id = 'ed' + node.meta.id; //TODO: Generate new id?
                    node.data.edId = edEl.id;

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
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Eval: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
        var core = {
            name: 'Eval',
            color: 'green',
            inPorts: new KeyedArray({
                code: noodle.port.new(noodle, 'code', 'string', true)
            }),
            outPorts: new KeyedArray({
                value: noodle.port.new(noodle, 'value', 'any', false),
                error: noodle.port.new(noodle, 'error', 'error', false)
            }),
            subNodes: {
                in: [
                    {
                        label: 'code',
                        node: nodeTypes.Code({ noodle: noodle })
                    }
                ]
            },
            func: function (node) {
                var core = node;
                if (core.inPorts.last.wires.length) { //If last port is connected
                    var i = (core.inPorts.length - 1) / 2;
                    noodle.port.addToPorts(node, core.inPorts, noodle.port.new(noodle, 'name ' + i, 'text', true, undefined, undefined, 'a')); //TODO: Uniqe name?
                    noodle.port.addToPorts(node, core.inPorts, noodle.port.new(noodle, 'value ' + i, 'any', true));
                }
                //TODO: Output all the input values?
                /*if (core.outPorts.last.wires.length) {
                    noodle.port.addToPorts(node, core.outPorts, noodle.port.new(noodle, 'out', 'text', false));
                }*/
            },
            data: {
                code: '',
                execute(noodle, node, nodeEl) {
                    var core = node;
                    var err = null;

                    var namePort = null;
                    var varString = '';
                    for (var i = 1; i < core.inPorts.length; i += 2) {
                        namePort = core.inPorts[i];
                        varString += 'var ' + namePort.value + '=core.inPorts[' + (i + 1) + '].value;\n';
                    }
                    i = namePort = undefined; //Get rid of unnecessary variables before eval
                    try {
                        eval(varString);
                    }
                    catch (e) {
                        //err will be overwritten if there's an error when evaluating the expression but that should be fine since that one's probably more interesting
                        err = e;
                        e.message += '. This error was caused by incorrect variable input.';
                    }
                    try {
                        core.outPorts.find('value').value = eval(core.inPorts.find('code').value);
                    }
                    catch (e) {
                        err = e;
                    }
                    core.outPorts.find('error').value = err;

                    noodle.node.execute(node);
                }
            },
            resetFuncs: [
                function (node, nodeEl) {
                    nodeEl.getElementsByClassName('btn')[0].onclick = function (e) {
                        node.data.execute(noodle, node, nodeEl);
                    };
                }
            ],
            htmlContent: '<button class="btn">Eval</button>'
        };
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Html: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
        var core = {
            name: 'Html',
            color: 'Darkgrey',
            inPorts: [
                noodle.port.new(noodle, 'Html', 'string', true),
            ],
            outPorts: [
            ],
            func: function (node) {
                var core = node;
                var box = core.data.renderBox;
                box.html.innerHTML = core.inPorts[0].value;
            },
            data: {

            },
            resetFuncs: [
                function (node, nodeEl) {
                    var core = node;
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
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    NodeCreator: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
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
                var core = node;
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
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Object: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
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
                var core = node;
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
                    var core = node;
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
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },


    Cookie: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
        var core = {
            name: 'Cookie',
            color: 'cyan',
            inPorts: {
                key: noodle.port.new(noodle, 'key', 'string', true),
                val: noodle.port.new(noodle, 'value', 'any', true)
            },
            outPorts: {
                cookieMain: noodle.port.new(noodle, 'cookie main', 'object', false),
                cookie: noodle.port.new(noodle, 'cookie', 'object', false)
            },
            func: function (node) {
                var core = node;
                var key = core.inPorts.key.value;
                var val = core.inPorts.val.value;
                if (key && val) {
                    noodle.cookie.set(noodle, key, val);
                }
                var mainCookie = noodle.cookie.get(noodle);
                core.outPorts.cookieMain.value = mainCookie;
                core.outPorts.cookie.value = mainCookie[key];

            },
            data: {
            },
            resetFuncs: [
            ],
            htmlContent: ''
        };
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },

    Container: function (args) {
        var { noodle: noodle, container: container, innerContainer: innerContainer, pos: pos, label: label } = args;
        innerContainer = innerContainer || new Container({});
        var core = {
            name: 'Container',
            color: 'rgba(64,64,64,0.4)',
            inPorts: {
                in: noodle.port.new(noodle, 'forest', 'object', true)
            },
            outPorts: [
                noodle.port.new(noodle, 'forest', 'object', false)
            ],
            func: function (node) {

            },
            data: {
                container: innerContainer
            },
            resetFuncs: [
            ],
            renderedFuncs: [
                function (node) {
                    var innerContainer = node.data.container;
                    var container = node.data.container;

                    innerContainer.render({ parEl: node.contentEl });

                    //The following should be obsolete
                    /*container.html = nodeEl.getElementsByClassName('container')[0];
                    container.html.obj = container;
                    container.html.style.height = '100%';
                    container.html.style.bottom = '0px;'; //TODO*/
                }
            ]
        };
        var node = new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        innerContainer.node = node;

        return node;
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    Dummy: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
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
                var core = node;
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
                    node.func(node);
                }
            ],
            htmlContent: '<input type="text" class="textDbInput" style="width: 100%">'
        };
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    toSerial: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
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
                var core = node;
                core.outPorts.value.value = toSerialZ(core.inPorts.code.value);
            },
            data: {
                code: '',
            },
            resetFuncs: [
            ],
            htmlContent: ''
        };
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },

    IDB: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
        var core = {
            name: 'IDB',
            color: 'Grey',
            inPorts: new KeyedArray({
                'DB name': noodle.port.new(noodle, 'DB name', 'string', true),
                'store name': noodle.port.new(noodle, 'store name', 'string', true),
                key: noodle.port.new(noodle, 'key', 'string', true),
                value: noodle.port.new(noodle, 'value', 'any', true)
            }),
            outPorts: new KeyedArray({
                'all DBs': noodle.port.new(noodle, 'all DBs', 'array', false),
                'all names': noodle.port.new(noodle, 'all names', 'array', false),
                value: noodle.port.new(noodle, 'value', 'any', false),
                error: noodle.port.new(noodle, 'error', 'error', false)
            }),
            //Not sure I like the async :(
            func: async function (node) {
                var core = node;
                var outPorts = core.outPorts;

                var dbName = core.inPorts.find('DB name').value;
                var storeName = core.inPorts.find('store name').value;
                var key = core.inPorts.find('key').value;

                var allDbsPort = outPorts.find('all DBs');
                var allNamesPort = outPorts.find('all names');
                var valuePort = outPorts.find('value');
                var errorPort = outPorts.find('error');

                var err = null;

                //Dexie
                /*try {
                    const dbNames = await Dexie.getDatabaseNames();
                    var dbs = [];
                    for (var name of dbNames) {
                        dbs.push(new Dexie(name));
                    }

                    allDbsPort.value = dbs;
                    allNamesPort.value = dbNames;

                    var db = new Dexie(dbName);
                    var store = db.table(storeName);
                    var val = store.get(key);
                    valuePort.value = val;

                    errorPort.val = null;
                } catch (e) {
                    errorPort.value = e;
                    console.error(e);
                }
                

                */


                //YDN
                var db = new ydn.db.Storage(dbName, node.data.schema);
                db.onReady(function () {
                    node.data.readItems.key = key;
                    var df = db.values('store0');
                    df.done(node.data.readItems);
                    df.fail(function (e) {
                        err = e;
                    });
                    errorPort.value = err;
                });


                /*
                if (core.inPorts.last.wires.length) { //If last port is connected
                    noodle.port.addToPorts(node, core.inPorts, noodle.port.new(noodle, 'key', 'text', true)); //TODO: Uniqe name?
                    noodle.port.addToPorts(node, core.inPorts, noodle.port.new(noodle, 'value', 'any', true));
                }*/


                //TODO: Output value


            },
            data: {
                schema: {
                    stores: [{
                        name: 'store0',
                        keyPath: 'key'
                    }]
                },
                write(noodle, node, nodeEl) {
                    var core = node;
                    var dbName = core.inPorts.find('DB name').value;
                    var storeName = 'store0';//core.inPorts.find('store name').value;
                    var key = core.inPorts.find('key').value;
                    var val = core.inPorts.find('value').value;

                    var storeDesc = {};
                    storeDesc[storeName] = 'key';

                    var err = null;


                    /**
                     * Create and initialize the database. Depending on platform, this will
                     * create IndexedDB or WebSql or even localStorage storage mechanism.
                     */
                    var db = new ydn.db.Storage(dbName, node.data.schema);
                    db.onReady(function () {
                        db.put(storeName, { val: val, key: key });
                    });

                },
                readItems(items) {
                    var thisFunc = arguments.callee;
                    var node = thisFunc.node;
                    var key = thisFunc.key;
                    var valPort = node.outPorts.find('value');
                    for (var i of items) {
                        if (i.key === key) {
                            valPort.value = i.val;
                            node.noodle.port.propagate({ noodle: node.noodle, port: valPort });
                        }
                    }
                }
            },
            resetFuncs: [
                function (node, nodeEl) {
                    nodeEl.getElementsByClassName('btn')[0].onclick = function (e) {
                        node.data.write(noodle, node, nodeEl);
                    };

                    node.data.readItems.node = node;
                }
            ],
            htmlContent: '<button class="btn">Save</button>'
        };
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
    saveLoad: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
        var core = {
            name: 'Save/Load',
            color: 'Pink',
            inPorts: new KeyedArray({
                name: noodle.port.new(noodle, 'name', 'string', true),
                value: noodle.port.new(noodle, 'value', 'any', true)
            }),
            outPorts: new KeyedArray({
                value: noodle.port.new(noodle, 'value', 'any', false),
                error: noodle.port.new(noodle, 'error', 'error', false)
            }),
            //Not sure I like the async :(
            func: async function (node) {
                var core = node;
                var outPorts = core.outPorts;

                var name = core.inPorts.find('name').value;

                var valuePort = outPorts.find('value');
                var errorPort = outPorts.find('error');


                try {
                    var db = new Dexie('Noodle');
                    var store = db.table('Main');
                    var val = store.get(name);
                    valuePort.value = val;

                    errorPort.val = null;
                } catch (e) {
                    errorPort.value = e;
                    console.error(e);
                }




            },
            data: {
                write(noodle, node, nodeEl) {
                    var core = node;

                    var name = core.inPorts.find('name').value;
                    var val = core.inPorts.find('value').value;

                    var err = null;

                    const db = core.data.db = new Dexie('Noodle');
                    if (db.tables.indexOf('Main') === -1) {
                        db.version(1).stores({ Main: 'key' });
                    }

                    db.Main.put({ key: name, val: val });

                    core.outPorts.find('error').value = err;
                },
                delete(noodle, node, nodeEl) {

                }
            },
            resetFuncs: [
                function (node, nodeEl) {
                    nodeEl.getElementsByClassName('btnSave')[0].onclick = function (e) {
                        node.data.write(noodle, node, nodeEl);
                    };
                    nodeEl.getElementsByClassName('btnDel')[0].onclick = function (e) {
                        node.data.delete(noodle, node, nodeEl);
                    };
                }
            ],
            htmlContent: '<button class="btn btnSave">Save</button><button class="btn btnDel">Delete</button>'
        };
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },

    debugInfo: function (args) {
        var { noodle: noodle, container: container, label: label, pos: pos } = args;
        var core = {
            name: 'Debug Info',
            color: 'White',
            inPorts: new KeyedArray({
            }),
            outPorts: new KeyedArray({
            }),
            //Not sure I like the async :(
            func(node) {
            },
            data: {
            },
            resetFuncs: [
                function (node, nodeEl) {
                    var infoEl = nodeEl.getElementsByClassName('debugInfo')[0];
                    $(document).mousemove(function (e) {
                        infoEl.innerHTML = 'Mouse position: ' + e.pageX + ', ' + e.pageY;
                    });
                }
            ],
            htmlContent: '<div class="debugInfo"></div>'
        };
        return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
        /* var node = noodle.node.new(noodle, container, core, label, pos);
        for (var i in node) {
            this[i] = node[i];
        } */
    },
};
nodeTypes.Test = function (args) {
    var { noodle: noodle, container: container, label: label, pos: pos } = args;
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
                node.func(node);
            }
        ],
        htmlContent: ''
    };
    return new noodle.Node({ noodle: noodle, container: container, core: core, pos: pos, label: label });
    /* var node = noodle.node.new(noodle, container, core, label, pos);
    for (var i in node) {
        this[i] = node[i];
    } */
};


noodle.nodeTypes = {
    Text: class extends noodle.Node {
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
                    var core = node;
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

            /*var node = noodle.node.new(noodle, container, core, label, pos);
            for (var i in node) {
                this[i] = node[i];
            }*/
        }
    }
};