import { format } from 'node:util';

export { format, inspect, types } from 'node:util';
export { init } from './helpers.js';

export const describe = value => format('%o', value);
