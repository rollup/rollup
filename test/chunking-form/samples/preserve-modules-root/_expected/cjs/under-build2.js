'use strict';

var index = require('./custom_modules/@my-scope/my-base-pkg/index.js');

var underBuild;
var hasRequiredUnderBuild;

function requireUnderBuild () {
	if (hasRequiredUnderBuild) return underBuild;
	hasRequiredUnderBuild = 1;
	const base = index.__require();

	underBuild = {
		base
	};
	return underBuild;
}

exports.__require = requireUnderBuild;
