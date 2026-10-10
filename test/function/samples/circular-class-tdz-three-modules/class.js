import { wrapped } from './middle.js';

export class Box {
	constructor(value) {
		this.value = value;
	}
}

export function start() {
	return wrapped.value;
}
