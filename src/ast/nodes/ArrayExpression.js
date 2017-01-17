import Node from '../Node.js';
import { ARRAY, unknown } from '../values.js';

class ArrayValue {
	constructor ( node ) {
		this.node = node;
		this.values = node.elements.map( element => element.run() );
	}

	getProperty ( name ) {
		return unknown; // TODO return values, or prototype methods etc
	}
	setProperty ( name, value ) {
		// TODO
	}
}

export default class ArrayExpression extends Node {
	gatherPossibleValues ( values ) {
		values.add( ARRAY );
	}

	run () {
		return new ArrayValue( this );
	}
}
