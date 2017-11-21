//This document is totally obsolete

tools.js {
	trimEnd(str, amount),						
	hasClass(el, className),					
	getElPos(el, depth),						
	getEl(obj),									
	getParentNodeEl(el)							
}

nodes.js {
	nodeCanv(el)								//Sets up el to be node canvas  - TODO: Allow multiple node canvases and find a better name
	add(core, label, pos)						
	render(node, container)					
	disconnect(node)
	getNode(nodeEl)								
}

nodeTransform.js {
	borderSensorFunc()			//Makes sure that a node will be scaled on mousemove
	nodeClose()					//Deletes a node
	topBarFunc(e)				//Makes sure that a node will be moved on mousemove
}

ports.js {
	portCode(ports, classes, node)
	addToPortIds(port)
	getPort(portEl)
	cutPort(port)								
	forEachPort(core, func)						
	renderPortVal(port)
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
	removeWireEl(wire)							//Helps cutWire remove html element
	autoBez(x0, y0, x1, y1, ctrlDist, slack)	//Returns svg code for wire curve
	add2WireIds(wire)							//Adds wire id to id index of wires
	getWire(html)								//Returns js object of wire html
}

wireEvents.js {
	setSockEv()									//Makes sure that a new wire will be pulled on mousemove and connected or deleted on mouseup
}

expr {
	//Evaluation states{
    alwaysReady: 0,
    ready: 1,
    done: 2,
    wait: 3,
    //}
	new(noodle, func, args = [], ans, noodleExp, state = noodle.expr.ready)
}

menus.js {
	addAirMenu(content, position)				//Renders menu with one element of content per row. Menu disappears on mouseleave
}

events.js {
	toolBox {									//Contains tool functions for mousemove events
		scale(e)									//Scales active.nodeEl
		move(e)										//Moves active.nodeEl
		pullWire(e)									//Pulls new wire from active.socketEl
	}
	mousemove {									//Contains functions for the mousemove event
		setActiveTool								//Sets active mousemove tool
	}
	document.onmousemove(e)						//Updates mousePos and runs active.mousemoveTool unless it's null
	defMouseup()								//Default mouseup function, clears mousemove tool function
	window.onkeydown(e)							//Takes care of hotkeys
}

active.js {
	active										//Contains active elements and objects
	selected									//Contains selected elements and objects
	hovered										//Contains hovered elements and objects
	mousePos									//Current mouse position, updated in every mousemove event. Note that it's set to {x: 0, y: 0} before first mousemove
	freeIds										//Contains lists of free ids for different kinds of elements
	firstFreeId(ids)							//Removes lowest available id from ids and returns it
	freeId(ids, id, safe)						//Adjusts ids so id will be included
}

nodeExec.js {
	execNode(node)								
}