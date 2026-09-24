import { Base } from './base.js';

export class Child extends Base {
	constructor() {
		super();
		this.kind = 'child';
	}
}

export const child = new Child();
