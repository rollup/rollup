import api from './api/index.js';
import { sideEffects } from './api/sideEffects';

api.namespace.sideEffectFunction();

assert.deepStrictEqual(sideEffects, ['fn called']);
