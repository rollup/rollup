'use strict';

var main;
var hasRequiredMain;

function requireMain () {
	if (hasRequiredMain) return main;
	hasRequiredMain = 1;
	main = true;
	return main;
}

exports.__require = requireMain;
