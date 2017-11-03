import Node from '../Node.js';
import CallOptions from '../CallOptions';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class Property extends Node {
	bindAssignmentAtPath ( path, expression ) {
		if ( this.kind === 'get' ) {
			path.length > 0 && this.value.forEachReturnExpressionWhenCalledAtPath( [], this._accessorCallOptions,
				node => node.bindAssignmentAtPath( path, expression ) );
		} else if ( this.kind === 'set' ) {
			path.length === 0 && this.value.bindCallAtPath( [], CallOptions.create( { withNew: false, args: [ expression ] } ) );
		} else {
			this.value.bindAssignmentAtPath( path, expression );
		}
	}

	bindCallAtPath ( path, callOptions ) {
		if ( this.kind === 'get' ) {
			this.value.forEachReturnExpressionWhenCalledAtPath( [], this._accessorCallOptions,
				node => node.bindCallAtPath( path, callOptions ) );
		} else {
			this.value.bindCallAtPath( path, callOptions );
		}
	}

	forEachReturnExpressionWhenCalledAtPath ( path, callOptions, callback ) {
		if ( this.kind === 'get' ) {
			this.value.forEachReturnExpressionWhenCalledAtPath( [], this._accessorCallOptions,
				node => node.forEachReturnExpressionWhenCalledAtPath( path, callOptions, callback ) );
		} else {
			this.value.forEachReturnExpressionWhenCalledAtPath( path, callOptions, callback );
		}
	}

	hasEffects ( options ) {
		return this.key.hasEffects( options )
			|| this.value.hasEffects( options );
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		if ( this.kind === 'get' ) {
			return this.value.hasEffectsWhenCalledAtPath( [], this._accessorCallOptions, options.getHasEffectsWhenCalledOptions() )
				|| (!options.hasReturnExpressionBeenAccessedAtPath( path, this )
					&& this.value.someReturnExpressionWhenCalledAtPath( [], this._accessorCallOptions, innerOptions => node =>
						node.hasEffectsWhenAccessedAtPath( path, innerOptions.addAccessedReturnExpressionAtPath( path, this ) ), options ));
		}
		return this.value.hasEffectsWhenAccessedAtPath( path, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( this.kind === 'set' ) {
			return path.length > 0
				|| this.value.hasEffectsWhenCalledAtPath( [], this._accessorCallOptions, options.getHasEffectsWhenCalledOptions() );
		}
		if ( this.kind === 'get' ) {
			return path.length === 0
				|| this.value.someReturnExpressionWhenCalledAtPath( [], this._accessorCallOptions, innerOptions => node =>
					node.hasEffectsWhenAssignedAtPath( path, innerOptions.addAssignedReturnExpressionAtPath( path, this ) ), options );
		}
		return this.value.hasEffectsWhenAssignedAtPath( path, options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( this.kind === 'get' ) {
			return this.value.hasEffectsWhenCalledAtPath( [], this._accessorCallOptions, options.getHasEffectsWhenCalledOptions() )
				|| (!options.hasReturnExpressionBeenCalledAtPath( path, this )
					&& this.value.someReturnExpressionWhenCalledAtPath( [], this._accessorCallOptions, innerOptions => node =>
						node.hasEffectsWhenCalledAtPath( path, callOptions, innerOptions.addCalledReturnExpressionAtPath( path, this ) ), options ));
		}
		return this.value.hasEffectsWhenCalledAtPath( path, callOptions, options );
	}

	initialiseAndDeclare ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.initialiseNode( parentScope );
		this.key.initialise( parentScope );
		this.value.initialiseAndDeclare( parentScope, kind, UNKNOWN_ASSIGNMENT );
	}

	initialiseNode () {
		this._accessorCallOptions = CallOptions.create( { withNew: false } );
	}

	render ( code, es ) {
		if ( !this.shorthand ) {
			this.key.render( code, es );
		}
		this.value.render( code, es );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		if ( this.kind === 'get' ) {
			return this.value.hasEffectsWhenCalledAtPath( [], this._accessorCallOptions, options.getHasEffectsWhenCalledOptions() )
				|| this.value.someReturnExpressionWhenCalledAtPath( [], this._accessorCallOptions, innerOptions => node =>
					node.someReturnExpressionWhenCalledAtPath( path, callOptions, predicateFunction, innerOptions ), options );
		}
		return this.value.someReturnExpressionWhenCalledAtPath( path, callOptions, predicateFunction, options );
	}
}
