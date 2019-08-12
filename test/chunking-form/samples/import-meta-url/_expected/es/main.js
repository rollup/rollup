import { l as log } from './nested/chunk.js';

log('main: ' + import.meta.url);
import('./nested/chunk2.js');
