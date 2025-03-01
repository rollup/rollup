import { getInfo } from './lib.js';

export let getCommonInfo = getInfo;

const { getInfoWithVariant } = await import('./lib-variant.js');
getCommonInfo = getInfoWithVariant;
