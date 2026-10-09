import { value } from './shared.js';

console.log(() => import('./p.js'));
console.log(value);
await import('./d.js');
