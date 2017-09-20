import Variable from './Variable';

export default class LocalVariable extends Variable {
	constructor ( name, declarator, init ) {
		super( name );
		this.isReassigned = false;
		this.exportName = null;
		this.declarations = new Set( declarator ? [ declarator ] : null );
		this.assignedExpressions = new Set( init ? [ init ] : null );
		this.calls = new Set();
	}

	addDeclaration ( identifier ) {
		this.declarations.add( identifier );
	}

	addCall ( callOptions ) {
		// To prevent infinite loops
		if ( this.calls.has( callOptions ) ) return;
		this.calls.add( callOptions );
		Array.from( this.assignedExpressions ).forEach( expression => expression.bindCall( callOptions ) );
	}

	assignExpressionAtPath ( path, expression ) {
		if ( path.length === 0 ) {
			this.assignedExpressions.add( expression );
			this.isReassigned = true;
			Array.from( this.calls ).forEach( callOptions => expression.bindCall( callOptions ) );
		}
	}

	getName ( es ) {
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return this.included
			|| (path.length > 0 && Array.from( this.assignedExpressions ).some( node =>
				!options.hasNodeBeenAssignedAtPath( path, node ) &&
				node.hasEffectsWhenAssignedAtPath( path, options.addAssignedNodeAtPath( path, node ) )
			));
	}

	hasEffectsWhenCalled ( options ) {
		return Array.from( this.assignedExpressions ).some( node =>
			!options.hasNodeBeenCalled( node )
			&& node.hasEffectsWhenCalled( options.getHasEffectsWhenCalledOptions( node ) )
		);
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		return this.included
			|| Array.from( this.assignedExpressions ).some( node =>
				!options.hasNodeBeenMutatedAtPath( path, node ) &&
				node.hasEffectsWhenMutatedAtPath( path, options.addMutatedNodeAtPath( path, node ) )
			);
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
