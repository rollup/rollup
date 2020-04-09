import * as NodeType from './NodeType';
import { GenericEsTreeNode, NodeBase } from './shared/Node';

export default class TemplateElement extends NodeBase {
	tail!: boolean;
	type!: NodeType.tTemplateElement;
	value!: {
		cooked: string | null;
		raw: string;
	};

	bind() {}

	hasEffects() {
		return false;
	}

	include() {
		this.included = true;
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		this.value = esTreeNode.value;
		super.parseNode(esTreeNode);
	}

	render() {}
}
