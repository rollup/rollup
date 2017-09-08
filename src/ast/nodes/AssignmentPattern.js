import Node from '../Node.js';

export default class AssignmentPattern extends Node {
	hasEffectsWhenAssigned ( options ) {
		return this.left.hasEffectsWhenAssigned( options );
	}
}
