import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { type GenericEsTreeNode, NodeBase } from './shared/Node';

export default class TemplateElement extends NodeBase {
	declare type: NodeType.tTemplateElement;
	declare value: {
		cooked: string | null;
		raw: string;
	};

	get tail(): boolean {
		return isFlagSet(this.flags, Flag.tail);
	}
	set tail(value: boolean) {
		this.flags = setFlag(this.flags, Flag.tail, value);
	}

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
