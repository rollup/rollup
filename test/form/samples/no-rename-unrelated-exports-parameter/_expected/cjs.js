'use strict';

var modules = {
	foo: (unused, exports) => {
		console.log(exports.bar);
		eval('exports.bar = 1');
	}
};

module.exports = modules;
