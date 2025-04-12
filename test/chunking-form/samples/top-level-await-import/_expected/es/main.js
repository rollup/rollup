import { g as getInfo } from './generated-lib.js';

let getCommonInfo = getInfo;

const { getInfoWithVariant } = await import('./generated-lib-variant.js');
getCommonInfo = getInfoWithVariant;

export { getCommonInfo };
