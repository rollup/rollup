import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ArrayPattern extends Node {
	assignExpression () {
		this.eachChild( child => child.assignExpression( UNKNOWN_ASSIGNMENT ) );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.someChild( child => child.hasEffectsWhenAssigned( options ) );
	}
}
