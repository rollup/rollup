import { order } from './order.js';
import { value } from './value.js';

order.push('class');

export class Holder {
	field = value;
}

export function later() {
	return new Holder().field;
}
