import Variable from './Variable';
import DeepSet from './DeepSet';

export default class LocalVariable extends Variable {
	constructor ( name, declarator, init ) {
		super( name );
		this.isReassigned = false;
		this.exportName = null;
		this.declarations = new Set( declarator ? [ declarator ] : null );
		this.assignedExpressions = new DeepSet();
		init && this.assignedExpressions.addAtPath( [], init );
		this.calls = new Set();
	}

	addDeclaration ( identifier ) {
		this.declarations.add( identifier );
	}

	addCall ( callOptions ) {
		// To prevent infinite loops
		if ( this.calls.has( callOptions ) ) return;
		this.calls.add( callOptions );
		this.assignedExpressions.forEachAtPath( [], ( relativePath, expression ) => expression.bindCall( callOptions ) );
	}

	assignExpressionAtPath ( path, expression ) {
		this.assignedExpressions.addAtPath( path, expression );
		if ( path.length === 0 ) {
			this.isReassigned = true;
			this.calls.forEach( callOptions => expression.bindCall( callOptions ) );
		}
	}

	getName ( es ) {
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return this.included
			|| (path.length > 0 && this.assignedExpressions.someAtPath( path, ( relativePath, node ) =>
				relativePath.length > 0
				&& !options.hasNodeBeenAssignedAtPath( relativePath, node )
				&& node.hasEffectsWhenAssignedAtPath( relativePath, options.addAssignedNodeAtPath( relativePath, node ) )
			));
	}

	hasEffectsWhenCalled ( options ) {
		return this.assignedExpressions.someAtPath( [], ( relativePath, node ) =>
			!options.hasNodeBeenCalled( node )
			&& node.hasEffectsWhenCalled( options.getHasEffectsWhenCalledOptions( node ) )
		);
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		return this.included
			|| this.assignedExpressions.someAtPath( path, ( relativePath, node ) =>
				!options.hasNodeBeenMutatedAtPath( relativePath, node ) &&
				node.hasEffectsWhenMutatedAtPath( relativePath, options.addMutatedNodeAtPath( relativePath, node ) )
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
