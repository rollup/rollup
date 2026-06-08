define(['exports'], (function (exports) { 'use strict';

	// There is no reason for this to end up in a different chunk as the other dep
	const dep$1 = 'dep1';

	// There is no reason for this to end up in a different chunk as the other dep
	const dep = 'dep2';

	exports.dep = dep$1;
	exports.dep$1 = dep;

}));
