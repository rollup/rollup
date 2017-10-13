'use strict';

(() => () => console.log( 'effect' ))()();

(() => () => () => console.log( 'effect' ))()()();

const retained1 = () => () => console.log( 'effect' );
retained1()();

const retained2 = () => {
	return () => console.log( 'effect' );
};
retained2()();
