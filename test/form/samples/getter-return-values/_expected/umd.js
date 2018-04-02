(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	({
		get foo () {
			console.log( 'effect' );
			return {};
		}
	}).foo.bar;
	({
		get foo () {
			return {};
		}
	}).foo.bar.baz;
	({
		get foo () {
			console.log( 'effect' );
			return () => {};
		}
	}).foo();
	({
		get foo () {
			return () => console.log( 'effect' );
		}
	}).foo();
	({
		get foo () {
			console.log( 'effect' );
			return () => () => {};
		}
	}).foo()();
	({
		get foo () {
			return () => () => console.log( 'effect' );
		}
	}).foo()();

})));
