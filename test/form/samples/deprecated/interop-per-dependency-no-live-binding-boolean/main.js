import fooFalse, { barFalse } from 'external-false';
import fooTrue, { barTrue } from 'external-true';
import * as externalFalse from 'external-false';
import * as externalTrue from 'external-true';

console.log(fooFalse, barFalse, externalFalse);
console.log(fooTrue, barTrue, externalTrue);

import('external-false').then(console.log);
import('external-true').then(console.log);
