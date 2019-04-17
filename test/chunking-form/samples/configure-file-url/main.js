import { asset as asset1, chunk as chunk1 } from 'resolved';
import { asset as asset2, chunk as chunk2 } from 'unresolved';

import('solved').then(result => console.log(result, chunk1, chunk2, asset1, asset2));

