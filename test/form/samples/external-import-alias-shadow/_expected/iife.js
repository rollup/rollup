(function (acorn) {
	'use strict';

	function parse(source) {
		return acorn.parse(source, { ecmaVersion: 6 });
	}

	console.log(parse('foo'));

})(acorn);
