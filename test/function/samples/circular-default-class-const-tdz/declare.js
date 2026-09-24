import { num } from './use.js';

export default class Num {
	constructor(value) {
		this.value = value;
	}
}

export function start() {
	return num.value;
}
