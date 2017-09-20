export default class Variable {
	constructor ( name ) {
		this.name = name;
	}

	addCall () {}

	addReference () {}

	assignExpressionAtPath () {}

	getName () {
		return this.name;
	}

	hasEffectsWhenAssignedAtPath () {
		return true;
	}

	hasEffectsWhenCalled () {
		return true;
	}

	hasEffectsWhenMutatedAtPath () {
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
