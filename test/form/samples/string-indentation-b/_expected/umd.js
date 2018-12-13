(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

    var a = 'a',
        b = 'b';

    assert.equal( a, 'a' );
    assert.equal( b, 'b' );

}));
