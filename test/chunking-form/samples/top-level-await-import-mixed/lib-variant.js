import { getInfo } from './lib.js';

export function getInfoWithVariant() {
	return getInfo() + '_variant';
}
