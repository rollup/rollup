(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	const effect = () => console.log( 'effect' );
	var { x: a2 = effect() } = {};
	var { x: a3 = () => {} } = { x: effect };
	a3();
	var { x: a4 = effect } = {};
	a4();
	var b2;
	({ x: b2 = effect() } = {});
	var b3;
	({ x: b3 = () => {} } = { x: effect });
	b3();
	var b4;
	({ x: b4 = effect } = {});
	b4();
	var [ c2 = effect() ] = [];
	var [ c3 = () => {} ] = [ effect ];
	c3();
	var [ c4 = effect ] = [];
	c4();
	var d2;
	[ d2 = effect() ] = [];
	var d3;
	[ d3 = () => {} ] = [ effect ];
	d3();
	var d4;
	[ d4 = effect ] = [];
	d4();

})));
