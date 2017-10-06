import Node from '../Node.js';

export default class NewExpression extends Node {
	hasEffects ( options ) {
		return this.included
			|| this.arguments.some( child => child.hasEffects( options ) )
			|| this.callee.hasEffectsWhenCalledAtPath( [], options.getHasEffectsWhenCalledOptions( this.callee, { withNew: true } ) );
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}
}
