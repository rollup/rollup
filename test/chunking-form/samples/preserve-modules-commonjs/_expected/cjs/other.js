'use strict';

var other = require('./_virtual/other.js');

var hasRequiredOther;

function requireOther () {
	if (hasRequiredOther) return other.__exports;
	hasRequiredOther = 1;
	other.__exports.value = 43;
	return other.__exports;
}

exports.__require = requireOther;
