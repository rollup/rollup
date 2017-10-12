import Node from '../Node.js';

export default class NewExpression extends Node {
	hasEffects ( options ) {
		return this.included
			|| this.arguments.some( child => child.hasEffects( options ) )
			|| this.callee.hasEffectsWhenCalledAtPath( [], this._callOptions,
				options.getHasEffectsWhenCalledOptions( this, this._callOptions ) );
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	initialiseNode () {
		this._callOptions = { withNew: true };
	}
}
