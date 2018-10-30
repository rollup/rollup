import './conflict1.js';
import foo from './used.js';
import './conflict2.js';

assert.equal(foo(1), 2);
