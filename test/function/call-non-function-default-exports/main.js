import foo from './foo.js';
foo();

assert.ok( /[xy]/.test( global.answer ) );
