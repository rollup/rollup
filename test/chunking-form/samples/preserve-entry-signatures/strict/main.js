import { shared } from './lib.js';

export const nonEssential = 'non-essential';
export const dynamic = import('./dynamic.js');

globalThis.sharedStatic = shared;
