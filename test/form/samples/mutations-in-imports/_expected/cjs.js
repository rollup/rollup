'use strict';

const x$2 = { a: { b: () => {} } };
const y$2 = { a: x$2.a };

const x$1 = { a: { b: () => {} } };
const y$1 = { a: x$1.a };

const x = { a: { b: () => {} } };
const y = { a: x.a };

y$2.a.b = () => console.log( 'effect' );
x$2.a.b();

y$1.a.b = () => console.log( 'effect' );
x$1.a.b();

y.a.b = () => console.log( 'effect' );
x.a.b();
