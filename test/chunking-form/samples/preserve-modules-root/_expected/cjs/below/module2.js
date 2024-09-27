'use strict';

var index = require('../custom_modules/@my-scope/my-base-pkg/index.js');

var module$1;
var hasRequiredModule;

function requireModule () {
	if (hasRequiredModule) return module$1;
	hasRequiredModule = 1;
	const base2 = index.__require();

	module$1 = {
	  base2,
	};
	return module$1;
}

exports.__require = requireModule;
