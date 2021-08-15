(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	console.log( 1 );
	{
		var tmp = 10;
	}
	console.log( tmp );

}));
