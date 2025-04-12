import { g as getInfo } from './generated-lib.js';

let getCommonInfo = getInfo;

function wrapper(cb) {
	return cb();
}

const { getInfoWithVariant } = await wrapper(() => import('./generated-lib-variant.js'));
getCommonInfo = getInfoWithVariant;

export { getCommonInfo };
