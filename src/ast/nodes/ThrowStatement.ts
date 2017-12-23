import Node from '../Node';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class ThrowStatement extends Node {
	type: 'ThrowStatement';
	argument: Expression;

	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
