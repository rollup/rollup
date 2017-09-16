import Node from '../Node';

export default class MethodDefinition extends Node {
	bindCall ( callOptions ) {
		this.value.bindCall( callOptions );
	}

	hasEffects ( options ) {
		return this.key.hasEffects( options );
	}

	hasEffectsWhenCalled ( options ) {
		return this.value.hasEffectsWhenCalled( options );
	}
}
