import Variable from './Variable';

export default class LocalVariable extends Variable {
	constructor ( name, declarator, init ) {
		super( name );
		this.isReassigned = false;
		this.exportName = null;
		this.declarations = new Set( declarator ? [ declarator ] : null );
		this.assignedExpressions = new Set( init ? [ init ] : null );
	}

	addDeclaration ( identifier ) {
		this.declarations.add( identifier );
	}

	addReference () {}

	assignExpression ( expression ) {
		this.assignedExpressions.add( expression );
		this.isReassigned = true;
	}

	gatherPossibleValues ( values ) {
		this.assignedExpressions.forEach( expression => values.add( expression ) );
	}

	getName ( es ) {
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	hasEffectsWhenMutated ( options ) {
		return this.included
			|| Array.from( this.assignedExpressions ).some( node => node.hasEffectsWhenMutated( options ) );
	}

	includeDeclaration () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		this.declarations.forEach( identifier => identifier.includeInBundle() );
		return true;
	}

	toString () {
		return this.name;
	}
}
