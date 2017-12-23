import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class TemplateElement extends Node {
	type: 'TemplateElement';
	tail: boolean;
	value: {
		cooked: string;
		raw: string;
	};

	hasEffects (_options: ExecutionPathOptions) {
		return false;
	}
}
