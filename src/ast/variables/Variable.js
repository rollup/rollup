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

	includeVariable () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		return true;
	}
}
