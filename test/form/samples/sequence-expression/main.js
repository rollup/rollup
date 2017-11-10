import * as f from './foo';
// should remove expressions without side-effect, multiple effects
var a = (0, foo(), 1, foo(), 2);
// without white-space, effect at the end
var b = (0,1,foo());

// should remove variable without effect
var c = (1, 2);

// should only keep final expression
var d = (1, 2);
console.log(d);

// should infer value
if ((1, 2) !== 2) {
	console.log( 'effect' );
}

// should keep f import
var e = (0, f.foo());
