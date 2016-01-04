(function (exports) {
	'use strict';

	var FOO = 'foo';

	console.log( FOO );
	console.log( FOO );
	console.log( FOO );

	exports.FOO = FOO;

}((this.myBundle = {})));
