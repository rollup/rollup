System.register(['factory', 'baz', 'shipping-port', 'alphabet'], (function () {
	'use strict';
	var factory, foo, bar, port, containers, a, alphabet;
	return {
		setters: [function (module) {
			factory = module.default;
		}, function (module) {
			foo = module.foo;
			bar = module.bar;
		}, function (module) {
			port = module.port;
			containers = module;
		}, function (module) {
			a = module.a;
			alphabet = module.default;
		}],
		execute: (function () {

			factory( null );
			foo( bar, port );
			containers.forEach( console.log, console );
			console.log( a );
			console.log( alphabet.length );

		})
	};
}));
