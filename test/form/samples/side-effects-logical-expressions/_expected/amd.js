define((function () { 'use strict';

	// effect
	console.log( 'effect' );
	console.log( 'effect' );
	console.log( 'effect' ) || {};
	console.log( 'effect' ) && {};

	const foo = {
		get effect () {
			console.log( 'effect' );
		},
		get noEffect () {}
	};

	// effect
	(foo).effect;
	(foo).effect;

	// effect
	(null).foo = 1;
	(null).foo = 1;

	// effect
	(true)();
	(false)();
	((() => console.log( 'effect' )))();
	((() => console.log( 'effect' )))();

	// effect
	(true)()();
	(false)()();
	((() => () => console.log( 'effect' )))()();
	((() => () => console.log( 'effect' )))()();

}));
