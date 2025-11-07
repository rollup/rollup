import { __require as requireMyBasePkg } from '../custom_modules/@my-scope/my-base-pkg/index.js';

var module$1;
var hasRequiredModule;

function requireModule () {
	if (hasRequiredModule) return module$1;
	hasRequiredModule = 1;
	const base2 = requireMyBasePkg();

	module$1 = {
	  base2,
	};
	return module$1;
}

export { requireModule as __require };
