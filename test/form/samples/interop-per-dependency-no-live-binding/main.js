import fooFalse, {barFalse} from 'external-false';
import fooTrue, {barTrue} from 'external-true';
import fooAuto, {barAuto} from 'external-auto';
import fooDefault, {barDefault} from 'external-default';
import fooDefaultOnly from 'external-defaultOnly';
import fooEsModule, {barEsModule} from 'external-esModule';
import * as externalFalse from 'external-false';
import * as externalTrue from 'external-true';
import * as externalAuto from 'external-auto';
import * as externalDefault from 'external-default';
import * as externalDefaultOnly from 'external-defaultOnly';
import * as externalEsModule from 'external-esModule';

console.log(fooFalse, barFalse, externalFalse);
console.log(fooTrue, barTrue, externalTrue);
console.log(fooAuto, barAuto, externalAuto);
console.log(fooDefault, barDefault, externalDefault);
console.log(fooDefaultOnly, externalDefaultOnly);
console.log(fooEsModule, barEsModule, externalEsModule);

import('external-false').then(console.log)
import('external-true').then(console.log)
import('external-auto').then(console.log)
import('external-default').then(console.log)
import('external-defaultOnly').then(console.log)
import('external-esModule').then(console.log)
