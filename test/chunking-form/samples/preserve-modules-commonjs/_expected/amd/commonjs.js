define(['exports', 'external', './other'], (function (exports, require$$0, other) { 'use strict';

	var commonjs;
	var hasRequiredCommonjs;

	function requireCommonjs () {
		if (hasRequiredCommonjs) return commonjs;
		hasRequiredCommonjs = 1;
		const external = require$$0;
		const { value } = other.__require();

		console.log(external, value);

		commonjs = 42;
		return commonjs;
	}

	exports.__require = requireCommonjs;

}));
