import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ObjectPattern extends Node {
	assignExpression () {
		this.eachChild( child => child.assignExpression( UNKNOWN_ASSIGNMENT ) );
	}

	hasEffectsWhenAssigned () {
		return this.someChild( child => child.hasEffectsWhenAssigned() );
	}
}
