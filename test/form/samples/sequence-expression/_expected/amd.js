define(function () { 'use strict';

	// should remove expressions without side-effect, multiple effects
	var a = (foo(), foo(), 2);
	// without white-space, effect at the end
	var b = (foo());

	// should only keep final expression
	var d = (2);
	console.log(d);

	// should infer value

});
