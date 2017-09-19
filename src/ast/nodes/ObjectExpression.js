import Node from '../Node.js';

export default class ObjectExpression extends Node {
	hasEffectsWhenMutatedAtPath ( path ) {
		return path.length > 1;
	}
}
