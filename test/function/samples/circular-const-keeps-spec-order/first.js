import { order } from './order.js';
import { second } from './second.js';

order.push('first');

export const first = second + 1;

export function readSecond() {
	return second;
}
