import Node from '../Node.js';

export default class NewExpression extends Node {
	bind () {
		super.bind();
		this.callee.bindCall( { withNew: true } );
	}

	hasEffects ( options ) {
		return this.included
			|| this.arguments.some( child => child.hasEffects( options ) )
			|| this.callee.hasEffectsWhenCalled( options.getHasEffectsWhenCalledOptions( this.callee ) );
	}
}
