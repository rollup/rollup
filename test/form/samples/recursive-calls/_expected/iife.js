(function () {
	'use strict';

	const retained1 = () => globalVar ? retained1() : console.log( 'effect' );
	retained1();

	const retained2 = () => () => globalVar ? retained2()() : console.log( 'effect' );
	retained2()();

	const retained3 = () => globalVar ? retained3() : {};
	retained3().x.y = 3;

	const retained4 = () => globalVar ? retained4() : { x: () => console.log( 'effect' ) };
	retained4().x();

}());
