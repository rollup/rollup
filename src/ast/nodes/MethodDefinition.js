import Node from '../Node';

export default class MethodDefinition extends Node {
	hasEffects ( options ) {
		return this.key.hasEffects( options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return path.length > 0
			|| this.value.hasEffectsWhenCalledAtPath( [], callOptions, options );
	}
}
