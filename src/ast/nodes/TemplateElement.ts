import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class TemplateElement extends NodeBase {
	tail!: boolean;
	type!: NodeType.tTemplateElement;
	value!: {
		cooked: string | null;
		raw: string;
	};

	hasEffects() {
		return false;
	}
}
