import { a } from './generated-manual.js';
import './generated-b.js';

import('./generated-tla.js').then(n => console.log(n.b, a));
