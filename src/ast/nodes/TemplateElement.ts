import { NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { NodeType } from './index';

export default class TemplateElement extends NodeBase {
	type: NodeType.TemplateElement;
	tail: boolean;
	value: {
		cooked: string;
		raw: string;
	};

	hasEffects (_options: ExecutionPathOptions) {
		return false;
	}
}
