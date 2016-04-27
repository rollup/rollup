(function (exports,external) {
	'use strict';

	var foo = 'unused';

	const quux = 1;

	const other = () => quux;

	function bar () {
		return foo;
	}

	function baz () {
		return 13 + external.value;
	}

	exports.baz = baz;
	exports.strange = quux;

}((this.stirred = this.stirred || {}),external));
