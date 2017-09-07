export default class Variable {
	constructor ( name ) {
		this.name = name;
	}

	addCall () {}

	getName () {
		return this.name;
	}

	hasEffectsWhenCalled () {
		return true;
	}

	hasEffectsWhenMutated () {
		return true;
	}

	includeVariable () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		return true;
	}
}
