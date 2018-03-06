System.register('stirred', ['external'], function (exports, module) {
	'use strict';
	var value, more;
	return {
		setters: [function (module) {
			value = module.value;
			more = module.more;
		}],
		execute: function () {

			exports('baz', baz);
			var foo = 'unused';

			const quux = exports('strange', 1);

			const other = () => quux;

			function bar () {
				return foo;
			}

			function baz () {
				return 13 + value;
			}

			const moreExternal = more;

			var create = exports('create', Object.create), getPrototypeOf = exports('getPrototypeOf', Object.getPrototypeOf);

		}
	};
});
