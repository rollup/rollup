import * as foo from './foo';

if (foo[Symbol.toStringTag]) console.log('OK');
else console.log('FAIL');

if (foo.bar) console.log('OK');
else console.log('FAIL');

if (foo.foo) console.log('FAIL');
else console.log('OK');
