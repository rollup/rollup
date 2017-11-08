function curry1 ( fn ) {
	return function f1 ( a ) {
		return fn.apply( this, arguments );
	};
}

var always = curry1( function always ( val ) {
	return function () {
		return val;
	};
} );

var T = always(true);
