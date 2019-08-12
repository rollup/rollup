define(['./generated-shared'], function (shared) { 'use strict';

	shared.commonjsGlobal.fn = d => d + 1;
	var cjs = shared.commonjsGlobal.fn;

	var main1 = shared.d.map(cjs);

	return main1;

});
