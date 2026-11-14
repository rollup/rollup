import { shared } from './shared.js';

const m = await import('./m.js');

console.log(m.m, shared);
