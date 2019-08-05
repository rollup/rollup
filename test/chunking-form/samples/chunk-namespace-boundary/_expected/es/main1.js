import { c as commonjsGlobal, d } from './generated-shared.js';

commonjsGlobal.fn = d => d + 1;
var cjs = commonjsGlobal.fn;

var main1 = d.map(cjs);

export default main1;
