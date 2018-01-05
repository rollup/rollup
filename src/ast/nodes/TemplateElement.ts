import { GenericNode } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class TemplateElement extends GenericNode {
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
