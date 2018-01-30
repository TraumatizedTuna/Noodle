noodle.number = {
    random(noodle, contProb=0.8) {
        var num = 0;

        while (Math.random() < contProb) {
            num += Math.random();
        }
        return num;
    }
}