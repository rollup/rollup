import { m } from './m.js';
import('./x.js').then(n => console.log(n.x, m));
