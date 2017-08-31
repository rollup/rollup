import Node from '../Node.js';

export default class Literal extends Node {
	getValue () {
		return this.value;
	}

	gatherPossibleValues ( values ) {
		values.add( this );
	}

	hasEffectsWhenMutated () {
		return false;
	}

	render ( code ) {
		if ( typeof this.value === 'string' ) {
			code.indentExclusionRanges.push( [ this.start + 1, this.end - 1 ] );
		}
	}
}
