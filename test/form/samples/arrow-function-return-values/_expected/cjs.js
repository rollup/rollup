'use strict';

(() => () => console.log( 'effect' ))()();

(() => () => () => console.log( 'effect' ))()()();

const bar = () => () => console.log('effect');
bar()();
