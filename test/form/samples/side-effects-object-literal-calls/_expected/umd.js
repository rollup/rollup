(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	const retained1 = { x: () => {} };
	retained1.y();

	const retained2 = { x: () => {} };
	retained2.x = {};
	retained2.x();

	const retained3 = { x: { y: () => console.log('effect') } };
	const retained4 = { x: { y: {} } };
	retained4.x = retained3.x;
	retained4.x.y();

	const retained5 = { x: () => {} };
	const retained6 = retained5;
	retained6.x = () => console.log('effect');
	retained5.x();

	const retained7 = { x: { y: () => {} } };
	const retained8 = { x: retained7.x };
	retained8.x.y = () => console.log( 'effect' );
	retained7.x.y();

}));
