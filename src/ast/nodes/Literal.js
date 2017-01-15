import Node from '../Node.js';

export default class Literal extends Node {
	gatherPossibleValues ( values ) {
		values.add( this );
	}

	render ( code ) {
		if ( typeof this.value === 'string' ) {
			code.indentExclusionRanges.push([ this.start + 1, this.end - 1 ]);
		}
	}

	run () {
		return this;
	}
}
