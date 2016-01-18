define(['acorn'], function (acorn) { 'use strict';

	function parse$1(source) {
		return acorn.parse(source, { ecmaVersion: 6 });
	}

	console.log(parse$1('foo'));

});
