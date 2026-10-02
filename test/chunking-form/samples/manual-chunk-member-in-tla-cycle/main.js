import { a } from './a.js';
import('./tla.js').then(n => console.log(n.b, a));
