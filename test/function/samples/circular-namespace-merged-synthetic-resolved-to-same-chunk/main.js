import { getKeys } from './impl.js';

assert.deepStrictEqual(getKeys().sort(), ['foo', 'getKeys']);
