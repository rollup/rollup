System.register(['factory', 'baz', 'shipping-port', 'alphabet'], function (exports, module) {
	'use strict';
	var factory, foo, bar, port, forEach, a, alphabet;
	return {
		setters: [function (module) {
			factory = module.default;
		}, function (module) {
			foo = module.foo;
			bar = module.bar;
		}, function (module) {
			port = module.port;
			forEach = module.forEach;
		}, function (module) {
			a = module.a;
			alphabet = module.default;
		}],
		execute: function () {

			factory( null );
			foo( bar, port );
			forEach( console.log, console );
			console.log( a );
			console.log( alphabet.length );

		}
	};
});
