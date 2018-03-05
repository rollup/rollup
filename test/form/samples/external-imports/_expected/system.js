System.register(['factory', 'baz', 'shipping-port', 'alphabet'], function (exports, module) {
	'use strict';
	var factory, foo, bar, port, forEach, alphabet, a;
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
			alphabet = module.default;
			a = module.a;
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
