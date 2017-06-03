tools.js {
	trimEnd(str, amount),						//Removes amount chars at end of str
	hasClass(el, className),					//Returns true if el has the class className
	getElPos(el, depth),						//Returns position of depth:th parent of el
	getEl(obj),									//Returns html element e such that e.id == obj.id
	getParentNodeEl(el)							//Returns closest parent node element
}

nodes.js {
	nodeCanv(el)								//Sets up el to be node canvas  - TODO: Allow multiple node canvases and find a better name
	addNode(core, label)						//Adds new node, sets it up properly and renders it
	setNodeHtml(node)							//Gives node proper html code, doesn't render it
	renderNode(node, container)					//Puts node in container based on node.html
	disconnectNode(node)						//Cuts all wires connected to node
	add2IdForest(node)							//Adds node to id list for nodes  - TODO: Rename
	getNode(nodeEl)								//Gets js node from html node nodeEl
}

ports.js {
	portCode(ports, classes, node)
	addToPortIds(port)
	getPort(portEl)
	cutPort(port)								//Cuts all wires connected to port
	forEachPort(core, func)						//Runs func with each port on core
}

wires.js {
	newWire()									//Returns a new, unconnected wire object
	addWire(p0, p1)								//Sets up new wire between p0 and p1 and renders it
	connectWire(p0, p1, wire)					//Connects p0 and p1 with wire
	renderWires(ports)							//Goes through ports and renders their wires
	renderWire(wire)							//Sets up wire html
	updateWires(ports)							//Goes through wires of ports and update their html
	updateWire(wire)							//Updates wire html using wireBetween
	wireBetween(p0, p1, wire)					//Updates wire html so it goes between positions p0 and p1
	cutWire(wire)								//Does its best to convince you that wire never existed
	removeWireEl(wireEl)						//Helps cutWire remove html element
	autoBez(x0, y0, x1, y1, ctrlDist, slack)	//Returns svg code for wire curve
	add2WireIds(wire)							//Adds wire id to id index of wires
	getWire(html)								//Returns js object of wire html
}

nodeExec.js {
	execNode(node)								//Executes node and nodes connected to out ports
}