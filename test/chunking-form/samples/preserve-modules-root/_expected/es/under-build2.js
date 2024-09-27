import { __require as requireMyBasePkg } from './custom_modules/@my-scope/my-base-pkg/index.js';

var underBuild;
var hasRequiredUnderBuild;

function requireUnderBuild () {
	if (hasRequiredUnderBuild) return underBuild;
	hasRequiredUnderBuild = 1;
	const base = requireMyBasePkg();

	underBuild = {
		base
	};
	return underBuild;
}

export { requireUnderBuild as __require };
