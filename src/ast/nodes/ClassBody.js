import Node from '../Node';

export default class ClassBody extends Node {
	bindCall ( callOptions ) {
		if ( this.classConstructor ) {
			this.classConstructor.bindCall( callOptions );
		}
	}

	hasEffectsWhenCalled ( options ) {
		if ( this.classConstructor ) {
			return this.classConstructor.hasEffectsWhenCalled( options );
		}
		return false;
	}

	initialiseNode () {
		this.classConstructor = this.body.find( method => method.kind === 'constructor' );
	}
}
