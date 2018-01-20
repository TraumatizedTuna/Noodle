noodle.string = {
    //Removes amount chars at end of str
    trimEnd(str, amount) {
        return str.substr(0, str.length - amount);
    },

    random(noodle, contProb = 0.7) {
        var str = '';
        var chars = 'abcdefghijklmnopqrstuvwxyzåäöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789§½!"#¤%&/()=+?´`@£${[]}\¨^~'+"'"+'*<>|,;.:-_';
        while (Math.random() < contProb) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    },
};