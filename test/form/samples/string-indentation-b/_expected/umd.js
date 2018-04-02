(function (global, factory) {
    typeof module === 'object' && module.exports ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

    var a = 'a',
        b = 'b';

    assert.equal( a, 'a' );
    assert.equal( b, 'b' );

})));
