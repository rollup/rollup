import { a as value } from './generated-chunk.js';

console.log('virtual', value);
new Worker(new URL('load.js', import.meta.url).href);

console.log('main', value);
