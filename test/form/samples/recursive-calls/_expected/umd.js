(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	const retained1 = () => globalVar ? retained1() : console.log( 'effect' );
	retained1();

	const retained2 = () => globalVar ? () => retained2()() : () => console.log( 'effect' );
	retained2()();

	const retained3 = () => globalVar ? retained3() : {};
	retained3().x.y = 3;

	const retained4 = () => globalVar ? retained4() : { x: () => console.log( 'effect' ) };
	retained4().x();

	const retained5 = {
		get x () {
			return globalVar ? retained5.x : console.log( 'effect' );
		}
	};
	retained5.x;

	const retained6 = {
		get x () {
			return globalVar ? retained6.x : () => console.log( 'effect' );
		}
	};
	retained6.x();

	const retained7 = {
		get x () {
			return globalVar ? retained7.x : {};
		}
	};
	retained7.x.y.z = 7;

	const retained8 = {
		get x () {
			return globalVar ? retained8.x : { y: () => console.log( 'effect' ) };
		}
	};
	retained8.x.y();

}));
