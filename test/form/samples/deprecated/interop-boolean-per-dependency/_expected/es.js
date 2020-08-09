import * as fooFalse from 'external-false';
import fooFalse__default, { barFalse } from 'external-false';
import * as fooTrue from 'external-true';
import fooTrue__default, { barTrue } from 'external-true';

console.log(fooFalse__default, barFalse, fooFalse);
console.log(fooTrue__default, barTrue, fooTrue);

import('external-false').then(console.log);
import('external-true').then(console.log);
