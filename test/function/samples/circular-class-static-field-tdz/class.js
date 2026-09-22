import { value } from './value.js';

export class Counter {
	static seen = value;
}

export function start() {
	return Counter.seen;
}
