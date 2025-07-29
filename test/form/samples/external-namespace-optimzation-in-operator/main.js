import * as nc from 'node:crypto';
import * as ext from './ext.js';
import * as pt from './passthrough.js';

export const crypto = 'webcrypto' in nc;
export const direct = 'whatever' in ext;
export const indirect = 'whatever' in pt;
