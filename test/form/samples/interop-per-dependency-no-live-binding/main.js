import fooAuto, { barAuto } from 'external-auto';
import fooDefault, { barDefault } from 'external-default';
import fooDefaultOnly from 'external-defaultOnly';
import fooEsModule, { barEsModule } from 'external-esModule';
import * as externalAuto from 'external-auto';
import * as externalDefault from 'external-default';
import * as externalDefaultOnly from 'external-defaultOnly';
import * as externalEsModule from 'external-esModule';

console.log(fooAuto, barAuto, externalAuto);
console.log(fooDefault, barDefault, externalDefault);
console.log(fooDefaultOnly, externalDefaultOnly);
console.log(fooEsModule, barEsModule, externalEsModule);

import('external-auto').then(console.log);
import('external-default').then(console.log);
import('external-defaultOnly').then(console.log);
import('external-esModule').then(console.log);
