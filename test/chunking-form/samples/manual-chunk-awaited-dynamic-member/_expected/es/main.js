import { s as shared } from './generated-shared.js';

const m = await import('./generated-manual.js');

console.log(m.m, shared);
