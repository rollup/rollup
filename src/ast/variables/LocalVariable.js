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

	getName ( es ) {
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	hasEffectsWhenCalled ( options ) {
		return Array.from( this.assignedExpressions ).some( node =>
			!options.hasNodeBeenCalled( node )
			&& node.hasEffectsWhenCalled( options.getHasEffectsWhenCalledOptions( node ) )
		);
	}

	hasEffectsWhenMutated ( options ) {
		return this.included
			|| Array.from( this.assignedExpressions ).some( node => node.hasEffectsWhenMutated( options ) );
	}

	includeVariable () {
		const hasBeenIncluded = super.includeVariable();
		if ( hasBeenIncluded ) {
			this.declarations.forEach( identifier => identifier.includeInBundle() );
		}
		return hasBeenIncluded;
	}

	toString () {
		return this.name;
	}
}
