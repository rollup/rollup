import * as ns from './other.js';

if (!ns.foo) console.log(1);
if (ns.foo()) console.log(2);
const foo = ns.foo;
foo.bar;
(true && ns.foo)();
