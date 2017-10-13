(() => () => {})()();
(() => () => console.log( 'effect' ))()();

(() => () => () => {})()()();
(() => () => () => console.log( 'effect' ))()()();

const removed1 = () => () => {};
removed1()();
const retained1 = () => () => console.log( 'effect' );
retained1()();

const removed2 = () => {
	return () => {};
};
removed2()();
const retained2 = () => {
	return () => console.log( 'effect' );
};
retained2()();
