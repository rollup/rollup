define(['external', './other', './_virtual/other'], (function (require$$0, other$1, other) { 'use strict';

	const external = require$$0;
	const { value } = other.__exports;

	console.log(external, value);

	var commonjs = 42;

	return commonjs;

}));
