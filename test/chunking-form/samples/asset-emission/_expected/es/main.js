import { a as showImage } from './nested/chunk.js';

var logo = new URL('assets/logo1-25253976.svg', import.meta.url).href;

showImage(logo);
import('./nested/chunk2.js');
