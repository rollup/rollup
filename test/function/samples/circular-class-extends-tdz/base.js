import { child } from './child.js';

export class Base {
	constructor() {
		this.kind = 'base';
	}
}

export function start() {
	return child.kind;
}
