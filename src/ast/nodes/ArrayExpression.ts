import Node from '../Node';

export default class ArrayExpression extends Node {
	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}
}
