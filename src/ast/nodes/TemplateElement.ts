import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class TemplateElement extends NodeBase {
	declare parent: nodes.TemplateElementParent;
	declare type: NodeType.tTemplateElement;
	declare value: {
		cooked?: string;
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

	render(): void {}
}

TemplateElement.prototype.includeNode = onlyIncludeSelf;
