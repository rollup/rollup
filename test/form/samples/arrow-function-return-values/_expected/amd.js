define(function () { 'use strict';

	(() => () => console.log( 'effect' ))()();
	(() => () => () => console.log( 'effect' ))()()();
	const retained1 = () => () => console.log( 'effect' );
	retained1()();

	(() => {
		return () => console.log( 'effect' );
	})()();
	(() => ({ foo: () => console.log( 'effect' ) }))().foo();
	(() => ({ foo: () => ({ bar: () => console.log( 'effect' ) }) }))().foo().bar();

});
