System.register([], function (exports, module) {
        'use strict';
        return {
                execute: function () {

                        var commonjsGlobal = exports('a', typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});

                        commonjsGlobal.data = [4, 5, 6];
                        var shared = commonjsGlobal.data;
                        exports('b', shared);

                }
        };
});
