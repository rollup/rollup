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
		this.calls = new DeepSet();
	}

	addDeclaration ( identifier ) {
		this.declarations.add( identifier );
	}

	addCallAtPath ( path, callOptions ) {
		if ( this.calls.hasAtPath( path, callOptions ) ) return;
		this.calls.addAtPath( path, callOptions );
		this.assignedExpressions.forEachAtPath( path, ( relativePath, node ) =>
			node.bindCallAtPath( relativePath, callOptions ) );
	}

	assignExpressionAtPath ( path, expression ) {
		if ( this.assignedExpressions.hasAtPath( path, expression ) ) return;
		this.assignedExpressions.addAtPath( path, expression );
		if ( path.length > 0 ) {
			this.assignedExpressions.forEachAtPath( path.slice( 0, -1 ), ( relativePath, node ) =>
				node.bindAssignmentAtPath( [ ...relativePath, ...path.slice( -1 ) ], expression ) );
		}
		this.calls.forEachAtPath( path, ( relativePath, callOptions ) =>
			expression.bindCallAtPath( relativePath, callOptions ) );
		if ( path.length === 0 ) {
			this.isReassigned = true;
		}
	}

	getName ( es ) {
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return this.included
			|| this.assignedExpressions.someAtPath( path, ( relativePath, node ) =>
				relativePath.length > 0
				&& !options.hasNodeBeenAssignedAtPath( relativePath, node )
				&& node.hasEffectsWhenAssignedAtPath( relativePath, options.addAssignedNodeAtPath( relativePath, node ) ) );
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		return this.assignedExpressions.someAtPath( path, ( relativePath, node ) => {
			if ( relativePath.length === 0 ) {
				return !options.hasNodeBeenCalled( node )
					&& node.hasEffectsWhenCalledAtPath( [], options.getHasEffectsWhenCalledOptions( node ) );
			}
			return node.hasEffectsWhenCalledAtPath( relativePath, options );
		} );
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		return this.included
			|| this.assignedExpressions.someAtPath( path, ( relativePath, node ) => {
				if ( relativePath.length === 0 ) {
					return !options.hasNodeBeenMutated( node )
						&& node.hasEffectsWhenMutatedAtPath( [], options.addMutatedNode( node ) );
				}
				return node.hasEffectsWhenMutatedAtPath( relativePath, options );
			} );
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
