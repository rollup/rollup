System.register([], function (exports, module) {
    'use strict';
    return {
        execute: function () {

            var a = () => {
                console.log('props');
            };

            a();
            a();

        }
    };
});
