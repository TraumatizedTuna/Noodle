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


Object.defineProperty(CSSStyleSheet.prototype, 'serialize', { enumerable: false, writable: true, configurable: true, value: function () { return { serialized: undefined }; } });

noodle.object.shallowClone({
    noodle: noodle,
    obj: Object.prototype,
    clone: HTMLDivElement.prototype
});
noodle.object.shallowClone({
    noodle: noodle,
    obj: Object,
    clone: HTMLDivElement
});