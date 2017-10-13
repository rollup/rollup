import Node from '../Node.js';
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
			return path.length > 0
				|| this.value.hasEffectsWhenCalledAtPath( [], this._callOptions,
					options.getHasEffectsWhenCalledOptions( this, this._callOptions ) );
		}
		return this.value.hasEffectsWhenAccessedAtPath( path, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( this.kind === 'set' ) {
			return path.length > 0
				|| this.value.hasEffectsWhenCalledAtPath( [], this._callOptions,
					options.getHasEffectsWhenCalledOptions( this, this._callOptions ) );
		}
		return this.value.hasEffectsWhenAssignedAtPath( path, options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( this.kind === 'get' ) {
			return true;
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
		this._callOptions = { withNew: false };
	}

	render ( code, es ) {
		if ( !this.shorthand ) {
			this.key.render( code, es );
		}
		this.value.render( code, es );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction ) {
		if ( this.kind === 'get' ) {
			return true;
		}
		return this.value.someReturnExpressionWhenCalledAtPath( path, callOptions, predicateFunction );
	}
}
