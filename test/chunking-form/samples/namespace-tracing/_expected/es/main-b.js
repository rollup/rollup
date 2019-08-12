import { b as broken } from './generated-broken.js';
import { f as foo } from './generated-foo.js';
import { b as bar } from './generated-bar.js';

foo();
broken();
bar();
broken();
