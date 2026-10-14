import { v as value } from './generated-shared.js';

console.log(() => import('./generated-p.js'));
console.log(value);
await import('./generated-d.js');
