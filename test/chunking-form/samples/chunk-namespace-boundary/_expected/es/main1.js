import { c as commonjsGlobal, d } from './generated-chunk.js';

commonjsGlobal.fn = d => d + 1;
var cjs = commonjsGlobal.fn;

var main1 = d.map(cjs);

export default main1;
