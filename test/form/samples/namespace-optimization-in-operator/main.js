import * as foo from './foo';

if ('d' in foo) console.log(foo.d());
if ('c' in foo) console.log(foo.c());
console.log('c' in foo);
