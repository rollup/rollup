import { order } from './order.js';
import { later } from './class.js';

order.push('value');

export const value = 1;

export function read() {
	return later();
}
