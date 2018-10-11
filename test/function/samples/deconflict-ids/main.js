import './conflict1.js';
import './conflict2.js';
import foo from './used.js';

assert.equal(foo(1), 2);
