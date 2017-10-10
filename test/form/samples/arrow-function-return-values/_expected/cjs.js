'use strict';

(() => () => console.log( 'effect' ))()();

(() => () => () => console.log( 'effect' ))()()();
