(() => () => {})()();
(() => () => console.log( 'effect' ))()();

(() => () => () => {})()()();
(() => () => () => console.log( 'effect' ))()()();

const removed1 = () => () => {};
removed1()();
const retained1 = () => () => console.log( 'effect' );
retained1()();

(() => {
	return () => {};
})()();

(() => {
	return () => console.log( 'effect' );
})()();

(() => ({ foo: () => {} }))().foo();
(() => ({ foo: () => console.log( 'effect' ) }))().foo();

(() => ({ foo: () => ({ bar: () => ({ baz: () => {} }) }) }))().foo().bar().baz();
(() => ({ foo: () => ({ bar: () => console.log( 'effect' ) }) }))().foo().bar();
