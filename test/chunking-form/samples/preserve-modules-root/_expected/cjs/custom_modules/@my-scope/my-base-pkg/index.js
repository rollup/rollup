'use strict';

var index = require('../../../_virtual/index.js');

var hasRequiredMyBasePkg;

function requireMyBasePkg () {
	if (hasRequiredMyBasePkg) return index.__exports;
	hasRequiredMyBasePkg = 1;

	Object.defineProperty(index.__exports, '__esModule', { value: true });

	var hello = 'world';

	index.__exports.hello = hello;
	return index.__exports;
}

exports.__require = requireMyBasePkg;
