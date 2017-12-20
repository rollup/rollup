import Node from '../Node';
import Expression from './Expression';

export default class ThrowStatement extends Node {
	type: 'ThrowStatement';
	argument: Expression;

	hasEffects () {
		return true;
	}
}
