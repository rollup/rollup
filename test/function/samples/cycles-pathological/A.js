import B from './B';

export default class A {
	constructor () {
		this.isA = true;
	}

	b () {
		return new B();
	}
}
