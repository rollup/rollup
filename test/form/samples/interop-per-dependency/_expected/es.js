import * as fooAuto from 'external-auto';
import fooAuto__default, { barAuto } from 'external-auto';
import * as fooDefault from 'external-default';
import fooDefault__default, { barDefault } from 'external-default';
import * as fooDefaultOnly from 'external-defaultOnly';
import fooDefaultOnly__default from 'external-defaultOnly';
import * as fooEsModule from 'external-esModule';
import fooEsModule__default, { barEsModule } from 'external-esModule';

console.log(fooAuto__default, barAuto, fooAuto);
console.log(fooDefault__default, barDefault, fooDefault);
console.log(fooDefaultOnly__default, fooDefaultOnly);
console.log(fooEsModule__default, barEsModule, fooEsModule);

import('external-auto').then(console.log);
import('external-default').then(console.log);
import('external-defaultOnly').then(console.log);
import('external-esModule').then(console.log);
import(globalThis.external1).then(console.log);
import(globalThis.external2).then(console.log);
