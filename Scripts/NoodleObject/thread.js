noodle.thread = {
    count: 0,
    queue: [],

    inc(noodle) {
        noodle.thread.count++;
    },
    dec(noodle) {
        noodle.thread.count--;
        $.ajax({
            //ajax options{
            async: true,
            type: 'GET',
            url: '',
            //}
            success(data) {
                noodle.thread.runQueue();
            }
        });
    },
    wait(conditions, actions) {
        for (var i in conditions) {

        }
    },
    runQueue() {
        var queue = noodle.thread.queue;
        for (var i in queue) {
            //If condition evaluates to true, perform action
            if (expr.eval($.extend(true, {}, queue[i].cond))) {
                expr.eval(queue[i].action);
                if (!queue.stayInQueue) {
                    //Remove from queue
                }
            }
        }
    }
};