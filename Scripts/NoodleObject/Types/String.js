noodle.string = {
    //Removes amount chars at end of str
    trimEnd(str, amount) {
        return str.substr(0, str.length - amount);
    }
};