import * as NodeType from './NodeType';
import { GenericEsTreeNode, NodeBase } from './shared/Node';

export default class TemplateElement extends NodeBase {
	declare tail: boolean;
	declare type: NodeType.tTemplateElement;
	declare value: {
		cooked: string | null;
		raw: string;
	};

	// Do not try to bind value
	bind(): void {}

	hasEffects(): boolean {
		return false;
	}

	include(): void {
		this.included = true;
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		this.value = esTreeNode.value;
		super.parseNode(esTreeNode);
	}

	render(): void {}
}
