import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class UnknownNode extends Node {
	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
