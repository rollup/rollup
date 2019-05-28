define(function () { 'use strict';

    function foo$1 () {
        console.log( 'foo' );
    }

    // should remove expressions without side-effect, multiple effects
    var a = (foo(), foo(), 2);
    // without white-space, effect at the end
    var b = (foo());

    // should only keep final expression
    var d = (2);
    console.log(d);

    // should keep f import
    var e = (foo$1());

    // should properly render complex sub-expressions
    var g = ((() => {console.log(foo$1());})(), 1);

    // should maintain this context
    var module$1 = {};
    module$1.bar = function () { console.log( 'bar' );};
    var h = (0, module$1.bar)();

});
