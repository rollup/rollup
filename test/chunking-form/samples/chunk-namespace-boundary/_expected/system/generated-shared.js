System.register([], (function (exports) {
        'use strict';
        return {
                execute: (function () {

                        var commonjsGlobal = exports("c", typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});

                        commonjsGlobal.data = [4, 5, 6];
                        var shared = exports("s", commonjsGlobal.data);

                })
        };
}));
