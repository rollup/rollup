(function () {
	'use strict';

	const retained1a = {
		get effect () {
			console.log( 'effect' );
		},
		get noEffect () {
			const x = 1;
			return x;
		}
	};

	const retained1b = retained1a.effect;

	const retained3 = {
		set effect ( value ) {
			console.log( value );
		}
	};

	retained3.effect = 'retained';

	const retained7 = {
		foo: () => {},
		get foo () {
			return 1;
		}
	};

	retained7.foo();

}());
