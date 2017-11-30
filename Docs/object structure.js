wire {
	node node0,
	port port0,
	node node1,
	port port1,
	string id,
	int p0Ind,
	int p1Ind
}

node {
	string label,
	nodeCore core,
	nodeCore default,
	string  html,
	string id
}

nodeCore {
	string name,
	string color,
	port[] inPorts,
	array inVals,
	port[] outPorts,
	array outVals,
	function func,
	object data,
	function[] resetFuncs,
	string htmlContent
}

port {
	string name,
	string type,
	bool isIn,
	var value,
	string valId,
	node parentNode,
	wire[] wires,
	string id
}