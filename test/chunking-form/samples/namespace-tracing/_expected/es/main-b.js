import { f as foo } from './generated-foo.js';
import { b as bar } from './generated-bar.js';
import { b as broken } from './generated-broken.js';

foo();
broken();
bar();
broken();
