define(['exports', './_virtual/other'], (function (exports, other) { 'use strict';

	var hasRequiredOther;

	function requireOther () {
		if (hasRequiredOther) return other.__exports;
		hasRequiredOther = 1;
		other.__exports.value = 43;
		return other.__exports;
	}

	exports.__require = requireOther;

}));
