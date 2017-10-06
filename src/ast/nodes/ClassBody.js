import Node from '../Node';

export default class ClassBody extends Node {
	hasEffectsWhenCalledAtPath ( path, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		if ( this.classConstructor ) {
			return this.classConstructor.hasEffectsWhenCalledAtPath( [], options );
		}
		return false;
	}

	initialiseNode () {
		this.classConstructor = this.body.find( method => method.kind === 'constructor' );
	}
}
