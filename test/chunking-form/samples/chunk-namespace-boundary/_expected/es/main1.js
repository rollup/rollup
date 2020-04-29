import { c as commonjsGlobal, s as shared } from './generated-shared.js';

commonjsGlobal.fn = d => d + 1;
var cjs = commonjsGlobal.fn;

var main1 = shared.map(cjs);

export default main1;
