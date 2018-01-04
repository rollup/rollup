import { BasicNode } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class TemplateElement extends BasicNode {
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
