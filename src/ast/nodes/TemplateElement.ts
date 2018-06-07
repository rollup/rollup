import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class TemplateElement extends NodeBase {
	type: NodeType.tTemplateElement;
	tail: boolean;
	value: {
		cooked: string;
		raw: string;
	};

	hasEffects(_options: ExecutionPathOptions) {
		return false;
	}
}
