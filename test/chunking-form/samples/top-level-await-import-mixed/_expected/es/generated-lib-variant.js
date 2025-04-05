import { g as getInfo } from './generated-lib.js';

function getInfoWithVariant() {
	return getInfo() + '_variant';
}

export { getInfoWithVariant };
