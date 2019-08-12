(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global = global || self, factory(global.jQuery));
}(this, function ($) { 'use strict';

	$ = $ && $.hasOwnProperty('default') ? $['default'] : $;

	$( function () {
		$( 'body' ).html( '<h1>hello world!</h1>' );
	});

}));
