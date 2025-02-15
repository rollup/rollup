import { getInfo } from './lib.js';

export let getCommonInfo = getInfo;

import('./lib-used.js').then(({ getInfoWithUsed }) => {
	getCommonInfo = getInfoWithUsed;
});

const { getInfoWithVariant } = await import('./lib-variant.js');
getCommonInfo = getInfoWithVariant;
