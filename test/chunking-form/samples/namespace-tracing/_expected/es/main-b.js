import { a as broken } from './generated-chunk.js';
import { a as foo } from './generated-chunk2.js';
import { a as bar } from './generated-chunk3.js';

foo();
broken();
bar();
broken();
