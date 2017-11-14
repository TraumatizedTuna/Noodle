var noodle = {
    

    
    functions: {
        getArg(noodle, arg) {
            return arg;
        }
    },

    //Finds nearest ancestor with useNoodle on and returns its noodle. If none is found, return noodle
    getNoodle(noodle, obj) {
        return noodle.expr.eval(noodle, obj.noodleExp);
    }
}