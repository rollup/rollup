import { num } from './use.js';

export class Num {
	constructor(value) {
		this.value = value;
	}
}

export function start() {
	return num.value;
}
