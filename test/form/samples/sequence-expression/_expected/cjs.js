'use strict';

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

// should infer value
// should keep f import
var e = (foo$1());
