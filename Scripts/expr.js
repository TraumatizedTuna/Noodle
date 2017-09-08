var expr0 = {
    func: noodle.math.add,
    args: [7, 3],
    ans: null,
    state: expr.ready
};

var expr = {
    //Evaluation states{
    ready: 0,
    done: 1,
    wait: 2,
    //}

    eval: function(exp){
        if(exp.state == expr.ready){
            exp.state = expr.wait;
            exp.ans = exp.func.apply(undefined, expr.evalAll(expr.args));
            exp.state = expr.done;
        }
        return exp.ans;
    },
    evalAll: function(exps){
        for(var i in exps){
            expr.eval(exps[i]);
        }
    }
};