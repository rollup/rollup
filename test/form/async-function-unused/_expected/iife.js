(function () {
	'use strict';

	async function foo () {
		return 'foo';
	}

	foo().then( value => console.log( value ) );

}());
