import Node from '../Node.js';

export default class ArrayExpression extends Node {
	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}
}
