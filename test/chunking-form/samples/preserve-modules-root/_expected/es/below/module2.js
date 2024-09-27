import { __require as requireMyBasePkg } from '../custom_modules/@my-scope/my-base-pkg/index.js';

var module;
var hasRequiredModule;

function requireModule () {
	if (hasRequiredModule) return module;
	hasRequiredModule = 1;
	const base2 = requireMyBasePkg();

	module = {
	  base2,
	};
	return module;
}

export { requireModule as __require };
