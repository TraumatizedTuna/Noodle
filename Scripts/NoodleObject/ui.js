noodle.ui = {
    menus: {
        addAirMenu(content, position) {
            var cont = document.getElementById("mainCont0");
            cont.insertAdjacentHTML('beforeend', '<div class="menu airMenu" id="airMenu"></div>');
            var menuEl = document.getElementById("airMenu");
            menuEl.style.left = position.x - 8 + "px";
            menuEl.style.top = position.y - 8 + "px";
            for (var i in content) {
                menuEl.insertAdjacentHTML('beforeend', '<div class="menuRow" id="mr' + i + '">' + content[i].label + '</div>');
                var rowEl = document.getElementById('mr' + i);
                rowEl.onmousedown = content[i].func;
            }

            noodle.global.active.menuEl = menuEl;
            $('#airMenu').mouseleave(function (e) {
                noodle.global.active.menuEl.remove();
                noodle.global.active.menuEl = null;
            });
        }
    }
};