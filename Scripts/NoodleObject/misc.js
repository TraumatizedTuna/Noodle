noodle.files = {
    //Uses ajax to give you the desired file
    getFile(path) {
        var fileData;
        $.ajax({
            async: false,
            type: 'GET',
            url: path,
            success(data) {
                fileData = data;
            }
        });
        return fileData;
    }
};