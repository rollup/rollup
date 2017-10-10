(() => () => {})()();
(() => () => console.log( 'effect' ))()();

(() => () => () => {})()()();
(() => () => () => console.log( 'effect' ))()()();

const foo = () => () => {};
foo()();
const bar = () => () => console.log('effect');
bar()();
