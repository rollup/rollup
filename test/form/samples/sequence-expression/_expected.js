function foo$1 () {
    console.log( 'foo' );
}

// should remove expressions without side-effect, multiple effects
(foo(), foo(), 2);
// without white-space, effect at the end
(foo());

// should only keep final expression
var d = (2);
console.log(d);

// should keep f import
(foo$1());

// should properly render complex sub-expressions
((() => {console.log(foo$1());})(), 1);

// should maintain this context
var module$1 = {};
module$1.bar = function () { console.log( 'bar' );};
(0, module$1.bar)();
