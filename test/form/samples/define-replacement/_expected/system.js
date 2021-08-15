System.register([], (function () {
    'use strict';
    return {
        execute: (function () {

            var a = () => {
                console.log('props');
            };

            a();
            a();

        })
    };
}));
