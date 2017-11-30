var portTypes = {
    number: {
        name: 'number',
        color: 'yellow',
        interface: nodeTypes.number,
        in: [0],
        out: [0]
    },
    string: {
        name: 'string',
        color: 'grey',
        interface: nodeTypes.string,
        in: [0],
        out: [0]
    },
    code: {
        name: 'code',
        color: 'green',
        interface: nodeTypes.code,
        in: [2],
        out: [0]
    },
    js: {
        name: 'js',
        color: 'purple',
        interface: nodeTypes.eval,
        in: [0],
        out: [0]
    },
    any: {
        name: 'any',
        color: 'white',
        interface: nodeTypes.any,
        in: [0, 1],
        out: [0]
    }

};