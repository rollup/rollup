import Variable from './Variable';
import StructuredAssignmentTracker from './StructuredAssignmentTracker';

// To avoid infinite recursions
const MAX_PATH_LENGTH = 8;

export default class LocalVariable extends Variable {
	constructor ( name, declarator, init ) {
		super( name );
		this.isReassigned = false;
		this.exportName = null;
		this.declarations = new Set( declarator ? [ declarator ] : null );
		this.boundExpressions = new StructuredAssignmentTracker();
		init && this.boundExpressions.addAtPath( [], init );
		this.boundCalls = new StructuredAssignmentTracker();
	}

	addDeclaration ( identifier ) {
		this.declarations.add( identifier );
	}

	bindAssignmentAtPath ( path, expression ) {
		if ( path.length > MAX_PATH_LENGTH || this.boundExpressions.hasAtPath( path, expression ) ) return;
		this.boundExpressions.addAtPath( path, expression );
		this.boundExpressions.forEachAssignedToPath( path, ( subPath, node ) => {
			if ( subPath.length > 0 ) {
				expression.bindAssignmentAtPath( subPath, node );
			}
		} );
		if ( path.length > 0 ) {
			this.boundExpressions.forEachAtPath( path.slice( 0, -1 ), ( relativePath, node ) =>
				node.bindAssignmentAtPath( [ ...relativePath, ...path.slice( -1 ) ], expression ) );
		} else {
			this.isReassigned = true;
		}
		this.boundCalls.forEachAtPath( path, ( relativePath, callOptions ) =>
			expression.bindCallAtPath( relativePath, callOptions ) );
	}

	bindCallAtPath ( path, callOptions ) {
		if ( path.length > MAX_PATH_LENGTH || this.boundCalls.hasAtPath( path, callOptions ) ) return;
		this.boundCalls.addAtPath( path, callOptions );
		this.boundExpressions.forEachAtPath( path, ( relativePath, node ) =>
			node.bindCallAtPath( relativePath, callOptions ) );
	}

	getName ( es ) {
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return path.length > MAX_PATH_LENGTH
			|| this.boundExpressions.someAtPath( path, ( relativePath, node ) =>
				!options.hasNodeBeenAccessedAtPath( relativePath, node )
				&& node.hasEffectsWhenAccessedAtPath( relativePath, options
					.addAccessedNodeAtPath( relativePath, node ) ) );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return this.included
			|| path.length > MAX_PATH_LENGTH
			|| this.boundExpressions.someAtPath( path, ( relativePath, node ) =>
				relativePath.length > 0
				&& !options.hasNodeBeenAssignedAtPath( relativePath, node )
				&& node.hasEffectsWhenAssignedAtPath( relativePath, options
					.addAssignedNodeAtPath( relativePath, node ) ) );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return path.length > MAX_PATH_LENGTH
			|| (this.included && path.length > 0)
			|| this.boundExpressions.someAtPath( path, ( relativePath, node ) =>
				!options.hasNodeBeenCalledAtPathWithOptions( relativePath, node, callOptions )
				&& node.hasEffectsWhenCalledAtPath( relativePath, callOptions, options
					.addCalledNodeAtPathWithOptions( relativePath, node, callOptions ) )
			);
	}

	includeVariable () {
		if ( !super.includeVariable() ) {
			return false;
		}
		this.declarations.forEach( identifier => identifier.includeInBundle() );
		return true;
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		return path.length > MAX_PATH_LENGTH
			|| this.boundExpressions.someAtPath( path, ( relativePath, node ) =>
				!callOptions.hasNodeBeenCalledAtPath( relativePath, node )
				&& node.someReturnExpressionWhenCalledAtPath( relativePath, callOptions
					.addCalledNodeAtPath( relativePath, node ), predicateFunction, options ) );
	}

	toString () {
		return this.name;
	}
}
