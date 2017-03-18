define(['jquery'], function ($) { 'use strict';

	$ = $ && 'default' in $ ? $['default'] : $;

	$( function () {
		$( 'body' ).html( '<h1>hello world!</h1>' );
	});

});
