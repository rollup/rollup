import { virtual } from './entry-_virtual/_virtualModule-es-.mjs';
import { virtual2 } from './entry-_virtual/_virtualWithExt-es-js.js.mjs';
import { virtual3 } from './entry-_virtual/_virtualWithAssetExt-es-str.str.str.mjs';

assert.equal(virtual, 'Virtual!');
assert.equal(virtual2, 'Virtual2!');
assert.equal(virtual3, 'Virtual3!');
