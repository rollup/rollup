import { foo, bar } from './foobar.js';

var baz = foo;
var baz = bar;

assert.ok(baz.bar);
