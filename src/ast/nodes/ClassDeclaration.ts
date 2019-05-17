import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import ChildScope from '../scopes/ChildScope';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import ClassNode from './shared/ClassNode';
import { GenericEsTreeNode, Node } from './shared/Node';

export function isClassDeclaration(node: Node): node is ClassDeclaration {
	return node.type === NodeType.ClassDeclaration;
}

export default class ClassDeclaration extends ClassNode {
	id: Identifier;
	type: NodeType.tClassDeclaration;

	initialise() {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		if (esTreeNode.id !== null) {
			this.id = new this.context.nodeConstructors.Identifier(esTreeNode.id, this, this.scope
				.parent as ChildScope) as Identifier;
		}
		super.parseNode(esTreeNode);
	}

	render(code: MagicString, options: RenderOptions) {
		if (options.format === 'system' && this.id && this.id.variable.exportName) {
			code.appendLeft(
				this.end,
				` exports('${this.id.variable.exportName}', ${this.id.variable.getName()});`
			);
		}
		super.render(code, options);
	}
}
