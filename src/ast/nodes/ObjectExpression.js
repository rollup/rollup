import Node from '../Node.js';

export default class ObjectExpression extends Node {
	hasEffectsWhenMutated () {
		return false;
	}
}
