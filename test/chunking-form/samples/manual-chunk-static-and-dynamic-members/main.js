import { a } from './mA.js';
import('./mB.js').then(n => console.log(n.b, a));
