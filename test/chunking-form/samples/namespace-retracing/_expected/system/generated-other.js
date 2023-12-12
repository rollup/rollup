System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			class Broken {
			} exports("B", Broken);

			Broken.doSomething = function() { console.log('broken'); };

			Broken.doSomething();

			class Other {
			} exports("O", Other);

			Other.doSomething = function() { console.log('other'); };

		})
	};
}));
