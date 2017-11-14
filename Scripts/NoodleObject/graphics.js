noodle.graphics = {
    svg: {
        //Returns svg code for curve between (x0, y0) and (x1, y1) based on ctrlDist and slack
        autoBez(x0, y0, x1, y1, ctrlDist, slack) {
            //Calculate delta values{
            var dx = (x1 - x0) * ctrlDist;
            var dy = Math.abs(y1 - y0);
            var dxMin = 128;
            if (dxMin > dy)
                dxMin = dy;
            if (dx < dxMin)
                dx = dxMin;
            //if(dx > dy)
            //    dx = dy;
            //}

            slack *= Math.pow(dx, 0.5) / Math.pow(dy + 100, .5) * 10;

            //Return svg string representing curve
            return 'M' + x0 + ' ' + y0 + ' C ' + (x0 + dx) + ' ' + (y0 + slack) + ', ' + (x1 - dx) + ' ' + (y1 + slack) + ', ' + x1 + ' ' + y1;
        }
    },
    box: {
        add(color, transformable, pos, dims) {
            var box = noodle.graphics.box.new(color, transformable, pos, dims);
            //TODO: Render
        },
        new(color, transformable, pos, dims) {
            //var box =
            var style = noodle.graphics.color.style(color);

        }
    },
    transformable: {
        //Data{
        scale: false,
        offsetX: 0,
        offsetY: 0,
        edges: { left: false, top: false, right: false, bottom: false },
        //}

        //Functions{
        borderSensorFunc() {
            noodle.events.mousemove.setActiveTool(noodle.events.toolBox.scale); //Or should it just replace everything?
            noodle.global.active.nodeEl = noodle.misc.html.getParentNodeEl(this);

            noodle.graphics.transformable.edges.left = noodle.misc.html.hasClass(this, "bsl");
            noodle.graphics.transformable.edges.top = noodle.misc.html.hasClass(this, "bst");
            noodle.graphics.transformable.edges.right = noodle.misc.html.hasClass(this, "bsr");
            noodle.graphics.transformable.edges.bottom = noodle.misc.html.hasClass(this, "bsb");
        },

        close() {
            //TODO: Remove js object
            var nodeEl = noodle.misc.html.getParentNodeEl(this);
            var node = noodle.node.getObj(noodle, nodeEl);

            noodle.node.disconnect(noodle, node); //TODO: Noodle from noodle expression
            noodle.ids.forget(noodle.ids.freeList.node, parseInt(node.id.substr(1), 10), true); //This needs to be before the next line, right?
            noodle.node.forEachPort(node.core, noodle.port.forget);
            container.forest.splice(container.forest.indexOf(node), 1);

            nodeEl.remove();

            console.info('nodeClose() - id: ' + node.id + ', name: ' + node.core.name);
        },
        topBarFunc(e) {
            noodle.global.active.nodeEl = this.parentElement.parentElement;
            noodle.events.mousemove.setActiveTool(noodle.events.toolBox.move);
            var left = noodle.global.active.nodeEl.style.left;
            left = left.substring(0, left.length - 2);
            var top = noodle.global.active.nodeEl.style.top;
            top = top.substring(0, top.length - 2);
            noodle.graphics.transformable.offsetX = left - e.pageX; //Might cause problems with automatic positioning?
            noodle.graphics.transformable.offsetY = top - e.pageY;
        },
        maximize: null
        //}
    },
    color: {
        style(color) {
            var style = "";
            if (color != "default") {
                style = ' style = "background-color: ';
                if (color == "random") {
                    style += "hsl(" + Math.random() * 255 + "," + Math.random() * 80 + 20 + "%," + Math.sqrt(Math.random()) * 90 + 10 + '%)"';
                }
                else style += color + '"';
            }
            return style;
        }
    }
};