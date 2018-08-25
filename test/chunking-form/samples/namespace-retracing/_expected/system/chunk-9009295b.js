System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			class Broken {
			} exports('b', Broken);

			Broken.doSomething = function() { console.log('broken'); };

			Broken.doSomething();

			class Other {
			} exports('a', Other);

			Other.doSomething = function() { console.log('other'); };

		}
	};
});
