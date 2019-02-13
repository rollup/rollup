System.register(['acorn'], function (exports, module) {
	'use strict';
	var parse$1;
	return {
		setters: [function (module) {
			parse$1 = module.parse;
		}],
		execute: function () {

			function parse(source) {
				return parse$1(source, { ecmaVersion: 6 });
			}

			console.log(parse('foo'));

		}
	};
});
