export default class Variable {
	constructor ( name ) {
		this.name = name;
	}

	addReference () {}

	assignExpressionAtPath () {}

	getName () {
		return this.name;
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 0;
	}

	hasEffectsWhenAssignedAtPath () {
		return true;
	}

	hasEffectsWhenCalledAtPath () {
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
