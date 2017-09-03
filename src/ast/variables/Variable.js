export default class Variable {
	constructor ( name ) {
		this.name = name;
	}

	getName () {
		return this.name;
	}

	hasEffectsWhenMutated () {
		return true;
	}
}
