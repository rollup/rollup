define(function () { 'use strict';

	var { x: b = globalFunction() } = {};

	var d;
	({ x: d = globalFunction() } = {});

	var [ f = globalFunction() ] = [];

	var h;
	[ h = globalFunction() ] = [];

});
