import { b as broken } from './generated-chunk.js';
import { f as foo } from './generated-chunk2.js';
import { b as bar } from './generated-chunk3.js';

foo();
broken();
bar();
broken();
