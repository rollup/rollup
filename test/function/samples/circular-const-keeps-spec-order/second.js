import { order } from './order.js';
import { readSecond } from './first.js';

order.push('second');

export const second = 1;

export function read() {
	return readSecond();
}
