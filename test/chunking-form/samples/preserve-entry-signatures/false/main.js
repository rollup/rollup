import { shared } from './lib.js';

export const unused = 'unused';
export const dynamic = import('./dynamic.js');

globalThis.sharedStatic = shared;
