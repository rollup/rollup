import { g as getInfo } from './generated-lib.js';

let getCommonInfo = getInfo;

import('./generated-lib-used.js').then(({ getInfoWithUsed }) => {
	getCommonInfo = getInfoWithUsed;
});

const { getInfoWithVariant } = await import('./generated-lib-variant.js');
getCommonInfo = getInfoWithVariant;

export { getCommonInfo };
