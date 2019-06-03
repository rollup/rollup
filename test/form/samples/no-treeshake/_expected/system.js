System.register('stirred', ['external'], function (exports) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.value;
		}],
		execute: function () {

			var foo = 13;

			const quux = exports('strange', 1);

			const other = () => quux;

			function baz() {
				return foo + value;
			}

			var create = exports('create', Object.create),
				getPrototypeOf = exports('getPrototypeOf', Object.getPrototypeOf);

			function unusedButIncluded() {
				const unusedConst = 'unused';
				if (true) {
					true ? 'first' : 'second';
				} else {
					(true && 'first') || 'second';
				}
				'sequence', 'expression';
				switch ('test') {
					case 'test':
						(() => {})();
					case 'other':
						'no effect';
					default:
						const ignored = 2;
				}
			}

			function test(
				unusedParam = {
					prop: function test() {
						var unused = 1;
					}
				}
			) {}

			test({
				prop: function test() {
					var unused = 1;
				}
			});

		}
	};
});
