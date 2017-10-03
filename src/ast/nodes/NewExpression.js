import Node from '../Node.js';

export default class NewExpression extends Node {
	bind () {
		super.bind();
		this.callee.bindCallAtPath( [], { withNew: true } );
	}

	hasEffects ( options ) {
		return this.included
			|| this.arguments.some( child => child.hasEffects( options ) )
			|| this.callee.hasEffectsWhenCalledAtPath( [], options.getHasEffectsWhenCalledOptions( this.callee ) );
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}
}
