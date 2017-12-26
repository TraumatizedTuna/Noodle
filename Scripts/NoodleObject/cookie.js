noodle.cookie = {
    get(noodle) {
        var cookieStr = document.cookie;
        if (document.cookie.length) {
            var cookie = JSON.parse(document.cookie.substr(5));
            return cookie;
        }
        return {};
    },
    set(noodle, key, val, extra = '') {
        var cookieObj = noodle.cookie.get(noodle);
        cookieObj[key] = val;
        var cookieStr = JSON.stringify(cookieObj);
        document.cookie = 'main=' + cookieStr;
    }
};