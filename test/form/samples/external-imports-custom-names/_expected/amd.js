define(['jquery'], function ($) { 'use strict';

	$ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;

	$( function () {
		$( 'body' ).html( '<h1>hello world!</h1>' );
	});

});
