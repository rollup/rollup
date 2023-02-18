import { s as small } from './generated-small.js';

const result = small + '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';
console.log(result);

const generated = 'generated' + result;

export { generated as g, result as r };
