'use strict';

var $ = require('jquery');
$ = 'default' in $ ? $['default'] : $;

$( function () {
	$( 'body' ).html( '<h1>hello world!</h1>' );
});
