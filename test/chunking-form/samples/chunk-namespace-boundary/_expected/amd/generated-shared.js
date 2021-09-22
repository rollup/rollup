define(['exports'], (function (exports) { 'use strict';

        var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

        commonjsGlobal.data = [4, 5, 6];
        var shared = commonjsGlobal.data;

        exports.commonjsGlobal = commonjsGlobal;
        exports.shared = shared;

}));
