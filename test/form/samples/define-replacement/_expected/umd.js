(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof enifed === 'function' && enifed.amd ? enifed(factory) :
    factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

    var a = () => {
        console.log('props');
    };

    a();
    a();

}));
