import Node from '../Node.js';
import CallOptions from '../CallOptions';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class Property extends Node {
	bindAssignmentAtPath ( path, expression ) {
		this.value.bindAssignmentAtPath( path, expression );
	}

	hasEffects ( options ) {
		return this.included
			|| this.key.hasEffects( options )
			|| this.value.hasEffects( options );
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		if ( this.kind === 'get' ) {
			return this.value.hasEffectsWhenCalledAtPath( [], this._getterCallOptions, options.getHasEffectsWhenCalledOptions() )
				|| (!options.hasReturnExpressionBeenAccessedAtPath( path, this )
					&& this.value.someReturnExpressionWhenCalledAtPath( [], this._getterCallOptions, node =>
						node.hasEffectsWhenAccessedAtPath( path, options.addAccessedReturnExpressionAtPath( path, this ) ), options ));
		}
		return this.value.hasEffectsWhenAccessedAtPath( path, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( this.kind === 'set' ) {
			return path.length > 0
				|| this.value.hasEffectsWhenCalledAtPath( [], this._getterCallOptions, options.getHasEffectsWhenCalledOptions() );
		}
		return this.value.hasEffectsWhenAssignedAtPath( path, options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( this.kind === 'get' ) {
			return this.value.hasEffectsWhenCalledAtPath( [], this._getterCallOptions, options.getHasEffectsWhenCalledOptions() )
				|| (!options.hasReturnExpressionBeenCalledAtPath( path, this )
					&& this.value.someReturnExpressionWhenCalledAtPath( [], this._getterCallOptions, node =>
						node.hasEffectsWhenCalledAtPath( path, callOptions, options.addCalledReturnExpressionAtPath( path, this ) ), options ));
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
		this._getterCallOptions = CallOptions.create( { withNew: false } );
	}

	render ( code, es ) {
		if ( !this.shorthand ) {
			this.key.render( code, es );
		}
		this.value.render( code, es );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		if ( this.kind === 'get' ) {
			return this.value.hasEffectsWhenCalledAtPath( [], this._getterCallOptions, options.getHasEffectsWhenCalledOptions() )
				|| this.value.someReturnExpressionWhenCalledAtPath( [], this._getterCallOptions, node =>
					node.someReturnExpressionWhenCalledAtPath( path, callOptions, predicateFunction, options ), options );
		}
		return this.value.someReturnExpressionWhenCalledAtPath( path, callOptions, predicateFunction, options );
	}
}
