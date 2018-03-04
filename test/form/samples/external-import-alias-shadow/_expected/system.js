System.register(['acorn'], function (exports, module) {
	'use strict';
	var parse;
	return {
		setters: [function (module) {
			parse = module.parse;
		}],
		execute: function () {

			function parse$1(source) {
				return parse(source, { ecmaVersion: 6 });
			}

			console.log(parse$1('foo'));

		}
	};
});
