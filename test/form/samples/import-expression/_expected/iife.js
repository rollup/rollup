(function (external) {
	'use strict';

	import(external.join('a', 'b'));
	console.log(external.join);

})(external);
