import Node from '../Node.js';

export default class NewExpression extends Node {
	hasEffects ( options ) {
		return this.included
			|| this.arguments.some( child => child.hasEffects( options ) )
			|| this.callee.hasEffectsWhenCalledAtPath( [], { withNew: true }, options.getHasEffectsWhenCalledOptions() );
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}
}
