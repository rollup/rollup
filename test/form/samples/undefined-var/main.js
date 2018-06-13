var x;
var y = undefined;
var z;
if (x ? (console.log('a'), false) : (console.log('b'), true))
	 console.log('yes');
if (y ? (console.log('a'), false) : (console.log('b'), false))
	console.log('no');
if (z ? (console.log('a'), false) : (console.log('b'), false))
	console.log('yes');
z = 1;
