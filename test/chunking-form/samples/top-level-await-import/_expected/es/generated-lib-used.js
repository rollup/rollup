import { g as getInfo } from './generated-lib.js';

function getInfoWithUsed() {
	return getInfo() + '_used';
}

export { getInfoWithUsed };
