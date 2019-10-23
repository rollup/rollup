(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    var a = 'a',
        b = 'b';

    assert.equal( a, 'a' );
    assert.equal( b, 'b' );

})));
