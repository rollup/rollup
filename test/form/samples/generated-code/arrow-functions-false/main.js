import 'externalNoImport';
import { b } from 'external';
export let a;

null, { a } = b;
console.log({ a } = b);

import('./main.js').then(console.log);

import('external').then(console.log);
export * from 'external';
export { foo } from 'external';

import defaultCompat from 'external';
console.log(defaultCompat);

import externalAuto from 'externalAuto';
console.log(externalAuto);

import * as externalDefault from 'externalDefault';
console.log(externalDefault);

import * as externalDefaultOnly from 'externalDefaultOnly';
console.log(externalDefaultOnly);
