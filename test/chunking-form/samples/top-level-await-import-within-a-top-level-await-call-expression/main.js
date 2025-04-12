import { getInfo } from './lib.js';

export let getCommonInfo = getInfo;

function wrapper(cb) {
	return cb();
}

const { getInfoWithVariant } = await wrapper(() => import('./lib-variant.js'));
getCommonInfo = getInfoWithVariant;
