noodle.ui = {
    menus: {
        addAirMenu(container, content, position) {
            //var cont = document.getElementById("mainCont0");
            container.insertAdjacentHTML('beforeend', '<div class="menu airMenu" id="airMenu"></div>');
            var menuEl = document.getElementById("airMenu");
            menuEl.style.left = position.x - 8 + "px";
            menuEl.style.top = position.y - 8 + "px";
            menuEl.innerHTML = ''; //In case menu is opened again before it's closed
            for (var i in content) {
                menuEl.insertAdjacentHTML('beforeend', '<div class="menuRow" id="mr' + i + '">' + content[i].label + '</div>');
                var rowEl = document.getElementById('mr' + i);
                rowEl.obj = content[i];
                //rowEl.onmousedown = content[i].func;
                rowEl.onmousedown = function(e){
                    var contObj = e.target.obj;
                    noodle.expr.eval(noodle, contObj.expr);
                };
            }

            noodle.global.active.menuEl = menuEl;
            $('#airMenu').mouseleave(function (e) {
                //noodle.global.active.menuEl.remove();
                e.target.parentElement.remove();
                noodle.global.active.menuEl = null;
            });
        }
    }
};