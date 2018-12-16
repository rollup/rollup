(function (factory) {
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	factory(global.jQuery);
}(function ($) { 'use strict';

	$ = $ && $.hasOwnProperty('default') ? $['default'] : $;

	$( function () {
		$( 'body' ).html( '<h1>hello world!</h1>' );
	});

}));
