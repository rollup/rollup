import Node from '../Node';

export default class ArrayExpression extends Node {
	type: 'ArrayExpression';
	hasEffectsWhenAccessedAtPath (path: string[]) {
		return path.length > 1;
	}
}
