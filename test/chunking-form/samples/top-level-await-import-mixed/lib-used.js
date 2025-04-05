import { getInfo } from './lib.js';

export function getInfoWithUsed() {
	return getInfo() + '_used';
}
