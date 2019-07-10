import { s as showImage } from './nested/chunk.js';

var logo = new URL('assets/logo1-a5ec488b.svg', import.meta.url).href;

showImage(logo);
import('./nested/chunk2.js');
