import { order } from './order.js';
import { num } from './use.js';

order.push('declare');

export class Num {
	constructor(value) {
		this.value = value;
	}
}

export function start() {
	return num.value;
}
