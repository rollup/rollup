export default class Variable {
	constructor ( name, declarator, init ) {
		this.name = name;
		this.declarator = declarator;

		this.isReassigned = false;
		this.exportName = null;

		this.duplicates = [];
		this.assignedExpressions = new Set( init ? [ init ] : null );
	}

	addReference () {
		/* noop? */
	}

	assignExpression ( expression ) {
		this.assignedExpressions.add( expression );
		this.isReassigned = true;
	}

	gatherPossibleValues ( values ) {
		this.assignedExpressions.forEach( value => values.add( value ) );
	}

	getName ( es ) {
		// TODO destructuring...
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	includeDeclaration () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		this.declarator.includeInBundle();
		this.duplicates.forEach( duplicate => duplicate.includeDeclaration() );
		return true;
	}

	toString () {
		return this.name;
	}
}
