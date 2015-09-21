(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	factory(global.jQuery);
}(this || (typeof window !== 'undefined' && window), function ($) { 'use strict';

	$ = 'default' in $ ? $['default'] : $;

	$( function () {
		$( 'body' ).html( '<h1>hello world!</h1>' );
	});

}));
