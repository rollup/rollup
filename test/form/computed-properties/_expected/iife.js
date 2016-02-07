(function (exports) {
	'use strict';

	var foo = 'foo';

	var x = {[foo]: 'bar'};

	exports.x = x;

}((this.computedProperties = this.computedProperties || {})));
